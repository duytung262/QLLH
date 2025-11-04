// Simple client-side auth demo for three roles.
// This file is intentionally left blank.

const USERS = [
  { username: 'student1', password: 'student', role: 'student', display: 'Sinh viên 1' },
  { username: 'teacher1', password: 'teacher', role: 'teacher', display: 'Giảng viên 1' },
  { username: 'admin',    password: 'admin',   role: 'admin',   display: 'Admin' }
];

const LS_KEY = 'qltt_user';

const loginForm = document.getElementById('login-form');
const userArea = document.getElementById('user-area');
const welcomeText = document.getElementById('welcome-text');
const logoutBtn = document.getElementById('logout-btn');

const publicContent = document.getElementById('public-content');
const studentDash = document.getElementById('student-dashboard');
const teacherDash = document.getElementById('teacher-dashboard');
const adminDash = document.getElementById('admin-dashboard');

function showOnly(...els) {
  const all = [publicContent, studentDash, teacherDash, adminDash];
  all.forEach(e => e.classList.add('hidden'));
  els.forEach(e => e.classList.remove('hidden'));
}

function updateUIFromUser(user) {
  if (!user) {
    // not logged in
    loginForm.classList.remove('hidden');
    userArea.classList.add('hidden');
    showOnly(publicContent);
    return;
  }
  // logged in
  loginForm.classList.add('hidden');
  userArea.classList.remove('hidden');
  welcomeText.textContent = `${user.display} (${user.role})`;

  if (user.role === 'student') showOnly(studentDash);
  else if (user.role === 'teacher') showOnly(teacherDash);
  else if (user.role === 'admin') showOnly(adminDash);
  else showOnly(publicContent);
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function storeUser(user) {
  if (!user) localStorage.removeItem(LS_KEY);
  else localStorage.setItem(LS_KEY, JSON.stringify(user));
}

loginForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // find user by username + password; role is determined from matched entry
  const matched = USERS.find(u => u.username === username && u.password === password);
  if (!matched) {
    alert('Đăng nhập thất bại. Kiểm tra tài khoản và mật khẩu.');
    return;
  }
  // store a minimal user object
  const user = { username: matched.username, role: matched.role, display: matched.display };
  storeUser(user);
  updateUIFromUser(user);
});

logoutBtn.addEventListener('click', () => {
  storeUser(null);
  // clear form
  loginForm.reset();
  updateUIFromUser(null);
});

// initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const stored = getStoredUser();
  updateUIFromUser(stored);
});