// Data Storage (Demo - sử dụng biến thay vì localStorage)
let students = [
  { id: 'SV001', name: 'Nguyễn Văn An', email: 'an@student.edu.vn', class: 'CNTT-K20A', avgGrade: 8.5 },
  { id: 'SV002', name: 'Trần Thị Bình', email: 'binh@student.edu.vn', class: 'CNTT-K20A', avgGrade: 9.0 },
  { id: 'SV003', name: 'Lê Văn Cường', email: 'cuong@student.edu.vn', class: 'CNTT-K20B', avgGrade: 7.8 },
  { id: 'SV004', name: 'Phạm Thị Dung', email: 'dung@student.edu.vn', class: 'CNTT-K20B', avgGrade: 8.2 },
  { id: 'SV005', name: 'Hoàng Văn Em', email: 'em@student.edu.vn', class: 'CNTT-K20A', avgGrade: 8.8 }
];

let grades = [
  { studentId: 'SV001', studentName: 'Nguyễn Văn An', subject: 'Lập trình Web', midterm: 8.0, final: 9.0, avg: 8.6 },
  { studentId: 'SV002', studentName: 'Trần Thị Bình', subject: 'Lập trình Web', midterm: 9.5, final: 8.5, avg: 8.9 },
  { studentId: 'SV003', studentName: 'Lê Văn Cường', subject: 'Cơ sở dữ liệu', midterm: 7.5, final: 8.0, avg: 7.8 },
  { studentId: 'SV001', studentName: 'Nguyễn Văn An', subject: 'Cơ sở dữ liệu', midterm: 8.5, final: 8.5, avg: 8.5 }
];

let attendance = [];
let documents = [
  { 
    id: 1, 
    name: 'Bài giảng Chương 1', 
    description: 'Giới thiệu về Lập trình Web',
    subject: 'Lập trình Web',
    type: 'lecture',
    date: '2025-01-15',
    uploadedBy: 'Giảng viên'
  },
  { 
    id: 2, 
    name: 'Bài tập tuần 1', 
    description: 'Bài tập thực hành HTML/CSS',
    subject: 'Lập trình Web',
    type: 'exercise',
    date: '2025-01-16',
    uploadedBy: 'Giảng viên'
  }
];

let notifications = [
  {
    id: 1,
    title: 'Thông báo lịch thi giữa kỳ',
    content: 'Lịch thi giữa kỳ sẽ diễn ra vào tuần sau. Sinh viên lưu ý ôn tập.',
    target: 'all',
    date: '2025-01-10',
    time: '14:30'
  }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  checkAuthentication();
  
  initNavigation();
  initModals();
  loadDashboard();
  loadStudentsTable();
  loadGradesTable();
  loadAttendanceTable();
  loadDocuments();
  loadNotifications();
  setupEventListeners();
  loadTeacherProfile();
  
  // Set today's date for attendance
  document.getElementById('attendanceDate').valueAsDate = new Date();
});

// Check if teacher is logged in
function checkAuthentication() {
  const session = sessionStorage.getItem('teacherSession');
  if (!session) {
    // Not logged in, redirect to login
    window.location.href = 'teacher-login.html';
    return;
  }
  
  const data = JSON.parse(session);
  // Check if session is still valid (less than 24 hours)
  const loginTime = new Date(data.loginTime);
  const now = new Date();
  const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
  
  if (hoursDiff >= 24) {
    // Session expired
    sessionStorage.removeItem('teacherSession');
    window.location.href = 'teacher-login.html';
  }
}

// Load teacher profile
function loadTeacherProfile() {
  const session = sessionStorage.getItem('teacherSession');
  if (!session) return;
  
  const teacher = JSON.parse(session);
  
  // Update profile section
  const teacherName = document.getElementById('teacherName');
  const teacherAvatar = document.getElementById('teacherAvatar');
  
  if (teacherName) {
    teacherName.textContent = teacher.name || 'Giảng viên';
  }
  
  if (teacherAvatar) {
    // Get initials for avatar
    const names = teacher.name.split(' ');
    const initials = names.length >= 2 
      ? names[names.length - 2][0] + names[names.length - 1][0]
      : teacher.name[0];
    teacherAvatar.textContent = initials.toUpperCase();
  }
}

// Navigation
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active class from all items
      navItems.forEach(i => i.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');
      
      // Hide all sections
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Show selected section
      const sectionId = this.dataset.section + '-section';
      document.getElementById(sectionId).classList.add('active');
    });
  });
}

// Modal Management
function initModals() {
  // Close buttons
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', function() {
      const modalId = this.dataset.modal;
      closeModal(modalId);
    });
  });
  
  // Click outside to close
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
      }
    });
  });
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Dashboard
function loadDashboard() {
  // Calculate stats
  const totalStudents = students.length;
  const classes = [...new Set(students.map(s => s.class))].length;
  const avgGrade = (students.reduce((sum, s) => sum + s.avgGrade, 0) / students.length).toFixed(1);
  const attendanceRate = '92.5'; // Demo value
  
  // Update stats
  document.getElementById('totalStudents').textContent = totalStudents;
  document.getElementById('totalClasses').textContent = classes;
  document.getElementById('avgGrade').textContent = avgGrade;
  document.getElementById('attendanceRate').textContent = attendanceRate + '%';
  
  // Recent activities
  const activitiesHTML = `
    <div class="activity-item">
      <div class="activity-text">Đã cập nhật điểm cho lớp CNTT-K20A</div>
      <div class="activity-time">2 giờ trước</div>
    </div>
    <div class="activity-item">
      <div class="activity-text">Thêm tài liệu mới: Bài giảng Chương 2</div>
      <div class="activity-time">5 giờ trước</div>
    </div>
    <div class="activity-item">
      <div class="activity-text">Gửi thông báo cho tất cả sinh viên</div>
      <div class="activity-time">Hôm qua</div>
    </div>
    <div class="activity-item">
      <div class="activity-text">Điểm danh lớp CNTT-K20B</div>
      <div class="activity-time">2 ngày trước</div>
    </div>
  `;
  
  document.getElementById('recentActivities').innerHTML = activitiesHTML;
}

// Students Management
function loadStudentsTable() {
  const tbody = document.getElementById('studentsTableBody');
  tbody.innerHTML = '';
  
  students.forEach(student => {
    const row = `
      <tr>
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td><span class="badge badge-info">${student.class}</span></td>
        <td><strong>${student.avgGrade}</strong></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-sm btn-primary" onclick="editStudent('${student.id}')">Sửa</button>
            <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.id}')">Xóa</button>
          </div>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function editStudent(id) {
  alert('Chức năng sửa sinh viên ' + id + ' (Demo)');
}

function deleteStudent(id) {
  if (confirm('Bạn có chắc muốn xóa sinh viên này?')) {
    students = students.filter(s => s.id !== id);
    loadStudentsTable();
    loadDashboard();
  }
}

// Search students
document.getElementById('searchStudent')?.addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  const tbody = document.getElementById('studentsTableBody');
  const rows = tbody.querySelectorAll('tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
});

// Grades Management
function loadGradesTable() {
  const tbody = document.getElementById('gradesTableBody');
  tbody.innerHTML = '';
  
  // Populate class filter
  const classFilter = document.getElementById('classFilter');
  const classes = [...new Set(students.map(s => s.class))];
  classFilter.innerHTML = '<option value="">Tất cả lớp</option>';
  classes.forEach(c => {
    classFilter.innerHTML += `<option value="${c}">${c}</option>`;
  });
  
  // Populate subject filter
  const subjectFilter = document.getElementById('subjectFilter');
  const subjects = [...new Set(grades.map(g => g.subject))];
  subjectFilter.innerHTML = '<option value="">Tất cả môn học</option>';
  subjects.forEach(s => {
    subjectFilter.innerHTML += `<option value="${s}">${s}</option>`;
  });
  
  grades.forEach(grade => {
    const row = `
      <tr>
        <td>${grade.studentId}</td>
        <td>${grade.studentName}</td>
        <td><span class="badge badge-info">${grade.subject}</span></td>
        <td>${grade.midterm}</td>
        <td>${grade.final}</td>
        <td><strong>${grade.avg}</strong></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-sm btn-primary" onclick="editGrade('${grade.studentId}', '${grade.subject}')">Sửa</button>
            <button class="btn btn-sm btn-danger" onclick="deleteGrade('${grade.studentId}', '${grade.subject}')">Xóa</button>
          </div>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function editGrade(studentId, subject) {
  alert(`Chức năng sửa điểm cho ${studentId} - ${subject} (Demo)`);
}

function deleteGrade(studentId, subject) {
  if (confirm('Bạn có chắc muốn xóa điểm này?')) {
    grades = grades.filter(g => !(g.studentId === studentId && g.subject === subject));
    loadGradesTable();
  }
}

// Attendance Management
function loadAttendanceTable() {
  const tbody = document.getElementById('attendanceTableBody');
  tbody.innerHTML = '';
  
  // Populate class filter
  const classSelect = document.getElementById('attendanceClass');
  const classes = [...new Set(students.map(s => s.class))];
  classSelect.innerHTML = '<option value="">Chọn lớp</option>';
  classes.forEach(c => {
    classSelect.innerHTML += `<option value="${c}">${c}</option>`;
  });
  
  students.forEach(student => {
    const row = `
      <tr>
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td><span class="badge badge-info">${student.class}</span></td>
        <td>
          <label class="checkbox-label">
            <input type="checkbox" class="attendance-checkbox" data-student="${student.id}" checked>
          </label>
        </td>
        <td>
          <input type="text" class="form-input" placeholder="Ghi chú..." style="padding: 6px 10px; font-size: 13px;">
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Check/Uncheck all attendance
document.getElementById('checkAll')?.addEventListener('change', function(e) {
  const checkboxes = document.querySelectorAll('.attendance-checkbox');
  checkboxes.forEach(cb => cb.checked = e.target.checked);
});

// Save attendance
document.getElementById('saveAttendanceBtn')?.addEventListener('click', function() {
  const date = document.getElementById('attendanceDate').value;
  const classValue = document.getElementById('attendanceClass').value;
  
  if (!date) {
    alert('Vui lòng chọn ngày điểm danh');
    return;
  }
  
  if (!classValue) {
    alert('Vui lòng chọn lớp');
    return;
  }
  
  const checkboxes = document.querySelectorAll('.attendance-checkbox');
  const attendanceData = [];
  
  checkboxes.forEach(cb => {
    attendanceData.push({
      studentId: cb.dataset.student,
      present: cb.checked,
      date: date,
      class: classValue
    });
  });
  
  attendance.push(...attendanceData);
  alert('Đã lưu điểm danh thành công!');
});

// Documents Management
function loadDocuments() {
  const grid = document.getElementById('documentsGrid');
  grid.innerHTML = '';
  
  documents.forEach(doc => {
    const icon = getDocumentIcon(doc.type);
    const card = `
      <div class="document-card">
        <div class="document-icon">${icon}</div>
        <div class="document-title">${doc.name}</div>
        <div class="document-meta">
          ${doc.subject} • ${doc.date}
        </div>
        <div class="document-meta">${doc.description}</div>
        <div class="document-actions">
          <button class="btn btn-sm btn-primary" onclick="viewDocument(${doc.id})">Xem</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDocument(${doc.id})">Xóa</button>
        </div>
      </div>
    `;
    grid.innerHTML += card;
  });
}

function getDocumentIcon(type) {
  const icons = {
    lecture: '📚',
    exercise: '📝',
    exam: '📋',
    reference: '📖'
  };
  return icons[type] || '📄';
}

function viewDocument(id) {
  const doc = documents.find(d => d.id === id);
  alert(`Xem tài liệu: ${doc.name}\n\nMô tả: ${doc.description}\n\n(Demo - Trong thực tế sẽ mở file)`);
}

function deleteDocument(id) {
  if (confirm('Bạn có chắc muốn xóa tài liệu này?')) {
    documents = documents.filter(d => d.id !== id);
    loadDocuments();
  }
}

// Notifications Management
function loadNotifications() {
  const history = document.getElementById('notificationHistory');
  history.innerHTML = '';
  
  // Populate class selects
  const classes = [...new Set(students.map(s => s.class))];
  const notifClass = document.getElementById('notifClass');
  notifClass.innerHTML = '<option value="">Chọn lớp</option>';
  classes.forEach(c => {
    notifClass.innerHTML += `<option value="${c}">${c}</option>`;
  });
  
  notifications.forEach(notif => {
    const item = `
      <div class="notification-item">
        <div class="notification-title">${notif.title}</div>
        <div class="notification-content">${notif.content}</div>
        <div class="notification-meta">
          <span>📤 ${notif.target === 'all' ? 'Tất cả sinh viên' : notif.target}</span>
          <span>🕐 ${notif.date} ${notif.time}</span>
        </div>
      </div>
    `;
    history.innerHTML += item;
  });
}

// Show/hide class select based on notification target
document.getElementById('notifTarget')?.addEventListener('change', function(e) {
  const classGroup = document.getElementById('classSelectGroup');
  if (e.target.value === 'class') {
    classGroup.style.display = 'block';
  } else {
    classGroup.style.display = 'none';
  }
});

// Send notification
document.getElementById('sendNotifBtn')?.addEventListener('click', function() {
  const title = document.getElementById('notifTitle').value;
  const content = document.getElementById('notifContent').value;
  const target = document.getElementById('notifTarget').value;
  const classValue = document.getElementById('notifClass').value;
  
  if (!title || !content) {
    alert('Vui lòng nhập đầy đủ tiêu đề và nội dung');
    return;
  }
  
  if (target === 'class' && !classValue) {
    alert('Vui lòng chọn lớp');
    return;
  }
  
  const now = new Date();
  const notification = {
    id: notifications.length + 1,
    title: title,
    content: content,
    target: target === 'all' ? 'all' : classValue,
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0].substring(0, 5)
  };
  
  notifications.unshift(notification);
  
  // Clear form
  document.getElementById('notifTitle').value = '';
  document.getElementById('notifContent').value = '';
  document.getElementById('notifTarget').value = 'all';
  document.getElementById('classSelectGroup').style.display = 'none';
  
  loadNotifications();
  alert('Đã gửi thông báo thành công!');
});

// Event Listeners Setup
function setupEventListeners() {
  // Add Student
  document.getElementById('addStudentBtn')?.addEventListener('click', () => {
    openModal('addStudentModal');
  });
  
  document.getElementById('saveStudentBtn')?.addEventListener('click', () => {
    const id = document.getElementById('studentId').value;
    const name = document.getElementById('studentName').value;
    const email = document.getElementById('studentEmail').value;
    const classValue = document.getElementById('studentClass').value;
    
    if (!id || !name || !email || !classValue) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    students.push({
      id: id,
      name: name,
      email: email,
      class: classValue,
      avgGrade: 0
    });
    
    loadStudentsTable();
    loadDashboard();
    closeModal('addStudentModal');
    
    // Clear form
    document.getElementById('studentId').value = '';
    document.getElementById('studentName').value = '';
    document.getElementById('studentEmail').value = '';
    document.getElementById('studentClass').value = '';
    
    alert('Đã thêm sinh viên thành công!');
  });
  
  // Add Grade
  document.getElementById('addGradeBtn')?.addEventListener('click', () => {
    // Populate student select
    const select = document.getElementById('gradeStudentId');
    select.innerHTML = '<option value="">Chọn sinh viên</option>';
    students.forEach(s => {
      select.innerHTML += `<option value="${s.id}">${s.id} - ${s.name}</option>`;
    });
    
    openModal('addGradeModal');
  });
  
  document.getElementById('saveGradeBtn')?.addEventListener('click', () => {
    const studentId = document.getElementById('gradeStudentId').value;
    const subject = document.getElementById('gradeSubject').value;
    const midterm = parseFloat(document.getElementById('gradeMidterm').value);
    const final = parseFloat(document.getElementById('gradeFinal').value);
    
    if (!studentId || !subject || isNaN(midterm) || isNaN(final)) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    const student = students.find(s => s.id === studentId);
    const avg = ((midterm * 0.4) + (final * 0.6)).toFixed(1);
    
    grades.push({
      studentId: studentId,
      studentName: student.name,
      subject: subject,
      midterm: midterm,
      final: final,
      avg: parseFloat(avg)
    });
    
    loadGradesTable();
    closeModal('addGradeModal');
    
    // Clear form
    document.getElementById('gradeStudentId').value = '';
    document.getElementById('gradeSubject').value = '';
    document.getElementById('gradeMidterm').value = '';
    document.getElementById('gradeFinal').value = '';
    
    alert('Đã thêm điểm thành công!');
  });
  
  // Upload Document
  document.getElementById('uploadDocBtn')?.addEventListener('click', () => {
    openModal('uploadDocModal');
  });
  
  document.getElementById('saveDocBtn')?.addEventListener('click', () => {
    const name = document.getElementById('docName').value;
    const description = document.getElementById('docDescription').value;
    const subject = document.getElementById('docSubject').value;
    const type = document.getElementById('docType').value;
    
    if (!name || !subject) {
      alert('Vui lòng điền tên tài liệu và môn học');
      return;
    }
    
    const now = new Date();
    documents.push({
      id: documents.length + 1,
      name: name,
      description: description,
      subject: subject,
      type: type,
      date: now.toISOString().split('T')[0],
      uploadedBy: 'Giảng viên'
    });
    
    loadDocuments();
    closeModal('uploadDocModal');
    
    // Clear form
    document.getElementById('docName').value = '';
    document.getElementById('docDescription').value = '';
    document.getElementById('docSubject').value = '';
    document.getElementById('docType').value = 'lecture';
    
    alert('Đã tải lên tài liệu thành công!');
  });
  
  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      // Clear session
      sessionStorage.removeItem('teacherSession');
      
      // Show toast
      alert('Đăng xuất thành công!');
      
      // Redirect to login
      window.location.href = 'login.html';
    }
  });
  
  // Filter grades by class and subject
  document.getElementById('classFilter')?.addEventListener('change', filterGrades);
  document.getElementById('subjectFilter')?.addEventListener('change', filterGrades);
}

function filterGrades() {
  const classFilter = document.getElementById('classFilter').value;
  const subjectFilter = document.getElementById('subjectFilter').value;
  const tbody = document.getElementById('gradesTableBody');
  const rows = tbody.querySelectorAll('tr');
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const studentId = cells[0].textContent;
    const subject = cells[2].textContent;
    const student = students.find(s => s.id === studentId);
    
    let showRow = true;
    
    if (classFilter && student && student.class !== classFilter) {
      showRow = false;
    }
    
    if (subjectFilter && !subject.includes(subjectFilter)) {
      showRow = false;
    }
    
    row.style.display = showRow ? '' : 'none';
  });
}