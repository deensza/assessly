from flask import Blueprint, request, jsonify, current_app
from app.utils.auth import role_required

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
        'config': {k: v for k, v in _moodle_config.items() if k != 'token'}
    }), 200


@admin_bp.route('/moodle/test', methods=['POST'])
@role_required('admin')
def test_moodle_connection():
    """Test Moodle API connection."""
    if not _moodle_config['api_url'] or not _moodle_config['token']:
        return jsonify({'error': 'Moodle not configured'}), 400

    # Will be implemented in Phase 6 with actual Moodle API calls
    try:
        import requests
        response = requests.get(
            f"{_moodle_config['api_url']}/webservice/rest/server.php",
            params={
                'wstoken': _moodle_config['token'],
                'wsfunction': 'core_webservice_get_site_info',
                'moodlewsrestformat': 'json'
            },
            timeout=10
        )
        data = response.json()
        if 'exception' in data:
            return jsonify({'status': 'error', 'message': data.get('message', 'Unknown error')}), 400
        return jsonify({'status': 'connected', 'site_name': data.get('sitename', 'Unknown')}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
