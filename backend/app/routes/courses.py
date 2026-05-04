from flask import Blueprint, request, jsonify, g
from app import db
from app.models import Course, CourseEnrollment, UserRole
from app.utils.auth import jwt_required, role_required

courses_bp = Blueprint('courses', __name__)


@courses_bp.route('', methods=['POST'])
@role_required('instructor', 'admin')
def create_course():
    """Create a new course (instructor/admin only)."""
    data = request.get_json()

    if not data or 'title' not in data:
        return jsonify({'error': 'Course title is required'}), 400

    course = Course(
        title=data['title'],
        description=data.get('description', ''),
        instructor_id=g.current_user.id
    )
    db.session.add(course)
    db.session.commit()

    return jsonify({
        'message': 'Course created successfully',
        'course': course.to_dict()
    }), 201


@courses_bp.route('', methods=['GET'])
@jwt_required
def list_courses():
    """List courses filtered by user role."""
    user = g.current_user

    if user.role == UserRole.instructor:
        # Instructors see their own courses
        courses = Course.query.filter_by(instructor_id=user.id).all()
    elif user.role == UserRole.student:
        # Students see enrolled courses
        enrolled_ids = [e.course_id for e in user.enrollments.all()]
        courses = Course.query.filter(Course.id.in_(enrolled_ids)).all() if enrolled_ids else []
    else:
        # Admin sees all
        courses = Course.query.all()

    return jsonify({
        'courses': [c.to_dict(include_instructor=True) for c in courses]
    }), 200


@courses_bp.route('/all', methods=['GET'])
@jwt_required
def list_all_courses():
    """List all available courses (for enrollment)."""
    courses = Course.query.all()
    return jsonify({
        'courses': [c.to_dict(include_instructor=True) for c in courses]
    }), 200


@courses_bp.route('/<int:course_id>/enroll', methods=['POST'])
@role_required('student')
def enroll(course_id):
    """Student enrolls in a course."""
    course = Course.query.get_or_404(course_id)

    # Check if already enrolled
    existing = CourseEnrollment.query.filter_by(
        course_id=course_id,
        student_id=g.current_user.id
    ).first()
    if existing:
        return jsonify({'error': 'Already enrolled in this course'}), 409

    enrollment = CourseEnrollment(
        course_id=course_id,
        student_id=g.current_user.id
    )
    db.session.add(enrollment)
    db.session.commit()

    return jsonify({
        'message': 'Enrolled successfully',
        'enrollment': enrollment.to_dict()
    }), 201


@courses_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required
def get_course(course_id):
    """Get course details."""
    course = Course.query.get_or_404(course_id)
    return jsonify({'course': course.to_dict(include_instructor=True)}), 200

@courses_bp.route('/students', methods=['GET'])
@role_required('instructor', 'admin')
def list_instructor_students():
    """List students enrolled in instructor courses with performance stats."""
    from app.models import User, Submission

    user = g.current_user

    if user.role == UserRole.instructor:
        courses = Course.query.filter_by(instructor_id=user.id).all()
    else:
        courses = Course.query.all()

    course_ids = [course.id for course in courses]

    if not course_ids:
        return jsonify({
            'students': [],
            'summary': {
                'total_students': 0,
                'on_track': 0,
                'at_risk': 0
            }
        }), 200

    enrollments = CourseEnrollment.query.filter(
        CourseEnrollment.course_id.in_(course_ids)
    ).all()

    student_map = {}

    for enrollment in enrollments:
        student = User.query.get(enrollment.student_id)
        course = Course.query.get(enrollment.course_id)

        if not student or not course:
            continue

        if student.id not in student_map:
            student_map[student.id] = {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'courses': set(),
                'submissions_count': 0,
                'completed_submissions': 0,
                'average_grade': None,
                'status': 'At Risk'
            }

        student_map[student.id]['courses'].add(course.title)

    for student_id, item in student_map.items():
        submissions = Submission.query.filter_by(student_id=student_id).all()
        submissions = [
            sub for sub in submissions
            if sub.assignment and sub.assignment.course_id in course_ids
        ]

        completed = [sub for sub in submissions if sub.status.value == 'completed']
        graded = [sub for sub in completed if sub.final_score is not None]

        item['submissions_count'] = len(submissions)
        item['completed_submissions'] = len(completed)

        if graded:
            avg = sum(sub.final_score for sub in graded) / len(graded)
            item['average_grade'] = round(avg, 2)
            item['status'] = 'On Track' if avg >= 60 else 'At Risk'
        else:
            item['average_grade'] = None
            item['status'] = 'At Risk'

        item['courses'] = sorted(list(item['courses']))

    students = list(student_map.values())
    students.sort(key=lambda row: row['name'].lower())

    total_students = len(students)
    on_track = sum(1 for row in students if row['status'] == 'On Track')
    at_risk = total_students - on_track

    return jsonify({
        'students': students,
        'summary': {
            'total_students': total_students,
            'on_track': on_track,
            'at_risk': at_risk
        }
    }), 200

