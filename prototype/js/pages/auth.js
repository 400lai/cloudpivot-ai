/* 登录 / 注册 / 找回密码 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;

  function phoneOK(v) { return /^1[3-9]\d{9}$/.test(String(v || '').trim()); }
  function codeOK(v) { return /^\d{6}$/.test(String(v || '').trim()); }

  function bindCodeButton(btn, phoneInput) {
    if (!btn) return;
    btn.addEventListener('click', function () {
      const phone = phoneInput ? phoneInput.value : '';
      if (!phoneOK(phone)) {
        if (phoneInput) App.validateField(phoneInput, false, '请输入正确的 11 位手机号');
        App.toast('请先输入正确的手机号', 'warning');
        return;
      }
      App.startCountdown(btn, 60);
      App.toast('验证码已发送至 ' + phone.slice(0, 3) + '****' + phone.slice(-4) + '（演示：任意 6 位）', 'success');
    });
  }

  function loginNameFromAccount(account) {
    if (account.indexOf('@') > -1) return account.split('@')[0];
    return '林小满';
  }

  function doLogin(account) {
    const demo = Object.assign({}, Data.DEMO_STUDENT);
    if (account && account.indexOf('@') > -1) demo.email = account;
    if (account && /^\d+$/.test(account)) demo.phone = account;
    demo.name = loginNameFromAccount(account || '');
    demo.id = 'stu-demo';
    App.setUser(demo);
    App.toast('登录成功，欢迎回来，' + demo.name, 'success');
    const next = new URLSearchParams(location.search).get('next');
    setTimeout(function () {
      if (next) location.href = decodeURIComponent(next);
      else location.href = 'index.html';
    }, 500);
  }

  function initLogin() {
    const tabs = App.qsa('[data-login-tab]');
    const passwordForm = App.qs('#passwordForm');
    const codeForm = App.qs('#codeForm');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isPassword = tab.getAttribute('data-login-tab') === 'password';
        passwordForm.classList.toggle('hidden', !isPassword);
        codeForm.classList.toggle('hidden', isPassword);
      });
    });

    passwordForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const account = App.qs('#account');
      const password = App.qs('#password');
      const okAccount = App.validateField(account, account.value.trim().length > 0, '请输入手机号或邮箱');
      const okPassword = App.validateField(password, password.value.length > 0, '请输入密码');
      if (!okAccount || !okPassword) return;
      doLogin(account.value.trim());
    });

    bindCodeButton(App.qs('#loginCodeBtn'), App.qs('#loginPhone'));
    codeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const phone = App.qs('#loginPhone');
      const code = App.qs('#loginCode');
      const okPhone = App.validateField(phone, phoneOK(phone.value), '请输入正确的 11 位手机号');
      const okCode = App.validateField(code, codeOK(code.value), '请输入 6 位验证码');
      if (!okPhone || !okCode) return;
      doLogin(phone.value.trim());
    });

    App.qsa('[data-oauth]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        App.toast(btn.getAttribute('data-oauth') + ' 第三方登录为原型占位，请使用账号密码登录', 'info');
      });
    });
  }

  function initRegister() {
    const phone = App.qs('#regPhone');
    const code = App.qs('#regCode');
    const password = App.qs('#regPassword');
    const confirm = App.qs('#regConfirm');
    const agree = App.qs('#agree');
    const agreeError = App.qs('#agreeError');
    const strengthBar = App.qs('#strengthBar');
    bindCodeButton(App.qs('#regCodeBtn'), phone);

    password.addEventListener('input', function () {
      const result = App.passwordStrength(password.value);
      const segs = App.qsa('.seg', strengthBar);
      segs.forEach(function (seg, i) {
        seg.className = 'seg';
        if (i < result.level) seg.classList.add('on-' + result.level);
      });
      const txt = strengthBar.querySelector('.txt');
      txt.textContent = result.label || '—';
      txt.style.color = result.level === 1 ? 'var(--red)' : result.level === 2 ? 'var(--amber-strong)' : result.level === 3 ? 'var(--green-strong)' : 'var(--muted-2)';
    });

    App.qsa('[data-placeholder]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        App.toast(a.getAttribute('data-placeholder') + '页面本期为占位，暂未开发', 'info');
      });
    });

    App.qs('#registerForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const okPhone = App.validateField(phone, phoneOK(phone.value), '请输入正确的 11 位手机号');
      const okCode = App.validateField(code, codeOK(code.value), '请输入 6 位验证码');
      const okPwd = App.validateField(password, password.value.length >= 6 && password.value.length <= 20, '密码需为 6-20 位');
      const okConfirm = App.validateField(confirm, confirm.value === password.value && confirm.value.length > 0, '两次输入的密码不一致');
      if (!agree.checked) {
        agreeError.style.display = 'block';
      } else {
        agreeError.style.display = 'none';
      }
      if (!okPhone || !okCode || !okPwd || !okConfirm || !agree.checked) return;

      App.setUser({
        id: 'stu-demo',
        name: '新学员',
        phone: phone.value.trim(),
        email: '',
        gender: '保密',
        avatar: '',
        role: '学员',
        joined: new Date().toISOString().slice(0, 10),
        avatarColor: '#8B5CF6',
      });
      App.openModal({
        title: '注册成功',
        body:
          '<div class="text-center" style="padding:6px 0 2px">' +
            '<div class="success-icon" style="display:grid;place-items:center;width:68px;height:68px;border-radius:50%;background:var(--green-soft);color:var(--green-strong);margin:0 auto 16px">' + window.icon('checkCircle', 32) + '</div>' +
            '<h3 style="font-size:19px">欢迎加入云枢智学</h3>' +
            '<p class="small muted" style="margin-top:8px;line-height:1.75">下一步，去个人中心完善资料并选择你的技术方向，我们会为你推荐更合适的内容。</p>' +
          '</div>',
        footer:
          '<a class="btn btn-outline" href="questions.html">先去刷题</a>' +
          '<a class="btn btn-primary" href="profile.html">去完善资料</a>',
        onClose: function () { location.href = 'profile.html'; },
      });
    });
  }

  function updateForgotSteps(step) {
    App.qsa('#forgotSteps [data-fstep]').forEach(function (el) {
      const n = Number(el.getAttribute('data-fstep'));
      el.classList.toggle('active', n === step);
      el.classList.toggle('done', n < step);
      if (n < step) el.querySelector('.n').textContent = '✓';
    });
    App.qsa('#forgotAsideSteps .auth-step').forEach(function (el) {
      const n = Number(el.getAttribute('data-step'));
      el.classList.toggle('active', n === step);
      el.classList.toggle('done', n < step);
    });
  }

  function initForgot() {
    const step1 = App.qs('#forgotStep1');
    const step2 = App.qs('#forgotStep2');
    const step3 = App.qs('#forgotStep3');
    const phone = App.qs('#forgotPhone');
    const code = App.qs('#forgotCode');
    bindCodeButton(App.qs('#forgotCodeBtn'), phone);

    step1.addEventListener('submit', function (e) {
      e.preventDefault();
      const okPhone = App.validateField(phone, phoneOK(phone.value), '请输入正确的 11 位手机号');
      const okCode = App.validateField(code, codeOK(code.value), '请输入 6 位验证码');
      if (!okPhone || !okCode) return;
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
      updateForgotSteps(2);
      App.toast('手机验证通过，请设置新密码', 'success');
    });

    const newPassword = App.qs('#newPassword');
    const newConfirm = App.qs('#newConfirm');
    step2.addEventListener('submit', function (e) {
      e.preventDefault();
      const okPwd = App.validateField(newPassword, newPassword.value.length >= 6, '新密码至少 6 位');
      const okConfirm = App.validateField(newConfirm, newConfirm.value === newPassword.value && newConfirm.value.length > 0, '两次输入的密码不一致');
      if (!okPwd || !okConfirm) return;
      step2.classList.add('hidden');
      step3.classList.remove('hidden');
      updateForgotSteps(3);
      App.toast('密码重置成功', 'success');
    });
  }

  function init() {
    if (App.qs('#passwordForm')) initLogin();
    else if (App.qs('#registerForm')) initRegister();
    else if (App.qs('#forgotStep1')) initForgot();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
