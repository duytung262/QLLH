// Grades management and analytics functionality
class GradesManager {
  constructor() {
    this.gradesData = this.getSampleGradesData();
    this.charts = {};
    this.currentSemester = 'all';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderOverviewStats();
    this.renderSubjectGrades();
    this.initCharts();
    this.updateStats();
  }

  setupEventListeners() {
    document.getElementById('semesterFilter').addEventListener('change', (e) => {
      this.currentSemester = e.target.value;
      this.renderSubjectGrades();
      this.updateStats();
    });

    document.getElementById('exportGrades').addEventListener('click', () => {
      this.exportGrades();
    });

    document.getElementById('global-search').addEventListener('input', (e) => {
      this.filterGrades(e.target.value);
    });
  }

  getSampleGradesData() {
    return [
      {
        id: 1,
        subject: 'Toán 101',
        subjectCode: 'MATH101',
        credits: 4,
        semester: '2024-2',
        semesterName: 'Học kỳ 2 - 2024',
        instructor: 'Nguyễn Văn A',
        grades: [
          { type: 'Giữa kỳ', score: 8.5, weight: 30, date: '2024-10-15' },
          { type: 'Cuối kỳ', score: 7.8, weight: 50, date: '2024-12-20' },
          { type: 'Thực hành', score: 9.2, weight: 20, date: '2024-12-18' }
        ],
        finalGrade: 8.2,
        letterGrade: 'B+',
        status: 'passed'
      },
      {
        id: 2,
        subject: 'Vật lý 201',
        subjectCode: 'PHYS201',
        credits: 3,
        semester: '2024-2',
        semesterName: 'Học kỳ 2 - 2024',
        instructor: 'Trần Thị B',
        grades: [
          { type: 'Giữa kỳ', score: 9.1, weight: 30, date: '2024-10-20' },
          { type: 'Cuối kỳ', score: 8.9, weight: 50, date: '2024-12-22' },
          { type: 'Thực hành', score: 9.5, weight: 20, date: '2024-12-19' }
        ],
        finalGrade: 9.1,
        letterGrade: 'A',
        status: 'passed'
      },
      {
        id: 3,
        subject: 'Hóa học 301',
        subjectCode: 'CHEM301',
        credits: 4,
        semester: '2024-2',
        semesterName: 'Học kỳ 2 - 2024',
        instructor: 'Lê Văn C',
        grades: [
          { type: 'Giữa kỳ', score: 7.2, weight: 30, date: '2024-10-18' },
          { type: 'Cuối kỳ', score: 6.8, weight: 50, date: '2024-12-21' },
          { type: 'Thực hành', score: 8.0, weight: 20, date: '2024-12-17' }
        ],
        finalGrade: 7.2,
        letterGrade: 'B',
        status: 'passed'
      },
      {
        id: 4,
        subject: 'Tin học 401',
        subjectCode: 'CS401',
        credits: 3,
        semester: '2024-1',
        semesterName: 'Học kỳ 1 - 2024',
        instructor: 'Phạm Thị D',
        grades: [
          { type: 'Giữa kỳ', score: 9.8, weight: 30, date: '2024-04-15' },
          { type: 'Cuối kỳ', score: 9.5, weight: 50, date: '2024-06-20' },
          { type: 'Dự án', score: 9.9, weight: 20, date: '2024-06-18' }
        ],
        finalGrade: 9.6,
        letterGrade: 'A+',
        status: 'passed'
      },
      {
        id: 5,
        subject: 'Anh văn 501',
        subjectCode: 'ENG501',
        credits: 2,
        semester: '2024-1',
        semesterName: 'Học kỳ 1 - 2024',
        instructor: 'Hoàng Văn E',
        grades: [
          { type: 'Giữa kỳ', score: 8.0, weight: 30, date: '2024-04-20' },
          { type: 'Cuối kỳ', score: 7.5, weight: 50, date: '2024-06-22' },
          { type: 'Thuyết trình', score: 8.5, weight: 20, date: '2024-06-19' }
        ],
        finalGrade: 7.8,
        letterGrade: 'B+',
        status: 'passed'
      },
      {
        id: 6,
        subject: 'Lịch sử 601',
        subjectCode: 'HIST601',
        credits: 2,
        semester: '2024-1',
        semesterName: 'Học kỳ 1 - 2024',
        instructor: 'Vũ Thị F',
        grades: [
          { type: 'Giữa kỳ', score: 6.5, weight: 30, date: '2024-04-18' },
          { type: 'Cuối kỳ', score: 5.8, weight: 50, date: '2024-06-21' },
          { type: 'Tiểu luận', score: 6.2, weight: 20, date: '2024-06-17' }
        ],
        finalGrade: 6.1,
        letterGrade: 'C+',
        status: 'passed'
      }
    ];
  }

  renderOverviewStats() {
    const filteredData = this.getFilteredData();
    const stats = this.calculateStats(filteredData);
    
    document.getElementById('overallGPA').textContent = stats.gpa.toFixed(1);
    document.getElementById('totalCredits').textContent = stats.totalCredits;
    document.getElementById('passedSubjects').textContent = stats.passedSubjects;
    document.getElementById('excellentGrades').textContent = stats.excellentGrades;
  }

  calculateStats(data) {
    const totalCredits = data.reduce((sum, subject) => sum + subject.credits, 0);
    const passedSubjects = data.filter(subject => subject.status === 'passed').length;
    const excellentGrades = data.filter(subject => ['A+', 'A'].includes(subject.letterGrade)).length;
    
    // Calculate GPA (4.0 scale)
    const gradePoints = data.map(subject => {
      const gradeMap = { 'A+': 4.0, 'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
      return gradeMap[subject.letterGrade] || 0;
    });
    
    const gpa = gradePoints.length > 0 ? gradePoints.reduce((sum, gp) => sum + gp, 0) / gradePoints.length : 0;
    
    return {
      gpa,
      totalCredits,
      passedSubjects,
      excellentGrades,
      totalSubjects: data.length
    };
  }

  renderSubjectGrades() {
    const filteredData = this.getFilteredData();
    const container = document.getElementById('subjectGradesList');
    
    container.innerHTML = '';
    
    filteredData.forEach(subject => {
      const subjectCard = document.createElement('div');
      subjectCard.className = 'subject-card';
      subjectCard.innerHTML = `
        <div class="subject-header">
          <div class="subject-info">
            <h4>${subject.subject} (${subject.subjectCode})</h4>
            <div class="subject-meta">
              <span>${subject.semesterName}</span>
              <span>•</span>
              <span>${subject.credits} tín chỉ</span>
              <span>•</span>
              <span>${subject.instructor}</span>
            </div>
          </div>
          <div class="subject-grade">
            <div class="final-grade ${this.getGradeClass(subject.letterGrade)}">${subject.finalGrade}</div>
            <div class="letter-grade">${subject.letterGrade}</div>
          </div>
        </div>
        <div class="grades-breakdown">
          ${subject.grades.map(grade => `
            <div class="grade-item">
              <div class="grade-type">${grade.type}</div>
              <div class="grade-score">${grade.score}</div>
              <div class="grade-weight">${grade.weight}%</div>
              <div class="grade-date">${this.formatDate(grade.date)}</div>
            </div>
          `).join('')}
        </div>
      `;
      container.appendChild(subjectCard);
    });
  }

  getFilteredData() {
    if (this.currentSemester === 'all') {
      return this.gradesData;
    }
    return this.gradesData.filter(subject => subject.semester === this.currentSemester);
  }

  getGradeClass(letterGrade) {
    if (['A+', 'A'].includes(letterGrade)) return 'excellent';
    if (['B+', 'B'].includes(letterGrade)) return 'good';
    if (['C+', 'C'].includes(letterGrade)) return 'average';
    return 'poor';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  initCharts() {
    this.initGradesChart();
    this.initGradeDistributionChart();
  }

  initGradesChart() {
    const ctx = document.getElementById('gradesChart').getContext('2d');
    const data = this.getFilteredData();
    
    this.charts.grades = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(subject => subject.subject),
        datasets: [{
          label: 'Điểm số',
          data: data.map(subject => subject.finalGrade),
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              callback: function(value) {
                return value.toFixed(1);
              }
            }
          }
        }
      }
    });
  }

  initGradeDistributionChart() {
    const ctx = document.getElementById('gradeDistributionChart').getContext('2d');
    const data = this.getFilteredData();
    
    const gradeCounts = {
      'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0
    };
    
    data.forEach(subject => {
      gradeCounts[subject.letterGrade] = (gradeCounts[subject.letterGrade] || 0) + 1;
    });
    
    this.charts.distribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(gradeCounts).filter(grade => gradeCounts[grade] > 0),
        datasets: [{
          data: Object.values(gradeCounts).filter(count => count > 0),
          backgroundColor: [
            '#4caf50', // A+
            '#66bb6a', // A
            '#81c784', // B+
            '#a5d6a7', // B
            '#c8e6c9', // C+
            '#e8f5e8', // C
            '#ffcdd2', // D
            '#ffebee'  // F
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  updateStats() {
    this.renderOverviewStats();
    if (this.charts.grades) {
      this.charts.grades.destroy();
    }
    if (this.charts.distribution) {
      this.charts.distribution.destroy();
    }
    this.initCharts();
  }

  filterGrades(searchTerm) {
    const filteredData = this.gradesData.filter(subject => 
      subject.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Temporarily replace data
    const originalData = this.gradesData;
    this.gradesData = filteredData;
    this.renderSubjectGrades();
    this.updateStats();
    this.gradesData = originalData;
  }

  exportGrades() {
    const data = this.getFilteredData();
    let csvContent = "Môn học,Mã môn,Tín chỉ,Học kỳ,Giảng viên,Điểm số,Điểm chữ\n";
    
    data.forEach(subject => {
      csvContent += `${subject.subject},${subject.subjectCode},${subject.credits},${subject.semesterName},${subject.instructor},${subject.finalGrade},${subject.letterGrade}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'diem_so.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Initialize grades manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new GradesManager();
});
