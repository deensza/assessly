from flask import Blueprint, request, jsonify, g
from app import db
from app.models import User, UserRole
from app.utils.auth import hash_password, check_password, generate_token, jwt_required

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()

    # Validate required fields
    required = ['name', 'email', 'password', 'role']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Validate role
    try:
        role = UserRole(data['role'])
    except ValueError:
        return jsonify({'error': 'Invalid role. Must be: student, instructor, or admin'}), 400

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    # Create user
    user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hash_password(data['password']),
        role=role
    )
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id, user.role.value)

    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'token': token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token."""
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password(data['password'], user.password_hash):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_token(user.id, user.role.value)

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'token': token
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required
def me():
    """Get current authenticated user info."""
    return jsonify({'user': g.current_user.to_dict()}), 200
