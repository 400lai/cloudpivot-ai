/* 管理端 · 用户管理 */
(function () {
  'use strict';
  const App = window.App;

  const PAGE_SIZE = 8;
  const ROLE_LABEL = { super_admin: '超级管理员', content_reviewer: '内容审核', operator: '运营人员' };
  const ROLE_BADGE = { super_admin: 'badge-purple', content_reviewer: 'badge-blue', operator: 'badge-green' };
  let page = 1;
  const selected = new Set();
  const filters = { keyword: '', role: 'all', status: 'all' };

  function db() { return App.getDB(); }

  function filtered() {
    return db().users.filter(function (u) {
      if (filters.keyword) {
        const hay = (u.name + ' ' + u.account + ' ' + u.phone).toLowerCase();
        if (hay.indexOf(filters.keyword) === -1) return false;
      }
      if (filters.role !== 'all' && u.roleCode !== filters.role) return false;
      if (filters.status !== 'all' && u.status !== filters.status) return false;
      return true;
    });
  }

  function statusBadge(status) {
    return '<span class="status-dot ' + (status === 'active' ? 'active' : 'disabled') + '">' + (status === 'active' ? '已启用' : '已禁用') + '</span>';
  }

  function renderTable() {
    const all = filtered();
    const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    page = Math.min(page, totalPages);
    const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    App.qs('#userCount').textContent = '共 ' + all.length + ' 个用户';
    const tbody = App.qs('#userTable');
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty"><div class="empty-art">' + window.icon('user', 28) + '</div>' +
        '<div class="empty-title">没有找到匹配的用户</div><div class="empty-desc">试试调整搜索关键词、角色或状态筛选。</div></div></td></tr>';
    } else {
      tbody.innerHTML = items.map(function (u) {
        return '<tr>' +
          '<td class="col-check"><label class="checkbox checkbox-cell"><input type="checkbox" data-check="' + u.id + '"' + (selected.has(u.id) ? ' checked' : '') + '><span class="box"></span></label></td>' +
          '<td><button class="btn-link activity-user" data-user-view="' + u.id + '" style="border:0;background:none">' + App.avatarHTML(u.name, App.hashColor(u.name), 'sm') +
            '<span style="text-align:left"><b style="display:block;font-size:12px">' + App.escapeHTML(u.name) + (u.builtin ? ' <span class="badge badge-outline" style="height:18px;font-size:9px">内置</span>' : '') + '</b>' +
            '<span class="small muted">@' + App.escapeHTML(u.account) + '</span></span></button></td>' +
          '<td><span class="small mono">' + App.escapeHTML(u.phone) + '</span></td>' +
          '<td><span class="badge ' + (ROLE_BADGE[u.roleCode] || 'badge') + '">' + (ROLE_LABEL[u.roleCode] || u.role) + '</span></td>' +
          '<td>' + statusBadge(u.status) + '</td>' +
          '<td><span class="small muted">' + App.escapeHTML(u.lastLogin || '—') + '</span></td>' +
          '<td><div class="row-actions">' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-user-view="' + u.id + '" title="查看详情">' + window.icon('eye', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-user-edit="' + u.id + '" title="编辑">' + window.icon('edit', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-user-toggle="' + u.id + '" title="' + (u.status === 'active' ? '禁用' : '启用') + '" ' + (u.builtin ? 'data-protected="1"' : '') + '>' + window.icon(u.status === 'active' ? 'eyeOff' : 'eye', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-user-reset="' + u.id + '" title="重置密码">' + window.icon('key', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-user-del="' + u.id + '" title="删除" style="color:var(--red-strong)" ' + (u.builtin ? 'data-protected="1"' : '') + '>' + window.icon('trash', 14) + '</button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }
    window.hydrateIcons(tbody);
    bindRows(tbody);
    renderPagination(all.length, totalPages);
    updateBatchBar();
    updateMasterCheckbox(items);
  }

  function bindRows(tbody) {
    App.qsa('[data-check]', tbody).forEach(function (cb) {
      cb.addEventListener('change', function () {
        if (cb.checked) selected.add(cb.getAttribute('data-check'));
        else selected.delete(cb.getAttribute('data-check'));
        updateBatchBar();
        updateMasterCheckbox();
      });
    });
    App.qsa('[data-user-view]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () { showDetail(btn.getAttribute('data-user-view')); });
    });
    App.qsa('[data-user-edit]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const user = db().users.find(u => u.id === btn.getAttribute('data-user-edit'));
        if (user) openUserModal(user);
      });
    });
    App.qsa('[data-user-toggle]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('data-protected')) { App.toast('内置超级管理员不可禁用', 'warning'); return; }
        toggleUser(btn.getAttribute('data-user-toggle'));
      });
    });
    App.qsa('[data-user-reset]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () { resetPassword(btn.getAttribute('data-user-reset')); });
    });
    App.qsa('[data-user-del]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('data-protected')) { App.toast('内置超级管理员不可删除', 'warning'); return; }
        deleteUser(btn.getAttribute('data-user-del'));
      });
    });
  }

  function updateMasterCheckbox(items) {
    const master = App.qs('#selectPageUsers');
    if (!master) return;
    const list = items || filtered().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    if (!list.length) { master.checked = false; master.indeterminate = false; return; }
    const checked = list.filter(u => selected.has(u.id)).length;
    master.checked = checked === list.length;
    master.indeterminate = checked > 0 && checked < list.length;
  }

  function updateBatchBar() {
    App.qs('#userBatchCount').textContent = selected.size;
    App.qs('#userBatchBar').classList.toggle('show', selected.size > 0);
  }

  function renderPagination(total, totalPages) {
    const host = App.qs('#userPagination');
    if (!total) { host.innerHTML = '<span class="page-info">共 0 个用户</span>'; return; }
    let buttons = '<button class="page-btn" data-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>上一页</button>';
    for (let i = 1; i <= totalPages; i++) buttons += '<button class="page-btn' + (i === page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    buttons += '<button class="page-btn" data-page="' + (page + 1) + '"' + (page === totalPages ? ' disabled' : '') + '>下一页</button>';
    host.innerHTML = '<span class="page-info">共 ' + total + ' 个用户 · 第 ' + page + ' / ' + totalPages + ' 页</span><div class="page-btns">' + buttons + '</div>';
    App.qsa('[data-page]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        page = Number(btn.getAttribute('data-page'));
        renderTable();
      });
    });
  }

  function showDetail(id) {
    const u = db().users.find(x => x.id === id);
    if (!u) return;
    const logs = db().logs.filter(l => l.user === u.name).slice(0, 5);
    const body =
      '<div class="detail-profile">' + App.avatarHTML(u.name, App.hashColor(u.name), 'lg') +
        '<div><h3>' + App.escapeHTML(u.name) + (u.builtin ? ' <span class="badge badge-outline" style="height:19px;font-size:9.5px">内置</span>' : '') + '</h3>' +
        '<p>' + statusBadge(u.status) + ' <span class="badge ' + (ROLE_BADGE[u.roleCode] || 'badge') + '" style="margin-left:5px">' + (ROLE_LABEL[u.roleCode] || u.role) + '</span></p></div></div>' +
      '<div class="detail-kv">' +
        '<div class="detail-kv-item"><span>手机号</span><b>' + App.escapeHTML(u.phone) + '</b></div>' +
        '<div class="detail-kv-item"><span>邮箱</span><b>' + App.escapeHTML(u.email || '未填写') + '</b></div>' +
        '<div class="detail-kv-item"><span>创建时间</span><b>' + App.escapeHTML(u.createdAt || '—') + '</b></div>' +
        '<div class="detail-kv-item"><span>最后登录</span><b>' + App.escapeHTML(u.lastLogin || '—') + '</b></div>' +
      '</div>' +
      '<div class="detail-section-title">最近操作</div>' +
      (logs.length ? '<div class="detail-timeline">' + logs.map(function (l) {
        return '<div class="timeline-item"><b>' + App.escapeHTML(l.action) + ' · ' + App.escapeHTML(l.target) + '</b><span>' + App.escapeHTML(l.detail) + '</span><time>' + App.escapeHTML(l.time) + '</time></div>';
      }).join('') + '</div>' : '<div class="small muted" style="padding:10px 0">暂无操作记录</div>') +
      '<div class="row gap-8" style="margin-top:20px"><button class="btn btn-outline btn-sm" data-detail-edit>编辑用户</button>' +
      '<button class="btn btn-ghost btn-sm" data-close-drawer style="margin-left:auto">关闭</button></div>';
    App.openDrawer({
      title: '用户详情',
      desc: u.id,
      body: body,
      onMount: function (layer, close) {
        layer.querySelector('[data-close-drawer]').addEventListener('click', close);
        layer.querySelector('[data-detail-edit]').addEventListener('click', function () { close(); openUserModal(u); });
      },
    });
  }

  function openUserModal(user) {
    const isEdit = !!user;
    const builtin = !!(user && user.builtin);
    const roleCode = user ? user.roleCode : 'operator';
    const body =
      '<div class="form-grid">' +
        '<div class="field"><label class="field-label">用户名 <span class="required">*</span></label><input class="input" id="userName" value="' + App.escapeHTML(user ? user.name : '') + '" placeholder="请输入用户名"><p class="field-error">请输入用户名</p></div>' +
        '<div class="field"><label class="field-label">手机号 <span class="required">*</span></label><input class="input" id="userPhone" value="' + App.escapeHTML(user ? user.phone : '') + '" placeholder="请输入手机号"><p class="field-error">请输入手机号</p></div>' +
        '<div class="field"><label class="field-label">邮箱</label><input class="input" id="userEmail" type="email" value="' + App.escapeHTML(user ? (user.email || '') : '') + '" placeholder="选填"><p class="field-error">请输入正确的邮箱地址</p></div>' +
        '<div class="field"><label class="field-label">角色 <span class="required">*</span></label>' +
          '<select class="select" id="userRole"' + (builtin ? ' disabled' : '') + '>' +
            (builtin ? '<option value="super_admin" selected>超级管理员</option>' :
              '<option value="content_reviewer"' + (roleCode === 'content_reviewer' ? ' selected' : '') + '>内容审核</option>' +
              '<option value="operator"' + (roleCode === 'operator' ? ' selected' : '') + '>运营人员</option>') +
          '</select>' +
          (builtin ? '<p class="field-hint">内置超级管理员角色不可修改</p>' : '<p class="field-hint">不可创建或切换为超级管理员</p>') +
        '</div>' +
        '<div class="field span-2"><label class="field-label">' + (isEdit ? '新密码' : '密码') + (isEdit ? '' : ' <span class="required">*</span>') + '</label>' +
          '<input class="input" id="userPassword" type="password" placeholder="' + (isEdit ? '留空则不修改密码' : '至少 6 位') + '"><p class="field-error">密码至少 6 位</p></div>' +
        '<div class="field span-2"><label class="switch"><input type="checkbox" id="userStatusSwitch"' + (!user || user.status === 'active' ? ' checked' : '') + '><span class="track"></span>账号状态：启用</label></div>' +
      '</div>' +
      (builtin ? '<div class="callout warn" style="margin-top:16px">' + window.icon('alertCircle', 16) + '<span>超级管理员为系统内置唯一账号，角色不可修改，且不可禁用或删除。</span></div>' : '');
    App.openModal({
      title: isEdit ? '编辑用户' : '新增用户',
      desc: isEdit ? '修改后台账号信息与状态' : '创建后台内部账号',
      size: 'wide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" data-save-user>' + (isEdit ? '保存修改' : '创建用户') + '</button>',
      onMount: function (layer, close) {
        layer.querySelector('[data-save-user]').addEventListener('click', function () {
          const name = layer.querySelector('#userName');
          const phone = layer.querySelector('#userPhone');
          const email = layer.querySelector('#userEmail');
          const password = layer.querySelector('#userPassword');
          const okName = App.validateField(name, name.value.trim().length > 0, '请输入用户名');
          const okPhone = App.validateField(phone, phone.value.trim().length > 0, '请输入手机号');
          const emailVal = email.value.trim();
          const okEmail = App.validateField(email, !emailVal || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal), '请输入正确的邮箱地址');
          const pwdVal = password.value;
          const okPwd = App.validateField(password, isEdit ? (!pwdVal || pwdVal.length >= 6) : (pwdVal.length >= 6), '密码至少 6 位');
          if (!okName || !okPhone || !okEmail || !okPwd) return;
          const database = db();
          const roleSelect = layer.querySelector('#userRole');
          const role = builtin ? 'super_admin' : roleSelect.value;
          const status = builtin ? 'active' : (layer.querySelector('#userStatusSwitch').checked ? 'active' : 'disabled');
          if (isEdit) {
            const item = database.users.find(u => u.id === user.id);
            item.name = name.value.trim();
            item.phone = phone.value.trim();
            item.email = emailVal;
            item.roleCode = role;
            item.role = ROLE_LABEL[role];
            item.status = status;
            App.toast('用户信息已更新', 'success');
          } else {
            database.users.push({
              id: 'au-' + Date.now(),
              name: name.value.trim(),
              account: name.value.trim().toLowerCase().replace(/\s+/g, '_'),
              phone: phone.value.trim(),
              email: emailVal,
              role: ROLE_LABEL[role],
              roleCode: role,
              status: status,
              builtin: false,
              lastLogin: '—',
              createdAt: App.formatDate(new Date()),
            });
            App.toast('用户已创建', 'success');
          }
          App.saveDB(database);
          App.addLog(isEdit ? '编辑用户' : '新增用户', '用户「' + name.value.trim() + '」', isEdit ? 'edit' : 'create');
          close();
          renderTable();
        });
      },
    });
  }

  async function toggleUser(id) {
    const database = db();
    const u = database.users.find(x => x.id === id);
    if (!u) return;
    if (u.builtin) { App.toast('内置超级管理员不可禁用', 'warning'); return; }
    const target = u.status === 'active' ? 'disabled' : 'active';
    const ok = await App.confirmDialog({
      title: target === 'active' ? '启用用户' : '禁用用户',
      message: target === 'active' ? '确认启用用户「' + u.name + '」吗？' : '禁用后用户「' + u.name + '」将无法登录管理后台。确认禁用吗？',
      confirmText: target === 'active' ? '启用账号' : '禁用账号',
      danger: target === 'disabled',
      icon: 'alert',
    });
    if (!ok) return;
    u.status = target;
    App.saveDB(database);
    App.addLog(target === 'active' ? '启用用户' : '禁用用户', '用户「' + u.name + '」', 'disable');
    renderTable();
    App.toast('用户已' + (target === 'active' ? '启用' : '禁用'), 'success');
  }

  async function resetPassword(id) {
    const u = db().users.find(x => x.id === id);
    if (!u) return;
    const ok = await App.confirmDialog({
      title: '重置密码',
      message: '确认将用户「' + u.name + '」的密码重置为系统默认密码吗？',
      hint: '重置后请通知用户尽快修改密码。',
      confirmText: '重置密码',
      icon: 'key',
    });
    if (!ok) return;
    App.addLog('重置密码', '用户「' + u.name + '」', 'edit', '将用户密码重置为系统默认密码');
    App.toast('密码已重置为默认密码（原型演示）', 'success');
  }

  async function deleteUser(id) {
    const database = db();
    const u = database.users.find(x => x.id === id);
    if (!u) return;
    if (u.builtin) { App.toast('内置超级管理员不可删除', 'warning'); return; }
    const ok = await App.confirmDialog({
      title: '删除用户',
      message: '确认删除用户「' + u.name + '」吗？删除后该账号将无法登录管理后台。',
      hint: '删除为逻辑删除，数据仍保留在系统中可恢复。',
      confirmText: '删除用户',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    database.users = database.users.filter(x => x.id !== id);
    App.saveDB(database);
    selected.delete(id);
    App.addLog('删除用户', '用户「' + u.name + '」', 'delete');
    renderTable();
    App.toast('用户已删除', 'success');
  }

  async function batchAction(action) {
    let ids = Array.from(selected);
    if (!ids.length) { App.toast('请先选择用户', 'warning'); return; }
    const database = db();
    const protectedCount = ids.filter(id => { const u = database.users.find(x => x.id === id); return u && u.builtin; }).length;
    ids = ids.filter(id => { const u = database.users.find(x => x.id === id); return u && !u.builtin; });
    if (!ids.length) { App.toast('选中的用户均为内置超级管理员，无法操作', 'warning'); return; }
    const labels = { active: '批量启用', disabled: '批量禁用', delete: '批量删除' };
    const ok = await App.confirmDialog({
      title: labels[action],
      message: '确认' + (action === 'delete' ? '删除' : action === 'active' ? '启用' : '禁用') + '选中的 ' + ids.length + ' 个用户吗？' +
        (protectedCount ? '（已自动跳过 ' + protectedCount + ' 个内置账号）' : ''),
      confirmText: labels[action],
      danger: action === 'delete' || action === 'disabled',
      icon: action === 'delete' ? 'trash' : 'alert',
    });
    if (!ok) return;
    if (action === 'delete') {
      database.users = database.users.filter(u => ids.indexOf(u.id) === -1);
    } else {
      database.users.forEach(function (u) { if (ids.indexOf(u.id) > -1) u.status = action; });
    }
    App.saveDB(database);
    App.addLog(labels[action], '用户管理', action === 'delete' ? 'delete' : 'disable', labels[action] + ' ' + ids.length + ' 个用户');
    selected.clear();
    renderTable();
    App.toast(labels[action] + '完成', 'success');
  }

  function init() {
    if (!App.getAdmin()) return;
    renderTable();

    App.qs('#userSearch').addEventListener('input', App.debounce(function (e) {
      filters.keyword = e.target.value.trim().toLowerCase();
      page = 1;
      renderTable();
    }, 220));
    App.qs('#userRoleFilter').addEventListener('change', function (e) { filters.role = e.target.value; page = 1; renderTable(); });
    App.qs('#userStatusFilter').addEventListener('change', function (e) { filters.status = e.target.value; page = 1; renderTable(); });
    App.qs('#selectPageUsers').addEventListener('change', function (e) {
      const items = filtered().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      items.forEach(function (u) { if (e.target.checked) selected.add(u.id); else selected.delete(u.id); });
      renderTable();
    });
    App.qs('#clearUserSelection').addEventListener('click', function () { selected.clear(); renderTable(); });
    App.qsa('[data-user-batch]').forEach(function (btn) {
      btn.addEventListener('click', function () { batchAction(btn.getAttribute('data-user-batch')); });
    });
    App.qs('#addUserBtn').addEventListener('click', function () { openUserModal(null); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
