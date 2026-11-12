/* 云枢智学 · 管理端公共框架 */
(function () {
  'use strict';
  const App = window.App;

  const MENU = [
    {
      label: '概览', items: [
        { key: 'dashboard', label: '数据看板', href: 'index.html', icon: 'grid' },
      ],
    },
    {
      label: '内容管理', items: [
        { key: 'subjects', label: '学科管理', href: 'subjects.html', icon: 'layers' },
        { key: 'courses', label: 'B站课程库', href: 'courses.html', icon: 'video' },
        { key: 'questions', label: '题库管理', href: 'questions.html', icon: 'book' },
        { key: 'interview-questions', label: '面试题库管理', href: 'question-bank.html', icon: 'message' },
        { key: 'roadmaps', label: '学习路线', href: 'routes.html', icon: 'route' },
      ],
    },
    {
      label: '学员管理', items: [
        { key: 'students', label: '学员管理', href: 'students.html', icon: 'users' },
      ],
    },
    {
      label: '系统管理', items: [
        { key: 'users', label: '用户管理', href: 'users.html', icon: 'user' },
        { key: 'roles', label: '角色管理', href: 'roles.html', icon: 'shieldCheck' },
        { key: 'logs', label: '操作日志', href: 'logs.html', icon: 'log' },
        { key: 'settings', label: '系统设置', href: 'settings.html', icon: 'settings' },
      ],
      superOnly: true,
    },
  ];

  function isSuper(admin) {
    return !admin || !admin.role || admin.role === '超级管理员';
  }

  function renderSidebar(admin) {
    const host = App.qs('#adminSidebar');
    if (!host) return;
    const page = document.body.getAttribute('data-admin-page') || 'dashboard';
    const superAdmin = isSuper(admin);
    let nav = '';
    MENU.forEach(function (group) {
      if (group.superOnly && !superAdmin) return;
      nav += '<div class="side-group"><p class="side-group-label">' + group.label + '</p>';
      group.items.forEach(function (item) {
        const active = item.key === page;
        nav += '<a class="side-link' + (active ? ' active' : '') + '" href="' + item.href + '" title="' + item.label + '">' +
          window.icon(item.icon, 17) + '<span>' + item.label + '</span></a>';
      });
      nav += '</div>';
    });
    const settings = App.getDB().settings || {};
    const platformName = settings.platformName || '云枢智学';
    const logo = settings.logo;
    host.innerHTML =
      '<a class="sidebar-brand" href="index.html">' +
        '<span class="brand-mark" style="' + (logo ? 'background:transparent;box-shadow:none' : '') + '">' + (logo ? '<img src="' + logo + '" alt="">' : '云') + '</span>' +
        '<span class="sidebar-brand-text"><b>' + App.escapeHTML(platformName) + '</b><span>ADMIN CONSOLE</span></span>' +
      '</a>' +
      '<nav class="sidebar-nav">' + nav + '</nav>' +
      '<div class="sidebar-foot">' +
        '<a class="side-foot-link" href="../portal/index.html" title="返回学员前台">' + window.icon('external', 16) + '<span>返回学员前台</span></a>' +
        '<div class="side-version">CloudPivot Admin v1.0 · Prototype</div>' +
      '</div>';
  }

  function renderTopbar(admin) {
    const host = App.qs('#adminTopbar');
    if (!host) return;
    const crumb = document.body.getAttribute('data-crumb') || '概览';
    const title = document.body.getAttribute('data-page-title') || '数据看板';
    const name = admin ? admin.name : '陈屿';
    const role = admin ? admin.role : '超级管理员';
    host.innerHTML =
      '<button class="topbar-toggle" id="sidebarToggle" aria-label="折叠菜单">' + window.icon('menu', 18) + '</button>' +
      '<div class="topbar-heading"><span class="topbar-crumb">' + App.escapeHTML(crumb) + '</span><h1 class="topbar-title">' + App.escapeHTML(title) + '</h1></div>' +
      '<div class="topbar-actions">' +
        '<div class="dropdown">' +
          '<button class="topbar-icon" data-dropdown-toggle aria-label="通知，3 条未读">' + window.icon('bell', 17) + '<span class="notif-dot"></span></button>' +
          '<div class="dropdown-menu notif-menu" role="menu">' +
            '<div class="dropdown-label">通知 · 3 条未读</div>' +
            '<div class="notif-item"><span class="notif-ic">' + window.icon('book', 15) + '</span><div><b>3 道题目待审核</b><span>来自 AI 应用开发知识库的新录题目已提交审核</span><time>10 分钟前</time></div></div>' +
            '<div class="notif-item"><span class="notif-ic">' + window.icon('users', 15) + '</span><div><b>新增学员注册</b><span>今日新增 18 位注册学员，较昨日提升 12%</span><time>1 小时前</time></div></div>' +
            '<div class="notif-item"><span class="notif-ic">' + window.icon('alertCircle', 15) + '</span><div><b>课程链接失效提醒</b><span>1 门 B 站课程链接无法访问，请及时更新</span><time>3 小时前</time></div></div>' +
            '<div class="notif-foot"><a class="dropdown-item" href="logs.html">' + window.icon('log', 15) + '查看全部操作日志</a></div>' +
          '</div>' +
        '</div>' +
        '<div class="dropdown">' +
          '<button class="admin-user-btn" data-dropdown-toggle>' +
            App.avatarHTML(name, '#6366F1') +
            '<span class="admin-user-meta"><b>' + App.escapeHTML(name) + '</b><span>' + App.escapeHTML(role) + '</span></span>' +
            window.icon('chevronDown', 13) +
          '</button>' +
          '<div class="dropdown-menu" role="menu">' +
            '<a class="dropdown-item" href="../portal/index.html">' + window.icon('external', 15) + '返回学员前台</a>' +
            '<div class="dropdown-sep"></div>' +
            '<button class="dropdown-item danger" data-admin-logout>' + window.icon('logout', 15) + '退出登录</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    const toggle = host.querySelector('#sidebarToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        if (window.innerWidth <= 900) {
          document.body.classList.toggle('sidebar-mobile-open');
        } else {
          document.body.classList.toggle('sidebar-collapsed');
          App.storage.set('cp_sidebar_collapsed', document.body.classList.contains('sidebar-collapsed'));
        }
      });
    }
    const logout = host.querySelector('[data-admin-logout]');
    if (logout) {
      logout.addEventListener('click', async function () {
        const ok = await App.confirmDialog({
          title: '退出管理后台',
          message: '退出后需要重新登录才能访问管理后台，确定要退出吗？',
          confirmText: '退出登录',
          danger: true,
          icon: 'logout',
        });
        if (ok) {
          App.logoutAdmin();
          location.href = 'login.html';
        }
      });
    }
  }

  function init() {
    const admin = App.requireAdmin();
    if (!admin) return;
    if (App.storage.get('cp_sidebar_collapsed', false)) document.body.classList.add('sidebar-collapsed');
    renderSidebar(admin);
    renderTopbar(admin);
    const settings = App.getDB().settings || {};
    if (settings.platformName) document.title = document.title.replace('云枢智学', settings.platformName);
    // 关闭移动端侧边栏：点击内容区
    App.qs('#adminContent')?.addEventListener('click', function () {
      if (document.body.classList.contains('sidebar-mobile-open')) document.body.classList.remove('sidebar-mobile-open');
    });
  }

  window.Admin = { init: init, MENU: MENU };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
