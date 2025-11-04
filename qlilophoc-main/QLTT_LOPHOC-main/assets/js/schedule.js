// Schedule management and calendar functionality
class ScheduleManager {
  constructor() {
    this.currentWeek = new Date();
    this.scheduleData = this.getSampleScheduleData();
    this.timeSlots = this.generateTimeSlots();
    this.daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    this.months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                   'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderCalendar();
    this.renderUpcoming();
    this.updateStats();
  }

  setupEventListeners() {
    document.getElementById('prevWeek').addEventListener('click', () => this.previousWeek());
    document.getElementById('nextWeek').addEventListener('click', () => this.nextWeek());
    document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());
    document.getElementById('global-search').addEventListener('input', (e) => this.filterSchedule(e.target.value));
  }

  getSampleScheduleData() {
    return [
      {
        id: 1,
        subject: 'Toán 101',
        room: 'A101',
        day: 1, // Monday
        startTime: '08:00',
        endTime: '09:30',
        instructor: 'Nguyễn Văn A',
        isMyClass: true,
        color: 'primary'
      },
      {
        id: 2,
        subject: 'Vật lý 201',
        room: 'B205',
        day: 1,
        startTime: '10:00',
        endTime: '11:30',
        instructor: 'Trần Thị B',
        isMyClass: true,
        color: 'primary'
      },
      {
        id: 3,
        subject: 'Hóa học 301',
        room: 'C301',
        day: 2,
        startTime: '08:00',
        endTime: '09:30',
        instructor: 'Lê Văn C',
        isMyClass: false,
        color: 'secondary'
      },
      {
        id: 4,
        subject: 'Tin học 401',
        room: 'D401',
        day: 3,
        startTime: '14:00',
        endTime: '15:30',
        instructor: 'Phạm Thị D',
        isMyClass: true,
        color: 'primary'
      },
      {
        id: 5,
        subject: 'Anh văn 501',
        room: 'E501',
        day: 4,
        startTime: '08:00',
        endTime: '09:30',
        instructor: 'Hoàng Văn E',
        isMyClass: true,
        color: 'primary'
      },
      {
        id: 6,
        subject: 'Lịch sử 601',
        room: 'F601',
        day: 5,
        startTime: '10:00',
        endTime: '11:30',
        instructor: 'Vũ Thị F',
        isMyClass: false,
        color: 'secondary'
      },
      {
        id: 7,
        subject: 'Toán 101',
        room: 'A101',
        day: 5,
        startTime: '14:00',
        endTime: '15:30',
        instructor: 'Nguyễn Văn A',
        isMyClass: true,
        color: 'primary'
      }
    ];
  }

  generateTimeSlots() {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        display: `${hour.toString().padStart(2, '0')}:00`
      });
    }
    return slots;
  }

  getWeekDates(date) {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  }

  formatWeekDisplay(weekDates) {
    const start = weekDates[0];
    const end = weekDates[6];
    const weekNumber = this.getWeekNumber(start);
    return `Tuần ${weekNumber} - ${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()} đến ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  }

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const weekDates = this.getWeekDates(this.currentWeek);
    
    // Update week display
    document.getElementById('currentWeek').textContent = this.formatWeekDisplay(weekDates);
    
    // Clear grid
    calendarGrid.innerHTML = '';
    
    // Add time column header
    const timeHeader = document.createElement('div');
    timeHeader.className = 'time-slot';
    timeHeader.textContent = 'Giờ';
    calendarGrid.appendChild(timeHeader);
    
    // Add day headers
    weekDates.forEach((date, index) => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';
      dayHeader.innerHTML = `
        <div>${this.daysOfWeek[index]}</div>
        <div style="font-size: 12px; margin-top: 2px;">${date.getDate()}</div>
      `;
      calendarGrid.appendChild(dayHeader);
    });
    
    // Add time slots and day cells
    this.timeSlots.forEach(timeSlot => {
      // Time slot
      const timeCell = document.createElement('div');
      timeCell.className = 'time-slot';
      timeCell.textContent = timeSlot.display;
      calendarGrid.appendChild(timeCell);
      
      // Day cells for this time slot
      weekDates.forEach((date, dayIndex) => {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        
        // Check if this is today
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
          dayCell.classList.add('today');
        }
        
        // Check if this is other month
        if (date.getMonth() !== this.currentWeek.getMonth()) {
          dayCell.classList.add('other-month');
        }
        
        // Add schedule items for this time slot and day
        const scheduleItems = this.getScheduleForTimeSlot(dayIndex + 1, timeSlot.time);
        scheduleItems.forEach(item => {
          const scheduleItem = document.createElement('div');
          scheduleItem.className = `schedule-item ${item.isMyClass ? '' : 'other-class'}`;
          scheduleItem.innerHTML = `
            <div style="font-weight: 600;">${item.subject}</div>
            <div style="font-size: 10px; opacity: 0.9;">${item.room} • ${item.startTime}-${item.endTime}</div>
            <div style="font-size: 10px; opacity: 0.8;">${item.instructor}</div>
          `;
          scheduleItem.addEventListener('click', () => this.showScheduleDetails(item));
          dayCell.appendChild(scheduleItem);
        });
        
        calendarGrid.appendChild(dayCell);
      });
    });
  }

  getScheduleForTimeSlot(day, time) {
    return this.scheduleData.filter(item => {
      if (item.day !== day) return false;
      
      const itemStart = this.timeToMinutes(item.startTime);
      const itemEnd = this.timeToMinutes(item.endTime);
      const slotTime = this.timeToMinutes(time);
      
      return slotTime >= itemStart && slotTime < itemEnd;
    });
  }

  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  renderUpcoming() {
    const upcomingList = document.getElementById('upcomingList');
    const today = new Date();
    const weekDates = this.getWeekDates(this.currentWeek);
    
    // Get upcoming classes for the next 7 days
    const upcomingClasses = [];
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dayOfWeek = checkDate.getDay() === 0 ? 7 : checkDate.getDay(); // Convert Sunday to 7
      
      const dayClasses = this.scheduleData.filter(item => item.day === dayOfWeek);
      dayClasses.forEach(cls => {
        upcomingClasses.push({
          ...cls,
          date: new Date(checkDate),
          displayDate: this.formatDate(checkDate)
        });
      });
    }
    
    // Sort by date and time
    upcomingClasses.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      return this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime);
    });
    
    // Render upcoming classes
    upcomingList.innerHTML = '';
    upcomingClasses.slice(0, 5).forEach(cls => {
      const upcomingItem = document.createElement('div');
      upcomingItem.className = 'upcoming-item';
      upcomingItem.innerHTML = `
        <div>
          <div class="upcoming-class">${cls.subject}</div>
          <div class="upcoming-room">${cls.room} • ${cls.instructor}</div>
        </div>
        <div>
          <div class="upcoming-time">${cls.displayDate}</div>
          <div class="upcoming-time">${cls.startTime}-${cls.endTime}</div>
        </div>
      `;
      upcomingItem.addEventListener('click', () => this.showScheduleDetails(cls));
      upcomingList.appendChild(upcomingItem);
    });
    
    if (upcomingClasses.length === 0) {
      upcomingList.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 20px;">Không có lịch học sắp tới</div>';
    }
  }

  formatDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Ngày mai';
    } else {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }
  }

  updateStats() {
    const weekDates = this.getWeekDates(this.currentWeek);
    const myClasses = this.scheduleData.filter(item => item.isMyClass);
    
    let totalClasses = 0;
    let totalHours = 0;
    
    myClasses.forEach(cls => {
      totalClasses++;
      const duration = this.timeToMinutes(cls.endTime) - this.timeToMinutes(cls.startTime);
      totalHours += duration / 60;
    });
    
    document.getElementById('totalClasses').textContent = totalClasses;
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
  }

  previousWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() - 7);
    this.renderCalendar();
    this.renderUpcoming();
    this.updateStats();
  }

  nextWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() + 7);
    this.renderCalendar();
    this.renderUpcoming();
    this.updateStats();
  }

  goToToday() {
    this.currentWeek = new Date();
    this.renderCalendar();
    this.renderUpcoming();
    this.updateStats();
  }

  filterSchedule(searchTerm) {
    if (!searchTerm.trim()) {
      this.renderCalendar();
      return;
    }
    
    const filteredData = this.scheduleData.filter(item => 
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Temporarily replace schedule data with filtered data
    const originalData = this.scheduleData;
    this.scheduleData = filteredData;
    this.renderCalendar();
    this.scheduleData = originalData;
  }

  showScheduleDetails(scheduleItem) {
    alert(`Chi tiết lớp học:\n\n` +
          `Môn: ${scheduleItem.subject}\n` +
          `Phòng: ${scheduleItem.room}\n` +
          `Giảng viên: ${scheduleItem.instructor}\n` +
          `Thời gian: ${scheduleItem.startTime} - ${scheduleItem.endTime}\n` +
          `Thứ: ${this.daysOfWeek[scheduleItem.day - 1] || 'Chủ nhật'}`);
  }
}

// Initialize schedule manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ScheduleManager();
});
