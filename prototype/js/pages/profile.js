/* 个人中心 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;

  let user = null;
  let pendingAvatar = null;

  function maskedPhone(phone) {
    const str = String(phone || '');
    if (/^\d{11}$/.test(str)) return str.slice(0, 3) + '****' + str.slice(-4);
    return str || '未绑定';
  }

  function avatarMarkup(sizeCls) {
    if (pendingAvatar || (user && user.avatar)) {
      return '<span class="avatar ' + (sizeCls || '') + '"><img src="' + (pendingAvatar || user.avatar) + '" alt="用户头像"></span>';
    }
    return App.avatarHTML(user.name, user.avatarColor, sizeCls || '');
  }

  function renderProfile() {
    const name = user.name || '学员';
    App.qs('#profileAvatar').innerHTML = avatarMarkup('lg');
    App.qs('#avatarPreview').innerHTML = avatarMarkup('lg');
    App.qs('#profileName').textContent = name;
    App.qs('#profileRole').textContent = user.role || '学员';
    App.qs('#profileJoined').textContent = (user.joined || '2025-08-12') + ' 加入';

    const mistakeCount = App.getMistakes().length;
    const interviewCount = App.getInterviewHistory().length;
    App.qs('#profileStats').innerHTML =
      '<div class="profile-stat"><b>' + Data.HOME.learning.total + '</b><span>做题数</span></div>' +
      '<div class="profile-stat"><b>' + interviewCount + '</b><span>面试数</span></div>' +
      '<div class="profile-stat"><b>' + mistakeCount + '</b><span>错题数</span></div>';

    App.qs('#profileUsername').value = user.name || '';
    App.qs('#profilePhone').value = maskedPhone(user.phone);
    App.qs('#profileEmail').value = user.email || '';
    App.qs('#profileGender').value = user.gender || '保密';

    App.qs('#profileLearning').innerHTML =
      '<div class="profile-data"><span class="icon-tile brand">' + window.icon('checkCircle', 18) + '</span><b>' + Data.HOME.learning.total + '</b><span>已完成题目</span></div>' +
      '<div class="profile-data"><span class="icon-tile green">' + window.icon('target', 18) + '</span><b>' + Data.HOME.learning.accuracy + '%</b><span>答题正确率</span></div>' +
      '<div class="profile-data"><span class="icon-tile purple">' + window.icon('mic', 18) + '</span><b>' + interviewCount + '</b><span>AI 面试次数</span></div>';
    window.hydrateIcons(App.qs('#profileLearning'));
  }

  function handleAvatar(file) {
    if (!file) return;
    if (!/image\/(jpeg|png)/.test(file.type)) {
      App.toast('仅支持 JPG、PNG 格式的图片', 'warning');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      App.toast('图片大小不能超过 2MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      pendingAvatar = String(reader.result);
      renderProfile();
      App.toast('头像已更新，记得点击保存修改', 'success');
    };
    reader.readAsDataURL(file);
  }

  function init() {
    user = App.requireAuth();
    if (!user) return;
    renderProfile();

    App.qs('#uploadAvatarBtn').addEventListener('click', function () { App.qs('#avatarInput').click(); });
    App.qs('#avatarInput').addEventListener('change', function (e) {
      handleAvatar(e.target.files[0]);
      e.target.value = '';
    });

    App.qs('#profileForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const nameInput = App.qs('#profileUsername');
      const emailInput = App.qs('#profileEmail');
      const okName = App.validateField(nameInput, nameInput.value.trim().length > 0, '用户名不能为空');
      const email = emailInput.value.trim();
      const okEmail = App.validateField(emailInput, !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), '请输入正确的邮箱地址');
      if (!okName || !okEmail) return;

      user.name = nameInput.value.trim();
      user.email = email;
      user.gender = App.qs('#profileGender').value;
      if (/^\d{11}$/.test(String(user.phone))) user.phone = maskedPhone(user.phone);
      if (pendingAvatar) { user.avatar = pendingAvatar; pendingAvatar = null; }
      App.setUser(user);
      renderProfile();

      // 同步顶栏显示
      const navName = App.qs('.nav-user-name');
      if (navName) navName.textContent = user.name;
      const navAvatar = App.qs('.nav-user .avatar');
      if (navAvatar && user.avatar) navAvatar.innerHTML = '<img src="' + user.avatar + '" alt="">';

      App.toast('个人资料已保存', 'success');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
