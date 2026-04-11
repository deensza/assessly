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
