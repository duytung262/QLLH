// Demo accounts configuration (fallback khi không có backend)
const DEMO_ACCOUNTS = {
  student: {
    email: 'student1@example.com',
    password: 'studentpass',
    name: 'Nguyễn Văn An',
    role: 'student',
    redirect: './index.html'
  },
  teacher: {
    email: 'gv.demo@university.edu.vn',
    password: 'teacher123',
    name: 'TS. Nguyễn Văn Giảng',
    department: 'Khoa Công nghệ Thông tin',
    phone: '0123456789',
    role: 'teacher',
    redirect: './teacher-dashboard.html'
  }
};

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Current selected role
let currentRole = 'student';

// Check if backend is available
let useBackend = false;

// Test backend connection
async function checkBackend() {
  try {
    const response = await fetch(API_BASE_URL.replace('/api', '/'), { method: 'GET' });
    if (response.ok) {
      useBackend = true;
      console.log('✅ Connected to backend');
    }
  } catch (error) {
    useBackend = false;
    console.log('⚠️ Backend not available, using demo mode');
  }
}

// Initialize on page load
(function(){
  const form = document.getElementById('loginForm');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const emailErr = document.getElementById('emailErr');
  const pwdErr = document.getElementById('pwdErr');
  const toast = document.getElementById('toast');
  const demoBtn = document.getElementById('demoBtn');
  const forgotLink = document.getElementById('forgotLink');
  const forgotModal = document.getElementById('forgotModal');
  const fpEmail = document.getElementById('fpEmail');
  const fpSend = document.getElementById('fpSend');
  const fpMsg = document.getElementById('fpMsg');
  const fpClose = document.getElementById('fpClose');
  const demoInfo = document.getElementById('demoInfo');

  // Check backend on load
  checkBackend();

  // Role tabs functionality
  const roleTabs = document.querySelectorAll('.role-tab');
  roleTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      roleTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentRole = this.dataset.role;
      updateDemoInfo();
      clearErrors();
      email.value = '';
      password.value = '';
    });
  });

  // Update demo info based on selected role
  function updateDemoInfo() {
    const account = DEMO_ACCOUNTS[currentRole];
    if (currentRole === 'student') {
      demoInfo.innerHTML = `
        <h3>🎓 Tài khoản Demo - Sinh viên</h3>
        <div class="demo-credentials">
          <div><strong>Email:</strong> ${account.email}</div>
          <div><strong>Mật khẩu:</strong> ${account.password}</div>
        </div>
      `;
    } else {
      demoInfo.innerHTML = `
        <h3>👨‍🏫 Tài khoản Demo - Giảng viên</h3>
        <div class="demo-credentials">
          <div><strong>Email:</strong> ${account.email}</div>
          <div><strong>Mật khẩu:</strong> ${account.password}</div>
        </div>
      `;
    }
  }

  // Password visibility toggle
  const pwdInput = document.getElementById('password');
  const pwdToggle = document.getElementById('pwdToggle');
  if(pwdInput && pwdToggle){
    pwdToggle.addEventListener('click', ()=>{
      const isHidden = pwdInput.type === 'password';
      pwdInput.type = isHidden ? 'text' : 'password';
      pwdToggle.textContent = isHidden ? 'Ẩn' : 'Hiện';
      pwdToggle.setAttribute('aria-pressed', String(isHidden));
      pwdToggle.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu');
      pwdInput.focus();
    });
  }

  // Toast notification
  function showToast(text, timeout=2500){
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(()=> toast.classList.remove('show'), timeout);
  }

  // Email validation
  function validateEmail(val){
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(val);
  }

  // Clear all error messages
  function clearErrors(){
    emailErr.textContent='';
    pwdErr.textContent='';
    emailErr.classList.remove('show');
    pwdErr.classList.remove('show');
  }

  // Login with backend API
  async function loginWithBackend(em, pw) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: em,
          password: pw,
          role: currentRole
        })
      });

      const data = await response.json();

      if (data.success) {
        // Save user data
        localStorage.setItem('sessionEmail', em.toLowerCase());
        localStorage.setItem('userRole', currentRole);
        localStorage.setItem('userData', JSON.stringify(data.user));

        // Create profile object
        const profile = {
          name: data.user.FullName,
          email: em.toLowerCase(),
          phone: data.user.Phone || '',
          role: currentRole,
          avatar: null
        };

        if (currentRole === 'student') {
          profile.address = '';
          profile.class = data.user.Class || '';
        } else {
          profile.department = data.user.Department || '';
        }

        localStorage.setItem('profile::' + em.toLowerCase(), JSON.stringify(profile));

        // For teacher, also save session
        if (currentRole === 'teacher') {
          const teacherData = {
            email: em.toLowerCase(),
            name: data.user.FullName,
            department: data.user.Department,
            phone: data.user.Phone,
            role: 'teacher',
            loginTime: new Date().toISOString()
          };
          sessionStorage.setItem('teacherSession', JSON.stringify(teacherData));
        }

        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Không thể kết nối đến server' };
    }
  }

  // Login with demo account (fallback)
  function loginWithDemo(em, pw) {
    const account = DEMO_ACCOUNTS[currentRole];
    
    if(em.toLowerCase() === account.email.toLowerCase() && pw === account.password){
      try{
        localStorage.setItem('userPassword::' + em.toLowerCase(), pw);
        localStorage.setItem('sessionEmail', em.toLowerCase());
        const profile = {
          name: account.name,
          email: em.toLowerCase(),
          phone: account.phone || '',
          address: '',
          role: currentRole,
          avatar: null
        };
        
        if (currentRole === 'teacher') {
          profile.department = account.department;
          delete profile.address;
          
          const teacherData = {
            email: em.toLowerCase(),
            name: account.name,
            department: account.department,
            phone: account.phone,
            role: 'teacher',
            loginTime: new Date().toISOString()
          };
          sessionStorage.setItem('teacherSession', JSON.stringify(teacherData));
        }
        
        localStorage.setItem('profile::' + em.toLowerCase(), JSON.stringify(profile));
      }catch(e){}
      
      return { success: true };
    } else {
      return { success: false, message: 'Email hoặc mật khẩu không đúng.' };
    }
  }

  // Form submission handler
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    clearErrors();
    
    let ok = true;
    const em = email.value.trim();
    const pw = password.value;

    // Validate email
    if(!em){
      emailErr.textContent = 'Vui lòng nhập email.';
      emailErr.classList.add('show');
      ok = false;
    } else if(!validateEmail(em)){
      emailErr.textContent = 'Email không hợp lệ.';
      emailErr.classList.add('show');
      ok = false;
    }

    // Validate password
    if(!pw){
      pwdErr.textContent = 'Vui lòng nhập mật khẩu.';
      pwdErr.classList.add('show');
      ok = false;
    } else if(pw.length < 8){
      pwdErr.textContent = 'Mật khẩu phải có ít nhất 8 ký tự.';
      pwdErr.classList.add('show');
      ok = false;
    }

    if(!ok){
      form.animate([
        { transform:'translateX(-4px)' },
        { transform:'translateX(4px)' },
        { transform:'translateX(0)' }
      ], { duration:240, iterations:1 });
      return;
    }

    // Show loading
    showToast('Đang đăng nhập...', 10000);

    // Try backend first, fallback to demo
    let result;
    if (useBackend) {
      result = await loginWithBackend(em, pw);
    } else {
      result = loginWithDemo(em, pw);
    }

    if (result.success) {
      showToast('Đăng nhập thành công — chuyển hướng...', 1200);
      
      const redirect = currentRole === 'student' ? './index.html' : './teacher-dashboard.html';
      setTimeout(()=> {
        window.location.href = redirect;
      }, 900);
    } else {
      emailErr.textContent = result.message || 'Email hoặc mật khẩu không đúng.';
      emailErr.classList.add('show');
      
      form.animate([
        { transform:'translateX(-4px)' },
        { transform:'translateX(4px)' },
        { transform:'translateX(0)' }
      ], { duration:240, iterations:1 });
    }
  });

  // Demo button - auto fill credentials
  demoBtn.addEventListener('click', ()=>{
    const account = DEMO_ACCOUNTS[currentRole];
    email.value = account.email;
    password.value = account.password;
    clearErrors();
    showToast('Đã điền tài khoản demo', 1200);
    
    try{
      localStorage.setItem('userPassword::' + account.email.toLowerCase(), account.password);
    }catch(e){}
  });

  // Clear errors on input
  [email, password].forEach(el=>{
    el.addEventListener('input', ()=> {
      clearErrors();
    });
  });

  // Forgot password modal
  forgotLink.addEventListener('click', (e)=>{
    e.preventDefault();
    forgotModal.style.display = 'block';
    forgotModal.setAttribute('aria-hidden', 'false');
    fpEmail.focus();
  });

  fpClose.addEventListener('click', ()=>{
    forgotModal.style.display = 'none';
    forgotModal.setAttribute('aria-hidden', 'true');
    fpMsg.textContent = '';
  });

  fpSend.addEventListener('click', ()=>{
    const emailValue = fpEmail.value.trim();
    if(!emailValue){
      fpMsg.textContent = 'Vui lòng nhập email.';
      fpMsg.style.color = 'var(--danger)';
      return;
    } else if(!validateEmail(emailValue)){
      fpMsg.textContent = 'Email không hợp lệ.';
      fpMsg.style.color = 'var(--danger)';
      return;
    }

    fpMsg.textContent = 'Đã gửi liên kết đặt lại mật khẩu đến email của bạn.';
    fpMsg.style.color = 'var(--accent)';
    fpEmail.value = '';

    setTimeout(()=>{
      forgotModal.style.display = 'none';
      forgotModal.setAttribute('aria-hidden', 'true');
      fpMsg.textContent = '';
    }, 3000);
  });

  forgotModal.addEventListener('click', (e)=>{
    if(e.target === forgotModal){
      forgotModal.style.display = 'none';
      forgotModal.setAttribute('aria-hidden', 'true');
      fpMsg.textContent = '';
    }
  });

  // Check session on load
  window.addEventListener('load', function() {
    const sessionEmail = localStorage.getItem('sessionEmail');

    if (sessionEmail) {
      try {
        const profileData = localStorage.getItem('profile::' + sessionEmail.toLowerCase());
        if (profileData) {
          const profile = JSON.parse(profileData);
          showToast(`Đang đăng nhập với vai trò: ${profile.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}`, 2500);
        }
      } catch (e) {
        console.warn('Lỗi khi đọc session:', e);
      }
    }
  });

  // Logout function
  window.logout = function() {
    try {
      localStorage.removeItem('sessionEmail');
      sessionStorage.removeItem('teacherSession');
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('profile::') || k.startsWith('userPassword::')) {
          localStorage.removeItem(k);
        }
      });
      showToast('Đã đăng xuất thành công', 1500);
      setTimeout(() => {
        window.location.href = './login.html';
      }, 800);
    } catch (e) {
      console.error('Lỗi khi đăng xuất:', e);
    }
  };
})();