// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Service
const API = {
  // Login
  async login(email, password, role = 'student') {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem('sessionEmail', email.toLowerCase());
        localStorage.setItem('userRole', role);
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Không thể kết nối đến server' };
    }
  },

  // Register Student
  async registerStudent(studentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/students/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Không thể kết nối đến server' };
    }
  },

  // Get Students
  async getStudents() {
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      return await response.json();
    } catch (error) {
      console.error('Get students error:', error);
      return { success: false, message: 'Không thể kết nối đến server' };
    }
  },

  // Add Grade
  async addGrade(gradeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Add grade error:', error);
      return { success: false, message: 'Không thể kết nối đến server' };
    }
  },

  // Get Student Grades
  async getStudentGrades(studentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/grades/${studentId}`);
      return await response.json();
    } catch (error) {
      console.error('Get grades error:', error);
      return { success: false, message: 'Không thể kết nối đến server' };
    }
  },

  // Mark Attendance
  async markAttendance(attendanceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Attendance error:', error);
      return { success: false, message: 'Không thể kết nối đến server' };
    }
  },

  // Update Profile
  async updateProfile(userId, profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Không thể kết nối đến server' };
    }
  },

  // Change Password
  async changePassword(passwordData) {
    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Không thể kết nối đến server' };
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}