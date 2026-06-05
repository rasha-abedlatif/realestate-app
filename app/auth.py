from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import mysql, bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    cur = mysql.connection.cursor()

    cur.execute("SELECT * FROM admins WHERE email = %s", (data['email'],))
    admin = cur.fetchone()

    if not admin:
        cur.close()
        return jsonify({'message': 'Invalid email or password'}), 401

    if admin['status'] == 'inactive':
        cur.close()
        return jsonify({'message': 'Account is inactive'}), 403

    if not bcrypt.check_password_hash(admin['password'], data['password']):
        cur.close()
        return jsonify({'message': 'Invalid email or password'}), 401

    
    cur.execute(
        "SELECT id FROM complexes WHERE admin_id = %s",
        (admin['id'],)
    )
    complex_row = cur.fetchone()
    cur.close()

    complex_id = complex_row['id'] if complex_row else None

    
    access_token = create_access_token(
        identity=str(admin['id']),
        additional_claims={
            'role': admin['role'],
            'email': admin['email'],
            'name': admin['first_name'] + ' ' + admin['last_name'],
            'admin_id': admin['id'],
            'complex_id': complex_id
        }
    )

    return jsonify({
        'token': access_token,
        'role': admin['role'],
        'name': admin['first_name'] + ' ' + admin['last_name']
    }), 200