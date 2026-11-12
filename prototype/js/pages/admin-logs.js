/* 管理端 · 操作日志 */
(function () {
  'use strict';
  const App = window.App;

  const PAGE_SIZE = 10;
  const TYPE_LABEL = { login: '登录', create: '新增', edit: '修改', delete: '删除', disable: '启禁用', other: '其他' };
  const TYPE_ICON = { login: 'logout', create: 'plus', edit: 'edit', delete: 'trash', disable: 'eyeOff', other: 'log' };
  let page = 1;
  const filters = { keyword: '', type: 'all', from: '', to: '' };

  function db() { return App.getDB(); }

  function filtered() {
    return db().logs.filter(function (l) {
      if (filters.keyword) {
        const hay = (l.user + ' ' + l.action + ' ' + l.target + ' ' + (l.detail || '')).toLowerCase();
        if (hay.indexOf(filters.keyword) === -1) return false;
      }
      if (filters.type !== 'all' && l.type !== filters.type) return false;
      const date = String(l.time || '').slice(0, 10);
      if (filters.from && date < filters.from) return false;
      if (filters.to && date > filters.to) return false;
      return true;
    });
  }

  function renderTable() {
    const all = filtered();
    const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    page = Math.min(page, totalPages);
    const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    App.qs('#logCount').textContent = '共 ' + all.length + ' 条日志';
    const tbody = App.qs('#logTable');
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty"><div class="empty-art">' + window.icon('log', 28) + '</div>' +
        '<div class="empty-title">暂无匹配的日志记录</div><div class="empty-desc">试试调整关键词、操作类型或日期范围。</div></div></td></tr>';
    } else {
      tbody.innerHTML = items.map(function (l) {
        return '<tr data-log="' + l.id + '" tabindex="0" style="cursor:pointer">' +
          '<td><div class="activity-user">' + App.avatarHTML(l.user, App.hashColor(l.user), 'sm') + '<b>' + App.escapeHTML(l.user) + '</b></div></td>' +
          '<td><span class="activity-action">' + window.icon(TYPE_ICON[l.type] || 'log', 13) + App.escapeHTML(l.action) + '</span></td>' +
          '<td><span class="small">' + App.escapeHTML(l.target) + '</span></td>' +
          '<td><span class="small mono" style="color:var(--muted)">' + App.escapeHTML(l.ip) + '</span></td>' +
          '<td><span class="activity-time">' + App.escapeHTML(l.time) + '</span></td>' +
        '</tr>';
      }).join('');
    }
    window.hydrateIcons(tbody);
    App.qsa('[data-log]', tbody).forEach(function (row) {
      row.addEventListener('click', function () { showDetail(row.getAttribute('data-log')); });
      row.addEventListener('keydown', function (e) { if (e.key === 'Enter') showDetail(row.getAttribute('data-log')); });
    });
    renderPagination(all.length, totalPages);
  }

  function renderPagination(total, totalPages) {
    const host = App.qs('#logPagination');
    if (!total) { host.innerHTML = '<span class="page-info">共 0 条日志</span>'; return; }
    let buttons = '<button class="page-btn" data-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>上一页</button>';
    for (let i = 1; i <= totalPages; i++) buttons += '<button class="page-btn' + (i === page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    buttons += '<button class="page-btn" data-page="' + (page + 1) + '"' + (page === totalPages ? ' disabled' : '') + '>下一页</button>';
    host.innerHTML = '<span class="page-info">共 ' + total + ' 条日志 · 第 ' + page + ' / ' + totalPages + ' 页</span><div class="page-btns">' + buttons + '</div>';
    App.qsa('[data-page]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        page = Number(btn.getAttribute('data-page'));
        renderTable();
      });
    });
  }

  function showDetail(id) {
    const log = db().logs.find(l => l.id === id);
    if (!log) return;
    App.openModal({
      title: '操作日志详情',
      desc: log.id,
      body:
        '<div class="log-detail-grid">' +
          '<div class="log-detail-row"><span>操作用户</span><b>' + App.escapeHTML(log.user) + '</b></div>' +
          '<div class="log-detail-row"><span>操作类型</span><b>' + (TYPE_LABEL[log.type] || '其他') + ' · ' + App.escapeHTML(log.action) + '</b></div>' +
          '<div class="log-detail-row"><span>操作对象</span><b>' + App.escapeHTML(log.target) + '</b></div>' +
          '<div class="log-detail-row"><span>IP 地址</span><b>' + App.escapeHTML(log.ip) + '</b></div>' +
          '<div class="log-detail-row"><span>操作时间</span><b>' + App.escapeHTML(log.time) + '</b></div>' +
          '<div class="log-detail-row"><span>日志 ID</span><b>' + App.escapeHTML(log.id) + '</b></div>' +
          '<div class="log-detail-row"><span>操作详情</span><b>' + App.escapeHTML(log.detail || '—') + '</b></div>' +
        '</div>',
      footer: '<button class="btn btn-primary" data-close-modal>关闭</button>',
    });
  }

  function exportCSV() {
    const list = filtered();
    const rows = [['用户', '操作', '目标', 'IP地址', '时间', '详情', '日志ID']];
    list.forEach(function (l) {
      rows.push([l.user, l.action, l.target, l.ip, l.time, l.detail, l.id]);
    });
    function esc(v) { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
    const content = '﻿' + rows.map(r => r.map(esc).join(',')).join('\r\n');
    App.downloadFile('操作日志_' + App.formatDate(new Date()) + '.csv', content, 'text/csv;charset=utf-8');
    App.toast('已导出 ' + list.length + ' 条日志', 'success');
  }

  async function clearLogs() {
    const total = db().logs.length;
    if (!total) { App.toast('当前没有可清空的日志', 'info'); return; }
    const ok = await App.confirmDialog({
      title: '清空操作日志',
      message: '确认清空全部 ' + total + ' 条操作日志吗？此操作不可恢复。',
      hint: '建议先导出日志留存后再清空。',
      confirmText: '清空日志',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    const database = db();
    database.logs = [];
    App.saveDB(database);
    renderTable();
    App.toast('操作日志已清空', 'success');
  }

  function init() {
    if (!App.getAdmin()) return;
    renderTable();

    App.qs('#logSearch').addEventListener('input', App.debounce(function (e) {
      filters.keyword = e.target.value.trim().toLowerCase();
      page = 1;
      renderTable();
    }, 220));
    App.qs('#logTypeFilter').addEventListener('change', function (e) { filters.type = e.target.value; page = 1; renderTable(); });
    App.qs('#logDateFrom').addEventListener('change', function (e) { filters.from = e.target.value; page = 1; renderTable(); });
    App.qs('#logDateTo').addEventListener('change', function (e) { filters.to = e.target.value; page = 1; renderTable(); });
    App.qs('#exportLogsBtn').addEventListener('click', exportCSV);
    App.qs('#clearLogsBtn').addEventListener('click', clearLogs);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
