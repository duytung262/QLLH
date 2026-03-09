from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import sqlite3
import os

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

DB_PATH = os.path.join(os.path.dirname(__file__), 'qltt_lophoc.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Khởi tạo database và tạo bảng nếu chưa có"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS Students (
            StudentID TEXT PRIMARY KEY,
            FullName TEXT NOT NULL,
            Email TEXT UNIQUE NOT NULL,
            Password TEXT NOT NULL,
            Phone TEXT,
            Class TEXT,
            DateOfBirth TEXT,
            Address TEXT,
            AvgGrade REAL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS Teachers (
            TeacherID TEXT PRIMARY KEY,
            FullName TEXT NOT NULL,
            Email TEXT UNIQUE NOT NULL,
            Password TEXT NOT NULL,
            Phone TEXT,
            Department TEXT
        );

        CREATE TABLE IF NOT EXISTS Grades (
            GradeID INTEGER PRIMARY KEY AUTOINCREMENT,
            StudentID TEXT NOT NULL,
            Subject TEXT NOT NULL,
            Midterm REAL,
            Final REAL,
            Average REAL,
            Semester INTEGER DEFAULT 1,
            Year INTEGER,
            FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
        );

        CREATE TABLE IF NOT EXISTS Attendance (
            AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT,
            StudentID TEXT NOT NULL,
            Subject TEXT NOT NULL,
            Date TEXT NOT NULL,
            Status TEXT DEFAULT 'present',
            Note TEXT,
            FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
        );

        CREATE TABLE IF NOT EXISTS LoginLogs (
            LogID INTEGER PRIMARY KEY AUTOINCREMENT,
            Email TEXT,
            Role TEXT,
            LoginTime TEXT,
            IPAddress TEXT
        );
    ''')

    # Thêm dữ liệu mẫu nếu chưa có
    cursor.execute("SELECT COUNT(*) FROM Students")
    if cursor.fetchone()[0] == 0:
        cursor.executescript('''
            INSERT INTO Students (StudentID, FullName, Email, Password, Phone, Class, AvgGrade)
            VALUES 
                ('B22DCVT498', 'Nhân Duy Tùng', 'student1@example.com', 'studentpass', '0123456789', 'D22VTMD02', 8.5),
                ('B22DCVT001', 'Nguyễn Văn A', 'nguyenvana@example.com', 'pass123', '0987654321', 'D22VTMD02', 7.8);

            INSERT INTO Teachers (TeacherID, FullName, Email, Password, Phone, Department)
            VALUES 
                ('GV001', 'Nguyễn Thanh Trà', 'gv.demo@university.edu.vn', 'teacher123', '0111222333', 'Viễn Thông I');

            INSERT INTO Grades (StudentID, Subject, Midterm, Final, Average, Semester, Year)
            VALUES 
                ('B22DCVT498', 'Điện toán đám mây', 8.0, 9.0, 8.6, 1, 2026),
                ('B22DCVT498', 'Lập trình mạng', 7.5, 8.0, 7.8, 1, 2026),
                ('B22DCVT498', 'Kỹ thuật truyền số', 8.5, 8.5, 8.5, 1, 2026);

            INSERT INTO Attendance (StudentID, Subject, Date, Status)
            VALUES 
                ('B22DCVT498', 'Điện toán đám mây', '2026-03-01', 'present'),
                ('B22DCVT498', 'Điện toán đám mây', '2026-03-08', 'present'),
                ('B22DCVT498', 'Lập trình mạng', '2026-03-02', 'absent');
        ''')

    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

# ===== SERVE STATIC FILES =====
@app.route('/')
def home():
    return send_from_directory('.', 'login.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

# ===== API TEST DB =====
@app.route('/api/test-db')
def test_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT sqlite_version()")
        version = cursor.fetchone()
        conn.close()
        return jsonify({
            'success': True,
            'message': 'Database connected successfully',
            'version': f'SQLite {version[0]}'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== API ĐĂNG NHẬP =====
@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.json
        email = data.get('email', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'student')

        if not email or not password:
            return jsonify({'success': False, 'message': 'Email và mật khẩu không được để trống'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        if role == 'student':
            cursor.execute(
                "SELECT StudentID, FullName, Email, Phone, Class, 'student' as Role, AvgGrade FROM Students WHERE Email = ? AND Password = ?",
                (email, password)
            )
        else:
            cursor.execute(
                "SELECT TeacherID as StudentID, FullName, Email, Phone, Department as Class, 'teacher' as Role, NULL as AvgGrade FROM Teachers WHERE Email = ? AND Password = ?",
                (email, password)
            )

        user = cursor.fetchone()

        if user:
            user_dict = dict(user)
            try:
                cursor.execute(
                    "INSERT INTO LoginLogs (Email, Role, LoginTime, IPAddress) VALUES (?, ?, ?, ?)",
                    (email, role, datetime.now().isoformat(), request.remote_addr or 'Unknown')
                )
                conn.commit()
            except Exception as log_error:
                print(f"⚠️ Log error: {log_error}")

            conn.close()
            return jsonify({'success': True, 'message': 'Đăng nhập thành công', 'user': user_dict})
        else:
            conn.close()
            return jsonify({'success': False, 'message': 'Email hoặc mật khẩu không đúng'}), 401

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500

# ===== API ĐĂNG KÝ SINH VIÊN =====
@app.route('/api/students/register', methods=['POST', 'OPTIONS'])
def register_student():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.json
        required_fields = ['studentId', 'fullName', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'Thiếu trường bắt buộc: {field}'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Students (StudentID, FullName, Email, Password, Phone, Class, DateOfBirth) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (data['studentId'], data['fullName'], data['email'], data['password'],
             data.get('phone', ''), data.get('class', ''), data.get('dateOfBirth'))
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đăng ký thành công'})

    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Email hoặc mã sinh viên đã tồn tại'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi: {str(e)}'}), 500

# ===== API LẤY DANH SÁCH SINH VIÊN =====
@app.route('/api/students', methods=['GET', 'OPTIONS'])
def get_students():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT StudentID, FullName, Email, Phone, Class, AvgGrade FROM Students ORDER BY StudentID")
        students = cursor.fetchall()
        result = [dict(row) for row in students]
        conn.close()
        return jsonify({'success': True, 'data': result, 'count': len(result)})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi: {str(e)}'}), 500

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
        cursor.execute(
            "INSERT INTO Grades (StudentID, Subject, Midterm, Final, Average, Semester, Year) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (data['studentId'], data['subject'], midterm, final, avg,
             data.get('semester', 1), data.get('year', datetime.now().year))
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đã thêm điểm thành công', 'average': avg})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi: {str(e)}'}), 500

# ===== API LẤY ĐIỂM SINH VIÊN =====
@app.route('/api/grades/<student_id>', methods=['GET', 'OPTIONS'])
def get_student_grades(student_id):
    if request.method == 'OPTIONS':
        return '', 204

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT GradeID, Subject, Midterm, Final, Average, Semester, Year FROM Grades WHERE StudentID = ? ORDER BY Year DESC, Semester DESC",
            (student_id,)
        )
        grades = cursor.fetchall()
        result = [dict(row) for row in grades]
        conn.close()
        return jsonify({'success': True, 'data': result, 'count': len(result)})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi: {str(e)}'}), 500

# ===== API ĐIỂM DANH =====
@app.route('/api/attendance', methods=['POST', 'OPTIONS'])
def mark_attendance():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Attendance (StudentID, Subject, Date, Status, Note) VALUES (?, ?, ?, ?, ?)",
            (data['studentId'], data['subject'], data['date'], data.get('status', 'present'), data.get('note', ''))
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đã lưu điểm danh'})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi: {str(e)}'}), 500

# ===== API LẤY ĐIỂM DANH =====
@app.route('/api/attendance/<student_id>', methods=['GET', 'OPTIONS'])
def get_attendance(student_id):
    if request.method == 'OPTIONS':
        return '', 204

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT AttendanceID, Subject, Date, Status, Note FROM Attendance WHERE StudentID = ? ORDER BY Date DESC",
            (student_id,)
        )
        records = cursor.fetchall()
        result = [dict(row) for row in records]
        conn.close()
        return jsonify({'success': True, 'data': result, 'count': len(result)})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi: {str(e)}'}), 500

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
            cursor.execute(
                "UPDATE Students SET FullName = ?, Phone = ?, Address = ? WHERE StudentID = ?",
                (data['name'], data.get('phone', ''), data.get('address', ''), user_id)
            )
        else:
            cursor.execute(
                "UPDATE Teachers SET FullName = ?, Phone = ?, Department = ? WHERE TeacherID = ?",
                (data['name'], data.get('phone', ''), data.get('department', ''), user_id)
            )

        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đã cập nhật thông tin'})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi: {str(e)}'}), 500

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
            return jsonify({'success': False, 'message': 'Thiếu thông tin bắt buộc'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        if role == 'student':
            cursor.execute("SELECT StudentID FROM Students WHERE Email = ? AND Password = ?", (email, old_password))
            if not cursor.fetchone():
                conn.close()
                return jsonify({'success': False, 'message': 'Mật khẩu hiện tại không đúng'}), 400
            cursor.execute("UPDATE Students SET Password = ? WHERE Email = ?", (new_password, email))
        else:
            cursor.execute("SELECT TeacherID FROM Teachers WHERE Email = ? AND Password = ?", (email, old_password))
            if not cursor.fetchone():
                conn.close()
                return jsonify({'success': False, 'message': 'Mật khẩu hiện tại không đúng'}), 400
            cursor.execute("UPDATE Teachers SET Password = ? WHERE Email = ?", (new_password, email))

        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đã đổi mật khẩu thành công'})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi: {str(e)}'}), 500

# ===== ERROR HANDLERS =====
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Endpoint không tồn tại'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Lỗi server nội bộ'}), 500

# ===== KHỞI ĐỘNG SERVER =====
if __name__ == '__main__':
    init_db()
    print("=" * 60)
    print("🚀 Flask API Server - QLTT Lớp học (SQLite Mode)")
    print("=" * 60)
    print("📡 API: http://localhost:5000")
    print("🗄️  Database: SQLite (qltt_lophoc.db)")
    print("=" * 60)
    app.run(debug=True, port=5000, host='0.0.0.0')

# Khởi tạo DB khi chạy trên cloud (gunicorn)
init_db()
