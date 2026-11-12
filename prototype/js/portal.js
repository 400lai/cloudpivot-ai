/* 云枢智学 · 学员端公共逻辑（导航态 / 页脚 / 登录守卫） */
(function () {
  'use strict';
  const App = window.App;

  function currentPage() {
    return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }

  const NAV_MAP = {
    'index.html': 'home',
    'routes.html': 'roadmap',
    'questions.html': 'questions',
    'practice.html': 'questions',
    'wrong-book.html': 'questions',
    'ai-config.html': 'interview',
    'ai-interview.html': 'interview',
    'interview-report.html': 'interview',
    'interview-history.html': 'interview',
  };

  function renderNavActions() {
    const host = App.qs('#navActions');
    if (!host) return;
    const user = App.getUser();
    if (!user) {
      host.innerHTML =
        '<a class="nav-ghost" href="login.html">登录</a>' +
        '<a class="btn btn-primary btn-sm" href="register.html">免费注册</a>';
      return;
    }
    const admin = App.getAdmin();
    host.innerHTML =
      '<div class="dropdown">' +
        '<button class="nav-user" data-dropdown-toggle aria-haspopup="menu">' +
          App.avatarHTML(user.name, user.avatarColor, '', user.avatar) +
          '<span class="nav-user-name">' + App.escapeHTML(user.name) + '</span>' +
          window.icon('chevronDown', 14) +
        '</button>' +
        '<div class="dropdown-menu" role="menu">' +
          '<div class="dropdown-label">' + App.escapeHTML(user.name) + ' · ' + App.escapeHTML(user.role || '学员') + '</div>' +
          '<a class="dropdown-item" href="profile.html">' + window.icon('user', 16) + '个人中心</a>' +
          '<a class="dropdown-item" href="wrong-book.html">' + window.icon('alertCircle', 16) + '我的错题</a>' +
          '<a class="dropdown-item" href="interview-history.html">' + window.icon('clock', 16) + '面试记录</a>' +
          (admin ? '<div class="dropdown-sep"></div><a class="dropdown-item" href="../admin/index.html">' + window.icon('grid', 16) + '管理后台</a>' : '') +
          '<div class="dropdown-sep"></div>' +
          '<button class="dropdown-item danger" data-logout>' + window.icon('logout', 16) + '退出登录</button>' +
        '</div>' +
      '</div>';
    const logout = host.querySelector('[data-logout]');
    if (logout) {
      logout.addEventListener('click', async function () {
        const ok = await App.confirmDialog({
          title: '退出登录',
          message: '退出后需要重新登录才能继续练习，确定要退出吗？',
          confirmText: '退出登录',
          danger: true,
          icon: 'logout',
        });
        if (ok) {
          App.logoutUser();
          location.href = 'index.html';
        }
      });
    }
  }

  function initNav() {
    const page = currentPage();
    const key = NAV_MAP[page];
    App.qsa('.nav-links a[data-nav]').forEach(function (a) {
      const active = a.getAttribute('data-nav') === key;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const toggle = App.qs('[data-nav-toggle]');
    const links = App.qs('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false');
      });
    }
  }

  function initFooter() {
    const host = App.qs('#siteFooter');
    if (!host) return;
    host.innerHTML =
      '<footer class="site-footer">' +
        '<div class="container footer-inner">' +
          '<div class="footer-grid">' +
            '<div class="footer-brand">' +
              '<a class="brand" href="index.html">' +
                '<span class="brand-mark">云</span>' +
                '<span><span class="brand-name">云枢智学</span><span class="brand-sub" style="display:block">CLOUDPIVOT AI</span></span>' +
              '</a>' +
              '<p class="footer-desc">AI 赋能的智能面试训练平台。从刷题到 AI 模拟面试，把每一次练习，变成拿到 Offer 的底气。</p>' +
            '</div>' +
            '<div class="footer-col"><h5>产品</h5>' +
              '<a href="routes.html">学习路线</a><a href="questions.html">题库</a><a href="ai-config.html">AI 面试</a>' +
            '</div>' +
            '<div class="footer-col"><h5>支持</h5>' +
              '<a href="#" data-placeholder="帮助中心">帮助中心</a><a href="#" data-placeholder="意见反馈">意见反馈</a><a href="#" data-placeholder="联系我们">联系我们</a>' +
            '</div>' +
            '<div class="footer-col"><h5>关于</h5>' +
              '<a href="#" data-placeholder="关于我们">关于我们</a><a href="#" data-placeholder="用户协议">用户协议</a><a href="#" data-placeholder="隐私政策">隐私政策</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer-bottom">' +
            '<span>© <span data-year></span> 云枢智学 · 保留所有权利</span>' +
            '<a class="footer-admin" href="../admin/login.html">' + window.icon('shield', 13) + ' 管理后台</a>' +
          '</div>' +
        '</div>' +
      '</footer>';
    App.qsa('[data-placeholder]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        App.toast(a.getAttribute('data-placeholder') + '页面本期为外链占位，暂未开发', 'info');
      });
    });
    App.qsa('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  function initGuard() {
    if (document.body.getAttribute('data-auth') === 'required') {
      App.requireAuth();
    }
  }

  function init() {
    initGuard();
    renderNavActions();
    initNav();
    initFooter();
    App.applyPlatformBranding();
  }

  window.Portal = { init: init, currentPage: currentPage };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
