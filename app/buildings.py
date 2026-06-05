from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import mysql, bcrypt

buildings_bp = Blueprint('buildings', __name__)

@buildings_bp.route('/buildings', methods=['GET'])
@jwt_required()
def get_buildings():
    complex_id = request.args.get('complex_id')

    cur = mysql.connection.cursor()

    if complex_id:
        cur.execute("""
            SELECT b.*, c.identity as complex_name,
                   a.first_name, a.last_name, a.email as admin_email
            FROM buildings b
            LEFT JOIN complexes c ON b.complex_id = c.id
            LEFT JOIN admins a ON b.admin_id = a.id
            WHERE b.complex_id = %s
        """, (complex_id,))
    else:
        cur.execute("""
            SELECT b.*, c.identity as complex_name,
                   a.first_name, a.last_name, a.email as admin_email
            FROM buildings b
            LEFT JOIN complexes c ON b.complex_id = c.id
            LEFT JOIN admins a ON b.admin_id = a.id
        """)

    buildings = cur.fetchall()
    cur.close()

    return jsonify({'buildings': buildings}), 200


@buildings_bp.route('/buildings', methods=['POST'])
@jwt_required()
def create_building():
    data = request.get_json()
    jwt_data = get_jwt()

    user_role = jwt_data.get('role')
    user_id = get_jwt_identity()

    required_building = ['name', 'complex_id']
    for field in required_building:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    required_admin = ['admin_civility', 'admin_first_name', 'admin_last_name',
                      'admin_email', 'admin_phone', 'admin_password']
    for field in required_admin:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    cur = mysql.connection.cursor()

    try:
        
        cur.execute("SELECT id FROM complexes WHERE id = %s", (data['complex_id'],))
        complex_row = cur.fetchone()

        if not complex_row:
            cur.close()
            return jsonify({'message': 'Complex not found'}), 404

        # ROLE + OWNERSHIP CHECK
        if user_role == 'complex_admin':
            cur.execute("SELECT id FROM complexes WHERE admin_id = %s", (user_id,))
            my_complex = cur.fetchone()

            if not my_complex or my_complex['id'] != data['complex_id']:
                cur.close()
                return jsonify({
                    'message': 'Not allowed to create building in this complex'
                }), 403

        
        cur.execute("SELECT id FROM admins WHERE email = %s", (data['admin_email'],))
        if cur.fetchone():
            cur.close()
            return jsonify({'message': 'Admin email already exists'}), 409

        # Create building admin
        hashed_password = bcrypt.generate_password_hash(
            data['admin_password']
        ).decode('utf-8')

        cur.execute("""
            INSERT INTO admins (civility, first_name, last_name, email, phone, role, status, password)
            VALUES (%s, %s, %s, %s, %s, 'building_admin', 'active', %s)
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
            INSERT INTO buildings (name, complex_id, admin_id)
            VALUES (%s, %s, %s)
        """, (
            data['name'],
            data['complex_id'],
            admin_id
        ))

        building_id = cur.lastrowid

        mysql.connection.commit()
        cur.close()

        return jsonify({
            'message': 'Building created successfully',
            'building_id': building_id,
            'admin_id': admin_id
        }), 201

    except Exception as e:
        mysql.connection.rollback()
        cur.close()
        return jsonify({'message': 'An error occurred', 'error': str(e)}), 500


@buildings_bp.route('/buildings/<int:building_id>', methods=['DELETE'])
@jwt_required()
def delete_building(building_id):
    jwt_data = get_jwt()

    user_role = jwt_data.get('role')
    user_id = int(get_jwt_identity())

    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT b.*, c.admin_id AS complex_admin_id
        FROM buildings b
        JOIN complexes c ON b.complex_id = c.id
        WHERE b.id = %s
    """, (building_id,))

    building = cur.fetchone()

    
    if not building:
        cur.close()
        return jsonify({'message': 'Building not found'}), 404

    print("ROLE =", user_role)
    print("USER_ID =", user_id)
    print("BUILDING_COMPLEX_ADMIN =", building['complex_admin_id'])

    
    if user_role == 'super_admin':
        pass
    elif user_role == 'complex_admin':
        if building['complex_admin_id'] != user_id:
            cur.close()
            return jsonify({
                'message': 'You can only delete buildings in your own complex'
            }), 403
    else:
        cur.close()
        return jsonify({
            'message': 'You are not allowed to delete buildings'
        }), 403

    cur.execute(
        "DELETE FROM buildings WHERE id = %s",
        (building_id,)
    )

    mysql.connection.commit()
    cur.close()

    return jsonify({
        'message': 'Building deleted successfully'
    }), 200