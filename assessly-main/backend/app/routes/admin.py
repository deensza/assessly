from flask import Blueprint, request, jsonify, current_app
from app.utils.auth import role_required
from app.services.moodle import create_moodle_service

admin_bp = Blueprint('admin', __name__)

# In-memory sandbox config (could be moved to DB later)
_sandbox_config = {
    'time_limit_seconds': 10,
    'memory_limit_mb': 256,
    'cpu_limit': 0.5,
    'allowed_languages': ['python', 'java', 'c']
}

# In-memory Moodle config
_moodle_config = {
    'api_url': '',
    'token': '',
    'enabled': False
}


@admin_bp.route('/sandbox/config', methods=['GET'])
@role_required('admin')
def get_sandbox_config():
    """Get current sandbox configuration."""
    return jsonify({'config': _sandbox_config}), 200


@admin_bp.route('/sandbox/config', methods=['PUT'])
@role_required('admin')
def update_sandbox_config():
    """Update sandbox configuration."""
    data = request.get_json()

    if 'time_limit_seconds' in data:
        _sandbox_config['time_limit_seconds'] = int(data['time_limit_seconds'])
    if 'memory_limit_mb' in data:
        _sandbox_config['memory_limit_mb'] = int(data['memory_limit_mb'])
    if 'cpu_limit' in data:
        _sandbox_config['cpu_limit'] = float(data['cpu_limit'])
    if 'allowed_languages' in data:
        _sandbox_config['allowed_languages'] = data['allowed_languages']

    return jsonify({
        'message': 'Sandbox configuration updated',
        'config': _sandbox_config
    }), 200


@admin_bp.route('/moodle/config', methods=['GET'])
@role_required('admin')
def get_moodle_config():
    """Get current Moodle configuration (token masked)."""
    return jsonify({
        'config': {
            'api_url': _moodle_config['api_url'],
            'enabled': _moodle_config['enabled'],
            'has_token': bool(_moodle_config['token']),
        }
    }), 200


@admin_bp.route('/moodle/config', methods=['PUT'])
@role_required('admin')
def update_moodle_config():
    """Save Moodle integration settings."""
    data = request.get_json()

    if 'api_url' in data:
        _moodle_config['api_url'] = data['api_url']
    if 'token' in data:
        _moodle_config['token'] = data['token']
    if 'enabled' in data:
        _moodle_config['enabled'] = bool(data['enabled'])

    return jsonify({
        'message': 'Moodle configuration updated',
        'config': {
            'api_url': _moodle_config['api_url'],
            'enabled': _moodle_config['enabled'],
            'has_token': bool(_moodle_config['token']),
        }
    }), 200


@admin_bp.route('/moodle/test', methods=['POST'])
@role_required('admin')
def test_moodle_connection():
    """Test Moodle API connection."""
    if not _moodle_config['api_url'] or not _moodle_config['token']:
        return jsonify({'error': 'Moodle not configured. Set API URL and token first.'}), 400

    try:
        svc = create_moodle_service(_moodle_config['api_url'], _moodle_config['token'])
        result = svc.test_connection()
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400
    except ConnectionError as e:
        return jsonify({'status': 'error', 'message': str(e)}), 502
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/moodle/assignments', methods=['GET'])
@role_required('admin', 'instructor')
def list_moodle_assignments():
    """Fetch assignments from Moodle."""
    if not _moodle_config.get('enabled'):
        return jsonify({'error': 'Moodle integration is disabled'}), 400

    try:
        svc = create_moodle_service(_moodle_config['api_url'], _moodle_config['token'])
        assignments = svc.get_assignments()
        return jsonify({'assignments': assignments}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/moodle/sync-grade', methods=['POST'])
@role_required('admin', 'instructor')
def sync_grade_to_moodle():
    """Push a grade to Moodle."""
    if not _moodle_config.get('enabled'):
        return jsonify({'error': 'Moodle integration is disabled'}), 400

    data = request.get_json()
    required = ['moodle_assignment_id', 'moodle_user_id', 'grade']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    try:
        svc = create_moodle_service(_moodle_config['api_url'], _moodle_config['token'])
        result = svc.push_grade(
            assignment_id=data['moodle_assignment_id'],
            user_id=data['moodle_user_id'],
            grade=data['grade'],
            feedback=data.get('feedback', '')
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

