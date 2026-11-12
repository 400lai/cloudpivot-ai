/* 管理后台登录 */
(function () {
  'use strict';
  const App = window.App;

  function init() {
    App.qs('#forgotAdmin').addEventListener('click', function () {
      App.toast('请联系超级管理员重置密码', 'info');
    });

    App.qs('#adminLoginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const account = App.qs('#adminAccount');
      const password = App.qs('#adminPassword');
      const okAccount = App.validateField(account, account.value.trim().length > 0, '请输入管理员账号');
      const okPassword = App.validateField(password, password.value.length > 0, '请输入登录密码');
      if (!okAccount || !okPassword) return;

      App.setAdmin({
        name: '陈屿',
        account: account.value.trim(),
        role: '超级管理员',
        avatarColor: '#6366F1',
      });
      App.addLog('登录系统', '管理后台', 'login', '超级管理员通过账号密码登录管理后台');
      App.toast('登录成功，欢迎回来', 'success');
      const next = new URLSearchParams(location.search).get('next');
      setTimeout(function () {
        location.href = next && /^[a-z0-9-]+\.html$/i.test(next) ? next : 'index.html';
      }, 450);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
