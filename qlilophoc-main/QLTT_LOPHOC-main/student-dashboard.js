// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  checkAuthentication();
  
  initNavigation();
  initModals();
  loadStudentProfile();
  setupEventListeners();
});

// Check if student is logged in
function checkAuthentication() {
  const sessionEmail = localStorage.getItem('sessionEmail');
  if (!sessionEmail) {
    // Not logged in, redirect to login
    window.location.href = 'login.html';
  }
}

// Load student profile
function loadStudentProfile() {
  const sessionEmail = localStorage.getItem('sessionEmail');
  if (!sessionEmail) return;
  
  const profile = loadProfile(sessionEmail);
  
  // Update profile section
  const studentName = document.getElementById('studentName');
  const studentRole = document.getElementById('studentRole');
  const studentAvatar = document.getElementById('studentAvatar');
  const avatarImg = document.getElementById('avatarImg');
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');
  
  if (studentName) {
    studentName.textContent = profile.name || 'Sinh viên';
  }
  
  if (studentRole) {
    studentRole.textContent = getRoleLabel(profile.role);
  }
  
  // Update avatar
  if (profile.avatar) {
    avatarImg.src = profile.avatar;
    avatarImg.style.display = 'block';
    avatarPlaceholder.style.display = 'none';
  } else {
    avatarImg.style.display = 'none';
    const initials = getInitials(profile.name);
    avatarPlaceholder.textContent = initials;
    avatarPlaceholder.style.display = 'flex';
  }
  
  // Update settings display
  document.getElementById('displayName').textContent = profile.name || 'Chưa cập nhật';
  document.getElementById('displayEmail').textContent = profile.email || 'Chưa cập nhật';
  document.getElementById('displayPhone').textContent = profile.phone || 'Chưa cập nhật';
  document.getElementById('displayAddress').textContent = profile.address || 'Chưa cập nhật';
}

// Helper functions
function loadProfile(email) {
  if (!email) return null;
  try {
    const raw = localStorage.getItem('profile::' + email.toLowerCase());
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {
    name: email.split('@')[0] || '',
    email: email,
    phone: '',
    address: '',
    role: 'student',
    avatar: null
  };
}

function saveProfile(obj) {
  if (!obj || !obj.email) return;
  try {
    localStorage.setItem('profile::' + obj.email.toLowerCase(), JSON.stringify(obj));
  } catch(e) {}
}

function getInitials(name) {
  if (!name) return 'SV';
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return (names[names.length - 2][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

function getRoleLabel(role) {
  const labels = {
    student: 'Sinh viên',
    teacher: 'Giảng viên',
    admin: 'Quản trị viên'
  };
  return labels[role] || 'Sinh viên';
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

// Event Listeners Setup
function setupEventListeners() {
  // Edit Profile
  document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    const sessionEmail = localStorage.getItem('sessionEmail');
    const profile = loadProfile(sessionEmail);
    
    // Fill modal with current data
    document.getElementById('modalName').value = profile.name || '';
    document.getElementById('modalEmail').value = profile.email || '';
    document.getElementById('modalPhone').value = profile.phone || '';
    document.getElementById('modalAddress').value = profile.address || '';
    
    // Update modal avatar
    const modalAvatarImg = document.getElementById('modalAvatarImg');
    const modalAvatarPlaceholder = document.getElementById('modalAvatarPlaceholder');
    
    if (profile.avatar) {
      modalAvatarImg.src = profile.avatar;
      modalAvatarImg.style.display = 'block';
      modalAvatarPlaceholder.style.display = 'none';
    } else {
      modalAvatarImg.style.display = 'none';
      modalAvatarPlaceholder.textContent = getInitials(profile.name);
      modalAvatarPlaceholder.style.display = 'flex';
    }
    
    openModal('profileModal');
  });
  
  // Avatar upload
  document.getElementById('avatarInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const dataUrl = event.target.result;
      
      // Update modal avatar preview
      const modalAvatarImg = document.getElementById('modalAvatarImg');
      const modalAvatarPlaceholder = document.getElementById('modalAvatarPlaceholder');
      
      modalAvatarImg.src = dataUrl;
      modalAvatarImg.style.display = 'block';
      modalAvatarPlaceholder.style.display = 'none';
      
      // Store temporarily
      document.getElementById('avatarInput')._avatarData = dataUrl;
    };
    reader.readAsDataURL(file);
  });
  
  // Remove avatar
  document.getElementById('removeAvatarBtn')?.addEventListener('click', () => {
    const modalAvatarImg = document.getElementById('modalAvatarImg');
    const modalAvatarPlaceholder = document.getElementById('modalAvatarPlaceholder');
    
    modalAvatarImg.src = '';
    modalAvatarImg.style.display = 'none';
    
    const name = document.getElementById('modalName').value;
    modalAvatarPlaceholder.textContent = getInitials(name);
    modalAvatarPlaceholder.style.display = 'flex';
    
    document.getElementById('avatarInput')._avatarData = null;
    document.getElementById('avatarInput').value = '';
  });
  
  // Save Profile
  document.getElementById('saveProfileBtn')?.addEventListener('click', () => {
    const name = document.getElementById('modalName').value.trim();
    const email = document.getElementById('modalEmail').value.trim();
    const phone = document.getElementById('modalPhone').value.trim();
    const address = document.getElementById('modalAddress').value.trim();
    
    if (!name) {
      alert('Vui lòng nhập họ tên');
      return;
    }
    
    const sessionEmail = localStorage.getItem('sessionEmail');
    const currentProfile = loadProfile(sessionEmail);
    
    // Get avatar data
    const avatarInput = document.getElementById('avatarInput');
    let avatar = avatarInput._avatarData !== undefined 
      ? avatarInput._avatarData 
      : currentProfile.avatar;
    
    const updatedProfile = {
      name: name,
      email: email,
      phone: phone,
      address: address,
      role: currentProfile.role,
      avatar: avatar
    };
    
    saveProfile(updatedProfile);
    loadStudentProfile();
    closeModal('profileModal');
    
    alert('Đã cập nhật hồ sơ thành công!');
  });
  
  // Change Password
  document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
    openModal('passwordModal');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordError').style.display = 'none';
  });
  
  // Save Password
  document.getElementById('savePasswordBtn')?.addEventListener('click', () => {
    const currentPwd = document.getElementById('currentPassword').value;
    const newPwd = document.getElementById('newPassword').value;
    const confirmPwd = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordError');
    
    errorDiv.style.display = 'none';
    
    if (!currentPwd || !newPwd || !confirmPwd) {
      errorDiv.textContent = 'Vui lòng điền đầy đủ thông tin';
      errorDiv.style.display = 'block';
      return;
    }
    
    if (newPwd.length < 8) {
      errorDiv.textContent = 'Mật khẩu mới phải có ít nhất 8 ký tự';
      errorDiv.style.display = 'block';
      return;
    }
    
    if (newPwd !== confirmPwd) {
      errorDiv.textContent = 'Mật khẩu xác nhận không khớp';
      errorDiv.style.display = 'block';
      return;
    }
    
    // Check current password
    const sessionEmail = localStorage.getItem('sessionEmail');
    const storedPwd = localStorage.getItem('userPassword::' + sessionEmail.toLowerCase());
    
    if (currentPwd !== storedPwd) {
      errorDiv.textContent = 'Mật khẩu hiện tại không đúng';
      errorDiv.style.display = 'block';
      return;
    }
    
    // Save new password
    try {
      localStorage.setItem('userPassword::' + sessionEmail.toLowerCase(), newPwd);
      localStorage.setItem('pwChanged::' + sessionEmail.toLowerCase(), Date.now().toString());
    } catch(e) {}
    
    closeModal('passwordModal');
    alert('Đổi mật khẩu thành công!');
  });
  
  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      localStorage.removeItem('sessionEmail');
      window.location.href = 'login.html';
    }
  });
}