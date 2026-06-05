from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import mysql, bcrypt

complexes_bp = Blueprint('complexes', __name__)

@complexes_bp.route('/complexes', methods=['GET'])
@jwt_required()
def get_complexes():
    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT c.*, a.first_name, a.last_name, a.email as admin_email
        FROM complexes c
        LEFT JOIN admins a ON c.admin_id = a.id
    """)
    complexes = cur.fetchall()
    cur.close()

    return jsonify({'complexes': complexes}), 200


@complexes_bp.route('/complexes', methods=['POST'])
@jwt_required()
def create_complex():
    data = request.get_json()

    required_complex = ['identity', 'address']
    for field in required_complex:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    required_admin = ['admin_civility', 'admin_first_name', 'admin_last_name',
                      'admin_email', 'admin_phone', 'admin_password']
    for field in required_admin:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    cur = mysql.connection.cursor()

    try:
        # Check if admin email already exists
        cur.execute("SELECT id FROM admins WHERE email = %s", (data['admin_email'],))
        if cur.fetchone():
            cur.close()
            return jsonify({'message': 'Admin email already exists'}), 409

        # Create the complex admin first
        hashed_password = bcrypt.generate_password_hash(data['admin_password']).decode('utf-8')
        cur.execute("""
            INSERT INTO admins (civility, first_name, last_name, email, phone, role, status, password)
            VALUES (%s, %s, %s, %s, %s, 'complex_admin', 'active', %s)
        """, (
            data['admin_civility'],
            data['admin_first_name'],
            data['admin_last_name'],
            data['admin_email'],
            data['admin_phone'],
            hashed_password
        ))
        admin_id = cur.lastrowid

    
        cur.execute("""
            INSERT INTO complexes (identity, address, campaign_info, admin_id)
            VALUES (%s, %s, %s, %s)
        """, (
            data['identity'],
            data['address'],
            data.get('campaign_info', ''),
            admin_id
        ))
        complex_id = cur.lastrowid

        mysql.connection.commit()
        cur.close()

        return jsonify({
            'message': 'Complex created successfully',
            'complex_id': complex_id,
            'admin_id': admin_id
        }), 201

    except Exception as e:
        mysql.connection.rollback()
        cur.close()
        return jsonify({'message': 'An error occurred', 'error': str(e)}), 500


@complexes_bp.route('/complexes/<int:complex_id>', methods=['GET'])
@jwt_required()
def get_complex(complex_id):
    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT c.*, a.first_name, a.last_name, a.email as admin_email
        FROM complexes c
        LEFT JOIN admins a ON c.admin_id = a.id
        WHERE c.id = %s
    """, (complex_id,))
    complex = cur.fetchone()

    if not complex:
        cur.close()
        return jsonify({'message': 'Complex not found'}), 404

    cur.execute("""
        SELECT b.*, a.first_name, a.last_name
        FROM buildings b
        LEFT JOIN admins a ON b.admin_id = a.id
        WHERE b.complex_id = %s
    """, (complex_id,))
    buildings = cur.fetchall()
    cur.close()

    complex['buildings'] = buildings

    return jsonify(complex), 200