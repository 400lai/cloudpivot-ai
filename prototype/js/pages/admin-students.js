/* 管理端 · 学员管理 */
(function () {
  'use strict';
  const App = window.App;

  const PAGE_SIZE = 8;
  let page = 1;
  const selected = new Set();
  const filters = { keyword: '', status: 'all' };

  function db() { return App.getDB(); }

  function filtered() {
    return db().students.filter(function (s) {
      if (filters.keyword) {
        const hay = (s.name + ' ' + s.phone).toLowerCase();
        if (hay.indexOf(filters.keyword) === -1) return false;
      }
      if (filters.status !== 'all' && s.status !== filters.status) return false;
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
    App.qs('#studentCount').textContent = '共 ' + all.length + ' 位学员';
    const tbody = App.qs('#studentTable');
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty"><div class="empty-art">' + window.icon('users', 28) + '</div>' +
        '<div class="empty-title">没有找到匹配的学员</div><div class="empty-desc">试试调整搜索关键词或状态筛选。</div></div></td></tr>';
    } else {
      tbody.innerHTML = items.map(function (s) {
        return '<tr>' +
          '<td class="col-check"><label class="checkbox checkbox-cell"><input type="checkbox" data-check="' + s.id + '"' + (selected.has(s.id) ? ' checked' : '') + '><span class="box"></span></label></td>' +
          '<td><div class="activity-user">' + App.avatarHTML(s.name, s.avatarColor, 'sm') + '<div><b style="font-size:12px">' + App.escapeHTML(s.name) + '</b><div class="small muted">' + s.id + '</div></div></div></td>' +
          '<td><span class="small mono">' + App.escapeHTML(s.phone) + '</span></td>' +
          '<td><span class="small muted">' + s.joined + '</span></td>' +
          '<td><span class="small">' + s.studyDays + ' 天</span></td>' +
          '<td><span class="small">' + s.practiceCount + ' 题 · ' + s.interviewCount + ' 面</span></td>' +
          '<td>' + statusBadge(s.status) + '</td>' +
          '<td><div class="row-actions">' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-student-view="' + s.id + '" title="查看详情">' + window.icon('eye', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-student-toggle="' + s.id + '" title="' + (s.status === 'active' ? '禁用' : '启用') + '">' + window.icon(s.status === 'active' ? 'eyeOff' : 'eye', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-student-del="' + s.id + '" title="删除" style="color:var(--red-strong)">' + window.icon('trash', 14) + '</button>' +
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
    App.qsa('[data-student-view]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () { showDetail(btn.getAttribute('data-student-view')); });
    });
    App.qsa('[data-student-toggle]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () { toggleStudent(btn.getAttribute('data-student-toggle')); });
    });
    App.qsa('[data-student-del]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () { deleteStudent(btn.getAttribute('data-student-del')); });
    });
  }

  function updateMasterCheckbox(items) {
    const master = App.qs('#selectPageStudents');
    if (!master) return;
    const list = items || filtered().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    if (!list.length) { master.checked = false; master.indeterminate = false; return; }
    const checked = list.filter(s => selected.has(s.id)).length;
    master.checked = checked === list.length;
    master.indeterminate = checked > 0 && checked < list.length;
  }

  function updateBatchBar() {
    App.qs('#studentBatchCount').textContent = selected.size;
    App.qs('#studentBatchBar').classList.toggle('show', selected.size > 0);
  }

  function renderPagination(total, totalPages) {
    const host = App.qs('#studentPagination');
    if (!total) { host.innerHTML = '<span class="page-info">共 0 位学员</span>'; return; }
    let buttons = '<button class="page-btn" data-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>上一页</button>';
    for (let i = 1; i <= totalPages; i++) buttons += '<button class="page-btn' + (i === page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    buttons += '<button class="page-btn" data-page="' + (page + 1) + '"' + (page === totalPages ? ' disabled' : '') + '>下一页</button>';
    host.innerHTML = '<span class="page-info">共 ' + total + ' 位学员 · 第 ' + page + ' / ' + totalPages + ' 页</span><div class="page-btns">' + buttons + '</div>';
    App.qsa('[data-page]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        page = Number(btn.getAttribute('data-page'));
        renderTable();
      });
    });
  }

  function showDetail(id) {
    const s = db().students.find(x => x.id === id);
    if (!s) return;
    const body =
      '<div class="detail-profile">' + App.avatarHTML(s.name, s.avatarColor, 'lg') +
        '<div><h3>' + App.escapeHTML(s.name) + '</h3><p>' + statusBadge(s.status) + '</p></div></div>' +
      '<div class="detail-kv">' +
        '<div class="detail-kv-item"><span>手机号</span><b>' + App.escapeHTML(s.phone) + '</b></div>' +
        '<div class="detail-kv-item"><span>邮箱</span><b>' + App.escapeHTML(s.email || '未填写') + '</b></div>' +
        '<div class="detail-kv-item"><span>注册时间</span><b>' + s.joined + '</b></div>' +
        '<div class="detail-kv-item"><span>最后登录</span><b>' + App.escapeHTML(s.lastLogin || '—') + '</b></div>' +
      '</div>' +
      '<div class="detail-section-title">学习统计</div>' +
      '<div class="detail-stat-grid">' +
        '<div class="detail-stat"><b>' + s.studyDays + '</b><span>学习天数</span></div>' +
        '<div class="detail-stat"><b>' + s.courseCount + '</b><span>已学课程</span></div>' +
        '<div class="detail-stat"><b>' + s.practiceCount + '</b><span>刷题总数</span></div>' +
        '<div class="detail-stat"><b>' + s.accuracy + '%</b><span>正确率</span></div>' +
      '</div>' +
      '<div class="detail-section-title">面试记录</div>' +
      '<div class="analysis-answer"><b>累计 AI 面试</b><span>' + s.interviewCount + ' 次</span></div>' +
      '<p class="small muted" style="margin-top:8px">学员的详细面试报告请前往面试记录页查看（原型演示数据）。</p>' +
      '<div class="row gap-8" style="margin-top:22px">' +
        '<button class="btn ' + (s.status === 'active' ? 'btn-danger-soft' : 'btn-success-soft') + ' btn-sm" data-detail-toggle>' + (s.status === 'active' ? '禁用账号' : '启用账号') + '</button>' +
        '<button class="btn btn-danger-soft btn-sm" data-detail-del>删除学员</button>' +
        '<button class="btn btn-ghost btn-sm" data-close-drawer style="margin-left:auto">关闭</button>' +
      '</div>';
    App.openDrawer({
      title: '学员详情',
      desc: s.id,
      body: body,
      onMount: function (layer, close) {
        layer.querySelector('[data-close-drawer]').addEventListener('click', close);
        layer.querySelector('[data-detail-toggle]').addEventListener('click', function () { close(); toggleStudent(s.id); });
        layer.querySelector('[data-detail-del]').addEventListener('click', function () { close(); deleteStudent(s.id); });
      },
    });
  }

  async function toggleStudent(id) {
    const database = db();
    const s = database.students.find(x => x.id === id);
    if (!s) return;
    const target = s.status === 'active' ? 'disabled' : 'active';
    const ok = await App.confirmDialog({
      title: target === 'active' ? '启用学员' : '禁用学员',
      message: target === 'active'
        ? '确认启用学员「' + s.name + '」的账号吗？'
        : '禁用后，学员「' + s.name + '」将无法登录学员端。确认禁用吗？',
      confirmText: target === 'active' ? '启用账号' : '禁用账号',
      danger: target === 'disabled',
      icon: 'alert',
    });
    if (!ok) return;
    s.status = target;
    App.saveDB(database);
    App.addLog(target === 'active' ? '启用学员' : '禁用学员', '学员「' + s.name + '」', 'disable');
    renderTable();
    App.toast('学员已' + (target === 'active' ? '启用' : '禁用'), 'success');
  }

  async function deleteStudent(id) {
    const database = db();
    const s = database.students.find(x => x.id === id);
    if (!s) return;
    const ok = await App.confirmDialog({
      title: '删除学员',
      message: '确认删除学员「' + s.name + '」吗？其学习数据将不再展示。',
      hint: '删除为逻辑删除，数据仍保留在系统中可恢复。',
      confirmText: '删除学员',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    database.students = database.students.filter(x => x.id !== id);
    App.saveDB(database);
    selected.delete(id);
    App.addLog('删除学员', '学员「' + s.name + '」', 'delete');
    renderTable();
    App.toast('学员已删除', 'success');
  }

  async function batchAction(action) {
    const ids = Array.from(selected);
    if (!ids.length) { App.toast('请先选择学员', 'warning'); return; }
    const labels = { active: '批量启用', disabled: '批量禁用', delete: '批量删除' };
    const ok = await App.confirmDialog({
      title: labels[action],
      message: action === 'delete'
        ? '确认删除选中的 ' + ids.length + ' 位学员吗？其学习数据将不再展示。'
        : '确认' + (action === 'active' ? '启用' : '禁用') + '选中的 ' + ids.length + ' 位学员吗？',
      hint: action === 'delete' ? '删除为逻辑删除，数据仍保留在系统中可恢复。' : '',
      confirmText: labels[action],
      danger: action === 'delete' || action === 'disabled',
      icon: action === 'delete' ? 'trash' : 'alert',
    });
    if (!ok) return;
    const database = db();
    if (action === 'delete') {
      database.students = database.students.filter(s => ids.indexOf(s.id) === -1);
    } else {
      database.students.forEach(function (s) { if (ids.indexOf(s.id) > -1) s.status = action; });
    }
    App.saveDB(database);
    App.addLog(labels[action], '学员管理', action === 'delete' ? 'delete' : 'disable', labels[action] + ' ' + ids.length + ' 位学员');
    selected.clear();
    renderTable();
    App.toast(labels[action] + '完成', 'success');
  }

  function init() {
    if (!App.getAdmin()) return;
    renderTable();

    App.qs('#studentSearch').addEventListener('input', App.debounce(function (e) {
      filters.keyword = e.target.value.trim().toLowerCase();
      page = 1;
      renderTable();
    }, 220));
    App.qs('#studentStatusFilter').addEventListener('change', function (e) {
      filters.status = e.target.value;
      page = 1;
      renderTable();
    });
    App.qs('#selectPageStudents').addEventListener('change', function (e) {
      const items = filtered().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      items.forEach(function (s) { if (e.target.checked) selected.add(s.id); else selected.delete(s.id); });
      renderTable();
    });
    App.qs('#clearStudentSelection').addEventListener('click', function () {
      selected.clear();
      renderTable();
    });
    App.qsa('[data-student-batch]').forEach(function (btn) {
      btn.addEventListener('click', function () { batchAction(btn.getAttribute('data-student-batch')); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
