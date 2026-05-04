from flask import Blueprint, request, jsonify, g, current_app
from app import db
from app.models import Submission, Assignment, TestCase, Course, CourseEnrollment, UserRole, SubmissionStatus
from app.services.pipeline import trigger_pipeline
from app.utils.auth import jwt_required, role_required

submissions_bp = Blueprint('submissions', __name__)


@submissions_bp.route('/run-tests', methods=['POST'])
@role_required('student')
def run_tests():
    """Run student code against visible test cases using Docker sandbox."""
    data = request.get_json()

    if not data or 'assignment_id' not in data or 'code' not in data or 'language' not in data:
        return jsonify({'error': 'assignment_id, code, and language are required'}), 400

    assignment = Assignment.query.get_or_404(data['assignment_id'])

    # Verify language is supported
    language = data['language']
    if language not in assignment.supported_languages:
        return jsonify({
            'error': f'Language not supported. Allowed: {assignment.supported_languages}'
        }), 400

    # Verify student is enrolled in the course
    enrolled = CourseEnrollment.query.filter_by(
        course_id=assignment.course_id,
        student_id=g.current_user.id
    ).first()
    if not enrolled:
        return jsonify({'error': 'Not enrolled in this course'}), 403

    # Get only visible test cases
    test_cases = TestCase.query.filter_by(
        assignment_id=assignment.id,
        is_hidden=False
    ).all()

    if not test_cases:
        return jsonify({
            'message': 'No visible test cases available',
            'results': [],
            'summary': {'total': 0, 'passed': 0, 'failed': 0}
        }), 200

    from app.services.sandbox import sandbox_service

    if sandbox_service.client is None:
        sandbox_service.init_app(current_app)

    results = []
    code = data['code']

    for tc in test_cases:
        sandbox_result = sandbox_service.run_code(
            code=code,
            language=language,
            stdin_input=tc.input,
            time_limit=assignment.time_limit_seconds,
            memory_limit=f"{assignment.memory_limit_mb}m"
        )

        actual_output = (sandbox_result.get('stdout') or '').strip()
        expected_output = tc.expected_output.strip()
        passed = (
            actual_output == expected_output
            and sandbox_result.get('exit_code') == 0
            and not sandbox_result.get('timed_out')
        )

        results.append({
            'test_case_id': tc.id,
            'input': tc.input,
            'expected_output': expected_output,
            'actual_output': actual_output,
            'stderr': sandbox_result.get('stderr') or None,
            'passed': passed,
            'execution_time_ms': sandbox_result.get('execution_time_ms'),
            'timed_out': sandbox_result.get('timed_out'),
            'error': sandbox_result.get('error')
        })

    passed_count = sum(1 for r in results if r['passed'])

    return jsonify({
        'results': results,
        'summary': {
            'total': len(results),
            'passed': passed_count,
            'failed': len(results) - passed_count
        }
    }), 200


@submissions_bp.route('', methods=['POST'])
@role_required('student')
def create_submission():
    """Submit code for evaluation."""
    data = request.get_json()

    if not data or 'assignment_id' not in data or 'code' not in data or 'language' not in data:
        return jsonify({'error': 'assignment_id, code, and language are required'}), 400

    assignment = Assignment.query.get_or_404(data['assignment_id'])

    # Verify language is supported
    if data['language'] not in assignment.supported_languages:
        return jsonify({
            'error': f'Language not supported. Allowed: {assignment.supported_languages}'
        }), 400

    # Verify student is enrolled in the course
    enrolled = CourseEnrollment.query.filter_by(
        course_id=assignment.course_id,
        student_id=g.current_user.id
    ).first()
    if not enrolled:
        return jsonify({'error': 'Not enrolled in this course'}), 403

    # Create submission
    submission = Submission(
        assignment_id=assignment.id,
        student_id=g.current_user.id,
        code=data['code'],
        language=data['language'],
        status=SubmissionStatus.pending
    )
    db.session.add(submission)
    db.session.commit()

    # Trigger evaluation pipeline in background thread
    trigger_pipeline(current_app._get_current_object(), submission.id)

    return jsonify({
        'message': 'Submission received. Evaluation in progress.',
        'submission': submission.to_dict()
    }), 201


@submissions_bp.route('/<int:submission_id>', methods=['GET'])
@jwt_required
def get_submission(submission_id):
    """Get submission with results."""
    submission = Submission.query.get_or_404(submission_id)
    user = g.current_user

    # Students can only see their own submissions
    if user.role == UserRole.student and submission.student_id != user.id:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify({
        'submission': submission.to_dict(include_results=True)
    }), 200


@submissions_bp.route('/assignment/<int:assignment_id>', methods=['GET'])
@role_required('instructor', 'admin')
def list_assignment_submissions(assignment_id):
    """Instructor views all submissions for an assignment."""
    assignment = Assignment.query.get_or_404(assignment_id)

    # Verify instructor owns the course
    if g.current_user.role == UserRole.instructor:
        course = Course.query.get(assignment.course_id)
        if course.instructor_id != g.current_user.id:
            return jsonify({'error': 'Access denied'}), 403

    submissions = Submission.query.filter_by(assignment_id=assignment_id)\
        .order_by(Submission.submitted_at.desc()).all()

    return jsonify({
        'submissions': [s.to_dict() for s in submissions]
    }), 200


@submissions_bp.route('/assignment/<int:assignment_id>/flagged', methods=['GET'])
@role_required('instructor', 'admin')
def list_flagged_submissions(assignment_id):
    """Instructor views flagged submissions for an assignment."""
    assignment = Assignment.query.get_or_404(assignment_id)

    # Verify instructor owns the course
    if g.current_user.role == UserRole.instructor:
        course = Course.query.get(assignment.course_id)
        if course.instructor_id != g.current_user.id:
            return jsonify({'error': 'Access denied'}), 403

    submissions = Submission.query.filter_by(
        assignment_id=assignment_id,
        flagged=True
    ).order_by(Submission.submitted_at.desc()).all()

    return jsonify({
        'submissions': [s.to_dict(include_results=True) for s in submissions]
    }), 200


@submissions_bp.route('/my', methods=['GET'])
@role_required('student')
def my_submissions():
    """Get all submissions for current student."""
    submissions = Submission.query.filter_by(
        student_id=g.current_user.id
    ).order_by(Submission.submitted_at.desc()).all()

    return jsonify({
        'submissions': [s.to_dict() for s in submissions]
    }), 200
