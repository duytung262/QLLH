// Attendance management and analytics functionality
class AttendanceManager {
  constructor() {
    this.attendanceData = this.getSampleAttendanceData();
    this.charts = {};
    this.currentSubject = 'all';
    this.currentMonth = 'all';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderOverviewStats();
    this.renderSubjectAttendance();
    this.renderAttendanceCalendar();
    this.initCharts();
    this.updateStats();
  }

  setupEventListeners() {
    document.getElementById('subjectFilter').addEventListener('change', (e) => {
      this.currentSubject = e.target.value;
      this.renderSubjectAttendance();
      this.updateStats();
    });

    document.getElementById('monthFilter').addEventListener('change', (e) => {
      this.currentMonth = e.target.value;
      this.renderSubjectAttendance();
      this.renderAttendanceCalendar();
      this.updateStats();
    });

    document.getElementById('exportAttendance').addEventListener('click', () => {
      this.exportAttendance();
    });

    document.getElementById('global-search').addEventListener('input', (e) => {
      this.filterAttendance(e.target.value);
    });
  }

  getSampleAttendanceData() {
    return [
      {
        id: 1,
        subject: 'Toán 101',
        subjectCode: 'MATH101',
        instructor: 'Nguyễn Văn A',
        semester: '2024-2',
        records: [
          { date: '2024-10-01', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-03', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-08', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-10', status: 'late', time: '08:15', note: 'Đến muộn 15 phút' },
          { date: '2024-10-15', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-17', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-22', status: 'absent', time: '', note: 'Vắng mặt có phép' },
          { date: '2024-10-24', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-29', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-31', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-05', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-07', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-12', status: 'late', time: '08:10', note: 'Đến muộn 10 phút' },
          { date: '2024-11-14', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-19', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-21', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-26', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-28', status: 'present', time: '08:00', note: '' },
          { date: '2024-12-03', status: 'present', time: '08:00', note: '' },
          { date: '2024-12-05', status: 'present', time: '08:00', note: '' }
        ]
      },
      {
        id: 2,
        subject: 'Vật lý 201',
        subjectCode: 'PHYS201',
        instructor: 'Trần Thị B',
        semester: '2024-2',
        records: [
          { date: '2024-10-02', status: 'present', time: '10:00', note: '' },
          { date: '2024-10-04', status: 'present', time: '10:00', note: '' },
          { date: '2024-10-09', status: 'present', time: '10:00', note: '' },
          { date: '2024-10-11', status: 'present', time: '10:00', note: '' },
          { date: '2024-10-16', status: 'present', time: '10:00', note: '' },
          { date: '2024-10-18', status: 'present', time: '10:00', note: '' },
          { date: '2024-10-23', status: 'present', time: '10:00', note: '' },
          { date: '2024-10-25', status: 'present', time: '10:00', note: '' },
          { date: '2024-10-30', status: 'present', time: '10:00', note: '' },
          { date: '2024-11-01', status: 'present', time: '10:00', note: '' },
          { date: '2024-11-06', status: 'present', time: '10:00', note: '' },
          { date: '2024-11-08', status: 'present', time: '10:00', note: '' },
          { date: '2024-11-13', status: 'present', time: '10:00', note: '' },
          { date: '2024-11-15', status: 'present', time: '10:00', note: '' },
          { date: '2024-11-20', status: 'present', time: '10:00', note: '' },
          { date: '2024-11-22', status: 'present', time: '10:00', note: '' },
          { date: '2024-11-27', status: 'present', time: '10:00', note: '' },
          { date: '2024-11-29', status: 'present', time: '10:00', note: '' },
          { date: '2024-12-04', status: 'present', time: '10:00', note: '' },
          { date: '2024-12-06', status: 'present', time: '10:00', note: '' }
        ]
      },
      {
        id: 3,
        subject: 'Hóa học 301',
        subjectCode: 'CHEM301',
        instructor: 'Lê Văn C',
        semester: '2024-2',
        records: [
          { date: '2024-10-01', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-03', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-08', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-10', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-15', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-17', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-22', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-24', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-29', status: 'present', time: '08:00', note: '' },
          { date: '2024-10-31', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-05', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-07', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-12', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-14', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-19', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-21', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-26', status: 'present', time: '08:00', note: '' },
          { date: '2024-11-28', status: 'present', time: '08:00', note: '' },
          { date: '2024-12-03', status: 'present', time: '08:00', note: '' },
          { date: '2024-12-05', status: 'present', time: '08:00', note: '' }
        ]
      },
      {
        id: 4,
        subject: 'Tin học 401',
        subjectCode: 'CS401',
        instructor: 'Phạm Thị D',
        semester: '2024-1',
        records: [
          { date: '2024-03-01', status: 'present', time: '14:00', note: '' },
          { date: '2024-03-03', status: 'present', time: '14:00', note: '' },
          { date: '2024-03-08', status: 'present', time: '14:00', note: '' },
          { date: '2024-03-10', status: 'present', time: '14:00', note: '' },
          { date: '2024-03-15', status: 'present', time: '14:00', note: '' },
          { date: '2024-03-17', status: 'present', time: '14:00', note: '' },
          { date: '2024-03-22', status: 'present', time: '14:00', note: '' },
          { date: '2024-03-24', status: 'present', time: '14:00', note: '' },
          { date: '2024-03-29', status: 'present', time: '14:00', note: '' },
          { date: '2024-03-31', status: 'present', time: '14:00', note: '' },
          { date: '2024-04-05', status: 'present', time: '14:00', note: '' },
          { date: '2024-04-07', status: 'present', time: '14:00', note: '' },
          { date: '2024-04-12', status: 'present', time: '14:00', note: '' },
          { date: '2024-04-14', status: 'present', time: '14:00', note: '' },
          { date: '2024-04-19', status: 'present', time: '14:00', note: '' },
          { date: '2024-04-21', status: 'present', time: '14:00', note: '' },
          { date: '2024-04-26', status: 'present', time: '14:00', note: '' },
          { date: '2024-04-28', status: 'present', time: '14:00', note: '' },
          { date: '2024-05-03', status: 'present', time: '14:00', note: '' },
          { date: '2024-05-05', status: 'present', time: '14:00', note: '' }
        ]
      },
      {
        id: 5,
        subject: 'Anh văn 501',
        subjectCode: 'ENG501',
        instructor: 'Hoàng Văn E',
        semester: '2024-1',
        records: [
          { date: '2024-03-02', status: 'present', time: '08:00', note: '' },
          { date: '2024-03-04', status: 'present', time: '08:00', note: '' },
          { date: '2024-03-09', status: 'present', time: '08:00', note: '' },
          { date: '2024-03-11', status: 'present', time: '08:00', note: '' },
          { date: '2024-03-16', status: 'present', time: '08:00', note: '' },
          { date: '2024-03-18', status: 'present', time: '08:00', note: '' },
          { date: '2024-03-23', status: 'present', time: '08:00', note: '' },
          { date: '2024-03-25', status: 'present', time: '08:00', note: '' },
          { date: '2024-03-30', status: 'present', time: '08:00', note: '' },
          { date: '2024-04-01', status: 'present', time: '08:00', note: '' },
          { date: '2024-04-06', status: 'present', time: '08:00', note: '' },
          { date: '2024-04-08', status: 'present', time: '08:00', note: '' },
          { date: '2024-04-13', status: 'present', time: '08:00', note: '' },
          { date: '2024-04-15', status: 'present', time: '08:00', note: '' },
          { date: '2024-04-20', status: 'present', time: '08:00', note: '' },
          { date: '2024-04-22', status: 'present', time: '08:00', note: '' },
          { date: '2024-04-27', status: 'present', time: '08:00', note: '' },
          { date: '2024-04-29', status: 'present', time: '08:00', note: '' },
          { date: '2024-05-04', status: 'present', time: '08:00', note: '' },
          { date: '2024-05-06', status: 'present', time: '08:00', note: '' }
        ]
      },
      {
        id: 6,
        subject: 'Lịch sử 601',
        subjectCode: 'HIST601',
        instructor: 'Vũ Thị F',
        semester: '2024-1',
        records: [
          { date: '2024-03-01', status: 'present', time: '10:00', note: '' },
          { date: '2024-03-03', status: 'present', time: '10:00', note: '' },
          { date: '2024-03-08', status: 'present', time: '10:00', note: '' },
          { date: '2024-03-10', status: 'present', time: '10:00', note: '' },
          { date: '2024-03-15', status: 'present', time: '10:00', note: '' },
          { date: '2024-03-17', status: 'present', time: '10:00', note: '' },
          { date: '2024-03-22', status: 'present', time: '10:00', note: '' },
          { date: '2024-03-24', status: 'present', time: '10:00', note: '' },
          { date: '2024-03-29', status: 'present', time: '10:00', note: '' },
          { date: '2024-03-31', status: 'present', time: '10:00', note: '' },
          { date: '2024-04-05', status: 'present', time: '10:00', note: '' },
          { date: '2024-04-07', status: 'present', time: '10:00', note: '' },
          { date: '2024-04-12', status: 'present', time: '10:00', note: '' },
          { date: '2024-04-14', status: 'present', time: '10:00', note: '' },
          { date: '2024-04-19', status: 'present', time: '10:00', note: '' },
          { date: '2024-04-21', status: 'present', time: '10:00', note: '' },
          { date: '2024-04-26', status: 'present', time: '10:00', note: '' },
          { date: '2024-04-28', status: 'present', time: '10:00', note: '' },
          { date: '2024-05-03', status: 'present', time: '10:00', note: '' },
          { date: '2024-05-05', status: 'present', time: '10:00', note: '' }
        ]
      }
    ];
  }

  renderOverviewStats() {
    const filteredData = this.getFilteredData();
    const stats = this.calculateStats(filteredData);
    
    document.getElementById('overallAttendance').textContent = stats.attendanceRate.toFixed(1) + '%';
    document.getElementById('totalClasses').textContent = stats.totalClasses;
    document.getElementById('attendedClasses').textContent = stats.attendedClasses;
    document.getElementById('absentClasses').textContent = stats.absentClasses;
  }

  calculateStats(data) {
    let totalClasses = 0;
    let attendedClasses = 0;
    let absentClasses = 0;
    let lateClasses = 0;

    data.forEach(subject => {
      subject.records.forEach(record => {
        totalClasses++;
        if (record.status === 'present') {
          attendedClasses++;
        } else if (record.status === 'absent') {
          absentClasses++;
        } else if (record.status === 'late') {
          attendedClasses++;
          lateClasses++;
        }
      });
    });

    const attendanceRate = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

    return {
      totalClasses,
      attendedClasses,
      absentClasses,
      lateClasses,
      attendanceRate
    };
  }

  renderSubjectAttendance() {
    const filteredData = this.getFilteredData();
    const container = document.getElementById('subjectAttendanceList');
    
    container.innerHTML = '';
    
    filteredData.forEach(subject => {
      const stats = this.calculateSubjectStats(subject);
      const subjectCard = document.createElement('div');
      subjectCard.className = 'subject-card';
      subjectCard.innerHTML = `
        <div class="subject-header">
          <div class="subject-info">
            <h4>${subject.subject} (${subject.subjectCode})</h4>
            <div class="subject-meta">
              <span>${subject.semester}</span>
              <span>•</span>
              <span>${subject.instructor}</span>
              <span>•</span>
              <span>${stats.totalClasses} buổi học</span>
            </div>
          </div>
          <div class="subject-attendance">
            <div class="attendance-rate ${this.getAttendanceClass(stats.attendanceRate)}">${stats.attendanceRate.toFixed(1)}%</div>
            <div class="attendance-details">
              <span class="present">${stats.attendedClasses} có mặt</span>
              <span class="absent">${stats.absentClasses} vắng</span>
              ${stats.lateClasses > 0 ? `<span class="late">${stats.lateClasses} muộn</span>` : ''}
            </div>
          </div>
        </div>
        <div class="attendance-records">
          ${subject.records.slice(-10).map(record => `
            <div class="attendance-record ${record.status}">
              <div class="record-date">${this.formatDate(record.date)}</div>
              <div class="record-time">${record.time || '—'}</div>
              <div class="record-status">
                <span class="status-badge ${record.status}">${this.getStatusText(record.status)}</span>
              </div>
              <div class="record-note">${record.note || ''}</div>
            </div>
          `).join('')}
        </div>
      `;
      container.appendChild(subjectCard);
    });
  }

  calculateSubjectStats(subject) {
    const totalClasses = subject.records.length;
    const attendedClasses = subject.records.filter(r => r.status === 'present' || r.status === 'late').length;
    const absentClasses = subject.records.filter(r => r.status === 'absent').length;
    const lateClasses = subject.records.filter(r => r.status === 'late').length;
    const attendanceRate = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

    return {
      totalClasses,
      attendedClasses,
      absentClasses,
      lateClasses,
      attendanceRate
    };
  }

  getFilteredData() {
    let filtered = this.attendanceData;
    
    if (this.currentSubject !== 'all') {
      filtered = filtered.filter(subject => subject.subjectCode === this.currentSubject);
    }
    
    if (this.currentMonth !== 'all') {
      filtered = filtered.map(subject => ({
        ...subject,
        records: subject.records.filter(record => record.date.startsWith(this.currentMonth))
      })).filter(subject => subject.records.length > 0);
    }
    
    return filtered;
  }

  getAttendanceClass(rate) {
    if (rate >= 90) return 'excellent';
    if (rate >= 80) return 'good';
    if (rate >= 70) return 'average';
    return 'poor';
  }

  getStatusText(status) {
    const statusMap = {
      'present': 'Có mặt',
      'absent': 'Vắng mặt',
      'late': 'Muộn'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  renderAttendanceCalendar() {
    const container = document.getElementById('attendanceCalendar');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Generate calendar
    let calendarHTML = `
      <div class="calendar-header">
        <div class="month-year">${this.getMonthName(month)} ${year}</div>
      </div>
      <div class="calendar-grid">
        <div class="day-header">CN</div>
        <div class="day-header">T2</div>
        <div class="day-header">T3</div>
        <div class="day-header">T4</div>
        <div class="day-header">T5</div>
        <div class="day-header">T6</div>
        <div class="day-header">T7</div>
    `;
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendance = this.getAttendanceForDate(dateStr);
      const isToday = day === today.getDate() && month === today.getMonth();
      
      calendarHTML += `
        <div class="calendar-day ${attendance ? attendance.status : ''} ${isToday ? 'today' : ''}">
          <div class="day-number">${day}</div>
          ${attendance ? `<div class="attendance-indicator ${attendance.status}"></div>` : ''}
        </div>
      `;
    }
    
    calendarHTML += '</div>';
    container.innerHTML = calendarHTML;
  }

  getAttendanceForDate(dateStr) {
    for (const subject of this.attendanceData) {
      const record = subject.records.find(r => r.date === dateStr);
      if (record) {
        return {
          status: record.status,
          subject: subject.subject,
          time: record.time
        };
      }
    }
    return null;
  }

  getMonthName(month) {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                   'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return months[month];
  }

  initCharts() {
    this.initAttendanceChart();
  }

  initAttendanceChart() {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    const data = this.getFilteredData();
    
    // Group by month
    const monthlyData = {};
    data.forEach(subject => {
      subject.records.forEach(record => {
        const month = record.date.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = { present: 0, absent: 0, late: 0 };
        }
        if (record.status === 'present') monthlyData[month].present++;
        else if (record.status === 'absent') monthlyData[month].absent++;
        else if (record.status === 'late') monthlyData[month].late++;
      });
    });
    
    const months = Object.keys(monthlyData).sort();
    const presentData = months.map(month => monthlyData[month].present);
    const absentData = months.map(month => monthlyData[month].absent);
    const lateData = months.map(month => monthlyData[month].late);
    
    this.charts.attendance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months.map(month => this.formatMonthLabel(month)),
        datasets: [
          {
            label: 'Có mặt',
            data: presentData,
            backgroundColor: '#4caf50',
            borderColor: '#4caf50',
            borderWidth: 1
          },
          {
            label: 'Vắng mặt',
            data: absentData,
            backgroundColor: '#f44336',
            borderColor: '#f44336',
            borderWidth: 1
          },
          {
            label: 'Muộn',
            data: lateData,
            backgroundColor: '#ff9800',
            borderColor: '#ff9800',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  formatMonthLabel(monthStr) {
    const [year, month] = monthStr.split('-');
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return `${monthNames[parseInt(month) - 1]}/${year}`;
  }

  updateStats() {
    this.renderOverviewStats();
    if (this.charts.attendance) {
      this.charts.attendance.destroy();
    }
    this.initCharts();
  }

  filterAttendance(searchTerm) {
    const filteredData = this.attendanceData.filter(subject => 
      subject.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Temporarily replace data
    const originalData = this.attendanceData;
    this.attendanceData = filteredData;
    this.renderSubjectAttendance();
    this.updateStats();
    this.attendanceData = originalData;
  }

  exportAttendance() {
    const data = this.getFilteredData();
    let csvContent = "Môn học,Mã môn,Học kỳ,Giảng viên,Ngày,Trạng thái,Giờ,Ghi chú\n";
    
    data.forEach(subject => {
      subject.records.forEach(record => {
        csvContent += `${subject.subject},${subject.subjectCode},${subject.semester},${subject.instructor},${record.date},${this.getStatusText(record.status)},${record.time},${record.note}\n`;
      });
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'diem_danh.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Initialize attendance manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AttendanceManager();
});
