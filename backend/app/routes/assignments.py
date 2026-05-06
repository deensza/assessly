from flask import Blueprint, request, jsonify, g
from app import db
from app.models import Assignment, TestCase, Course, CourseEnrollment, UserRole
from app.utils.auth import jwt_required, role_required

assignments_bp = Blueprint('assignments', __name__)


@assignments_bp.route('', methods=['POST'])
@role_required('instructor', 'admin')
def create_assignment():
    """Create an assignment with test cases."""
    data = request.get_json()

    # Validate required fields
    if not data or 'course_id' not in data or 'title' not in data:
        return jsonify({'error': 'course_id and title are required'}), 400

    # Verify instructor owns the course
    course = Course.query.get_or_404(data['course_id'])
    if g.current_user.role == UserRole.instructor and course.instructor_id != g.current_user.id:
        return jsonify({'error': 'You do not own this course'}), 403

    from datetime import datetime
    
    due_date_str = data.get('due_date')
    due_date_obj = None
    if due_date_str:
        # Handle ISO format ending with Z
        if due_date_str.endswith('Z'):
            due_date_str = due_date_str[:-1]
        try:
            due_date_obj = datetime.fromisoformat(due_date_str)
        except ValueError:
            pass

    assignment = Assignment(
        course_id=data['course_id'],
        title=data['title'],
        description=data.get('description', ''),
        due_date=due_date_obj,
        supported_languages=data.get('supported_languages', ['python', 'java', 'c']),
        time_limit_seconds=data.get('time_limit_seconds', 10),
        memory_limit_mb=data.get('memory_limit_mb', 256)
    )
    db.session.add(assignment)
    db.session.flush()  # Get the assignment ID

    # Create test cases
    test_cases = data.get('test_cases', [])
    for tc_data in test_cases:
        tc = TestCase(
            assignment_id=assignment.id,
            input=tc_data.get('input', ''),
            expected_output=tc_data.get('expected_output', ''),
            is_hidden=tc_data.get('is_hidden', False),
            weight=tc_data.get('weight', 1.0)
        )
        db.session.add(tc)

    db.session.commit()

    return jsonify({
        'message': 'Assignment created successfully',
        'assignment': assignment.to_dict(include_test_cases=True, hide_hidden=False)
    }), 201


@assignments_bp.route('/<int:assignment_id>', methods=['GET'])
@jwt_required
def get_assignment(assignment_id):
    """Get assignment details. Students see only visible test cases."""
    assignment = Assignment.query.get_or_404(assignment_id)
    user = g.current_user

    # Hide hidden test cases from students
    hide_hidden = user.role == UserRole.student

    return jsonify({
        'assignment': assignment.to_dict(include_test_cases=True, hide_hidden=hide_hidden)
    }), 200


@assignments_bp.route('/course/<int:course_id>', methods=['GET'])
@jwt_required
def list_course_assignments(course_id):
    """List all assignments for a course."""
    Course.query.get_or_404(course_id)
    user = g.current_user

    # Check student is enrolled
    if user.role == UserRole.student:
        enrolled = CourseEnrollment.query.filter_by(
            course_id=course_id,
            student_id=user.id
        ).first()
        if not enrolled:
            return jsonify({'error': 'Not enrolled in this course'}), 403

    assignments = Assignment.query.filter_by(course_id=course_id).order_by(Assignment.created_at.desc()).all()

    return jsonify({
        'assignments': [a.to_dict() for a in assignments]
    }), 200
