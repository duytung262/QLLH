from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

# Cấu hình CORS cho phép tất cả origins (development mode)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# ===== CẤU HÌNH KẾT NỐI SQL SERVER =====
DB_CONFIG = {
    'server': 'gnut',           # Tên server của bạn (xem trong SSMS)
    'database': 'QLTT_LopHoc',  # Tên database
    'username': 'sa',           # Tài khoản đăng nhập SQL
    'password': '123456',       # Mật khẩu
    'driver': '{ODBC Driver 17 for SQL Server}'
}

def get_db_connection():
    """Tạo kết nối đến SQL Server"""
    try:
        conn_str = (
            f"DRIVER={DB_CONFIG['driver']};"
            f"SERVER={DB_CONFIG['server']};"
            f"DATABASE={DB_CONFIG['database']};"
            f"UID={DB_CONFIG['username']};"
            f"PWD={DB_CONFIG['password']}"
        )
        conn = pyodbc.connect(conn_str)
        print("✅ Database connected successfully")
        return conn
    except Exception as e:
        print(f"❌ Database connection error: {str(e)}")
        raise

# ===== ROUTE MẶC ĐỊNH =====
@app.route('/')
def home():
    return jsonify({
        "message": "✅ Flask backend is running!",
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "api_endpoints": {
            "authentication": [
                "POST /api/login",
                "POST /api/change-password"
            ],
            "students": [
                "POST /api/students/register",
                "GET  /api/students"
            ],
            "grades": [
                "POST /api/grades",
                "GET  /api/grades/<student_id>",
                "PUT  /api/grades/<grade_id>",
                "DELETE /api/grades/<grade_id>"
            ],
            "attendance": [
                "POST /api/attendance",
                "GET  /api/attendance/<student_id>"
            ],
            "profile": [
                "PUT /api/profile/<user_id>"
            ]
        }
    })

# ===== TEST DATABASE CONNECTION =====
@app.route('/api/test-db')
def test_db():
    """Test database connection"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()
        conn.close()
        return jsonify({
            'success': True,
            'message': 'Database connected successfully',
            'version': version[0] if version else 'Unknown'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Database connection failed: {str(e)}'
        }), 500

# ===== API ĐĂNG NHẬP =====
@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        email = data.get('email', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'student')

        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Email và mật khẩu không được để trống'
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        if role == 'student':
            query = """
                SELECT StudentID, FullName, Email, Phone, Class, 'student' as Role,
                       CAST(AvgGrade AS FLOAT) as AvgGrade
                FROM Students 
                WHERE Email = ? AND Password = ?
            """
        else:
            query = """
                SELECT TeacherID as StudentID, FullName, Email, Phone, Department as Class, 
                       'teacher' as Role, NULL as AvgGrade
                FROM Teachers 
                WHERE Email = ? AND Password = ?
            """

        cursor.execute(query, (email, password))
        user = cursor.fetchone()

        if user:
            columns = [column[0] for column in cursor.description]
            user_dict = dict(zip(columns, user))

            # Lưu log đăng nhập
            try:
                log_query = """
                    INSERT INTO LoginLogs (Email, Role, LoginTime, IPAddress)
                    VALUES (?, ?, ?, ?)
                """
                ip_address = request.remote_addr or 'Unknown'
                cursor.execute(log_query, (email, role, datetime.now(), ip_address))
                conn.commit()
            except Exception as log_error:
                print(f"⚠️ Log error (non-critical): {log_error}")

            conn.close()
            
            return jsonify({
                'success': True,
                'message': 'Đăng nhập thành công',
                'user': user_dict
            })
        else:
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Email hoặc mật khẩu không đúng'
            }), 401

    except pyodbc.Error as db_error:
        print(f"❌ Database error: {db_error}")
        return jsonify({
            'success': False,
            'message': f'Lỗi cơ sở dữ liệu: {str(db_error)}'
        }), 500
    except Exception as e:
        print(f"❌ Server error: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

# ===== API ĐĂNG KÝ SINH VIÊN =====
@app.route('/api/students/register', methods=['POST', 'OPTIONS'])
def register_student():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['studentId', 'fullName', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Thiếu trường bắt buộc: {field}'
                }), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO Students (StudentID, FullName, Email, Password, Phone, Class, DateOfBirth)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query, (
            data['studentId'],
            data['fullName'],
            data['email'],
            data['password'],
            data.get('phone', ''),
            data.get('class', ''),
            data.get('dateOfBirth')
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Đăng ký thành công'
        })

    except pyodbc.IntegrityError as ie:
        print(f"❌ Integrity error: {ie}")
        return jsonify({
            'success': False,
            'message': 'Email hoặc mã sinh viên đã tồn tại'
        }), 400
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }), 500

# ===== API LẤY DANH SÁCH SINH VIÊN =====
@app.route('/api/students', methods=['GET', 'OPTIONS'])
def get_students():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT StudentID, FullName, Email, Phone, Class, 
                   CAST(AvgGrade AS FLOAT) as AvgGrade
            FROM Students
            ORDER BY StudentID
        """
        cursor.execute(query)
        students = cursor.fetchall()
        
        columns = [column[0] for column in cursor.description]
        result = [dict(zip(columns, row)) for row in students]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': result,
            'count': len(result)
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }), 500

# ===== API THÊM ĐIỂM =====
@app.route('/api/grades', methods=['POST', 'OPTIONS'])
def add_grade():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        
        midterm = float(data.get('midterm', 0))
        final = float(data.get('final', 0))
        avg = round(midterm * 0.4 + final * 0.6, 2)

        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO Grades (StudentID, Subject, Midterm, Final, Average, Semester, Year)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query, (
            data['studentId'],
            data['subject'],
            midterm,
            final,
            avg,
            data.get('semester', 1),
            data.get('year', datetime.now().year)
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Đã thêm điểm thành công',
            'average': avg
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }), 500

# ===== API LẤY ĐIỂM SINH VIÊN =====
@app.route('/api/grades/<student_id>', methods=['GET', 'OPTIONS'])
def get_student_grades(student_id):
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT g.GradeID, g.Subject, 
                   CAST(g.Midterm AS FLOAT) as Midterm,
                   CAST(g.Final AS FLOAT) as Final,
                   CAST(g.Average AS FLOAT) as Average,
                   g.Semester, g.Year
            FROM Grades g
            WHERE g.StudentID = ?
            ORDER BY g.Year DESC, g.Semester DESC
        """
        cursor.execute(query, (student_id,))
        grades = cursor.fetchall()
        
        columns = [column[0] for column in cursor.description]
        result = [dict(zip(columns, row)) for row in grades]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': result,
            'count': len(result)
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }), 500

# ===== API ĐIỂM DANH =====
@app.route('/api/attendance', methods=['POST', 'OPTIONS'])
def mark_attendance():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO Attendance (StudentID, Subject, Date, Status, Note)
            VALUES (?, ?, ?, ?, ?)
        """
        cursor.execute(query, (
            data['studentId'],
            data['subject'],
            data['date'],
            data.get('status', 'present'),
            data.get('note', '')
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Đã lưu điểm danh'
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }), 500

# ===== API CẬP NHẬT PROFILE =====
@app.route('/api/profile/<user_id>', methods=['PUT', 'OPTIONS'])
def update_profile(user_id):
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        role = data.get('role', 'student')
        
        conn = get_db_connection()
        cursor = conn.cursor()

        if role == 'student':
            query = """
                UPDATE Students 
                SET FullName = ?, Phone = ?, Address = ?
                WHERE StudentID = ?
            """
            cursor.execute(query, (
                data['name'],
                data.get('phone', ''),
                data.get('address', ''),
                user_id
            ))
        else:
            query = """
                UPDATE Teachers 
                SET FullName = ?, Phone = ?, Department = ?
                WHERE TeacherID = ?
            """
            cursor.execute(query, (
                data['name'],
                data.get('phone', ''),
                data.get('department', ''),
                user_id
            ))
            
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Đã cập nhật thông tin'
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }), 500

# ===== API ĐỔI MẬT KHẨU =====
@app.route('/api/change-password', methods=['POST', 'OPTIONS'])
def change_password():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        email = data.get('email', '').strip()
        old_password = data.get('oldPassword', '')
        new_password = data.get('newPassword', '')
        role = data.get('role', 'student')

        if not email or not old_password or not new_password:
            return jsonify({
                'success': False,
                'message': 'Thiếu thông tin bắt buộc'
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        table = 'Students' if role == 'student' else 'Teachers'
        id_field = 'StudentID' if role == 'student' else 'TeacherID'
        
        # Kiểm tra mật khẩu hiện tại
        check_query = f"SELECT {id_field} FROM {table} WHERE Email = ? AND Password = ?"
        cursor.execute(check_query, (email, old_password))

        if not cursor.fetchone():
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Mật khẩu hiện tại không đúng'
            }), 400

        # Cập nhật mật khẩu mới
        update_query = f"UPDATE {table} SET Password = ? WHERE Email = ?"
        cursor.execute(update_query, (new_password, email))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Đã đổi mật khẩu thành công'
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }), 500

# ===== ERROR HANDLERS =====
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint không tồn tại'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Lỗi server nội bộ'
    }), 500

# ===== KHỞI ĐỘNG SERVER =====
if __name__ == '__main__':
    print("=" * 70)
    print("🚀 Flask API Server - QLTT Lớp học")
    print("=" * 70)
    print("📡 API chạy tại: http://localhost:5000")
    print("🌐 Frontend CORS: Enabled for all origins")
    print("=" * 70)
    print("📗 Các endpoint chính:")
    print("   GET  /              - Health check")
    print("   GET  /api/test-db   - Test database connection")
    print("   POST /api/login     - Đăng nhập")
    print("   POST /api/students/register - Đăng ký sinh viên")
    print("   GET  /api/students  - Lấy danh sách sinh viên")
    print("   POST /api/grades    - Thêm điểm")
    print("   GET  /api/grades/<student_id> - Lấy điểm sinh viên")
    print("   POST /api/attendance - Điểm danh")
    print("   PUT  /api/profile/<user_id> - Cập nhật profile")
    print("   POST /api/change-password - Đổi mật khẩu")
    print("=" * 70)
    
    # Test database connection on startup
    try:
        conn = get_db_connection()
        conn.close()
        print("✅ Database connection: OK")
    except Exception as e:
        print(f"❌ Database connection: FAILED - {str(e)}")
        print("⚠️  Server will start but database operations will fail!")
    
    print("=" * 70)
    
    app.run(debug=True, port=5000, host='0.0.0.0')
