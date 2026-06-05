from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import mysql, bcrypt

admins_bp = Blueprint('admins', __name__)

def super_admin_required():
    claims = get_jwt()
    return claims.get('role') == 'super_admin'


@admins_bp.route('/admins', methods=['GET'])
@jwt_required()
def get_admins():


    if not super_admin_required():
        return jsonify({'message': 'Access denied. Super Admin only.'}), 403

    search = request.args.get('search', '').strip()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    offset = (page - 1) * per_page

    cur = mysql.connection.cursor()

    search_query = f"%{search}%"

    cur.execute("""
        SELECT id, civility, first_name, last_name, email, phone, role, status, created_at
        FROM admins
        WHERE first_name LIKE %s
           OR last_name LIKE %s
           OR email LIKE %s
           OR CONCAT(first_name, ' ', last_name) LIKE %s
        LIMIT %s OFFSET %s
    """, (
        search_query,
        search_query,
        search_query,
        search_query,
        per_page,
        offset
    ))

    admins = cur.fetchall()

    cur.execute("""
        SELECT COUNT(*) as total
        FROM admins
        WHERE first_name LIKE %s
           OR last_name LIKE %s
           OR email LIKE %s
           OR CONCAT(first_name, ' ', last_name) LIKE %s
    """, (
        search_query,
        search_query,
        search_query,
        search_query
    ))

    total = cur.fetchone()['total']
    cur.close()

    return jsonify({
        'admins': admins,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    }), 200


@admins_bp.route('/admins', methods=['POST'])
@jwt_required()
def create_admin():


    if not super_admin_required():
        return jsonify({'message': 'Access denied. Super Admin only.'}), 403

    data = request.get_json()

    required = [
        'civility',
        'first_name',
        'last_name',
        'email',
        'phone',
        'role',
        'password'
    ]

    for field in required:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    hashed_password = bcrypt.generate_password_hash(
        data['password']
    ).decode('utf-8')

    cur = mysql.connection.cursor()

    cur.execute(
        "SELECT id FROM admins WHERE email = %s",
        (data['email'],)
    )

    if cur.fetchone():
        cur.close()
        return jsonify({'message': 'Email already exists'}), 409

    cur.execute("""
        INSERT INTO admins
        (civility, first_name, last_name, email, phone, role, status, password)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        data['civility'],
        data['first_name'],
        data['last_name'],
        data['email'],
        data['phone'],
        data['role'],
        data.get('status', 'active'),
        hashed_password
    ))

    mysql.connection.commit()

    new_id = cur.lastrowid
    cur.close()

    return jsonify({
        'message': 'Admin created successfully',
        'id': new_id
    }), 201


@admins_bp.route('/admins/<int:admin_id>', methods=['GET'])
@jwt_required()
def get_admin(admin_id):

    
    if not super_admin_required():
        return jsonify({'message': 'Access denied. Super Admin only.'}), 403

    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT
            id,
            civility,
            first_name,
            last_name,
            email,
            phone,
            role,
            status,
            created_at
        FROM admins
        WHERE id = %s
    """, (admin_id,))

    admin = cur.fetchone()
    cur.close()

    if not admin:
        return jsonify({'message': 'Admin not found'}), 404

    return jsonify(admin), 200