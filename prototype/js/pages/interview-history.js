/* 面试记录 */
(function () {
  'use strict';
  const App = window.App;

  const PAGE_SIZE = 5;
  const DIFF_LABEL = { easy: '简单', medium: '中等', hard: '困难' };
  let records = [];
  let page = 1;

  function parseTime(str) {
    const d = new Date(String(str || '').replace(' ', 'T'));
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }

  function scoreClass(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'mid';
    return 'low';
  }

  function renderStats() {
    const total = records.length;
    const avg = total ? records.reduce((n, r) => n + (Number(r.score) || 0), 0) / total : 0;
    const best = total ? Math.max.apply(null, records.map(r => Number(r.score) || 0)) : 0;
    const totalSec = records.reduce((n, r) => n + (Number(r.duration) || 0), 0);
    App.qs('#historyStats').innerHTML =
      '<div class="stat-card"><div class="stat-top"><span class="stat-label">面试总次数</span><span class="icon-tile brand">' + window.icon('mic', 18) + '</span></div><div class="stat-value">' + total + '<span class="unit">次</span></div><div class="stat-foot">每一次面试都是一次复盘</div></div>' +
      '<div class="stat-card"><div class="stat-top"><span class="stat-label">平均分数</span><span class="icon-tile blue">' + window.icon('chart', 18) + '</span></div><div class="stat-value">' + (total ? avg.toFixed(1) : '—') + '<span class="unit">分</span></div><div class="stat-foot">稳定发挥比单次高分更重要</div></div>' +
      '<div class="stat-card"><div class="stat-top"><span class="stat-label">最高分数</span><span class="icon-tile green">' + window.icon('award', 18) + '</span></div><div class="stat-value">' + (total ? best : '—') + '<span class="unit">分</span></div><div class="stat-foot">继续保持你的优势维度</div></div>' +
      '<div class="stat-card"><div class="stat-top"><span class="stat-label">累计时长</span><span class="icon-tile purple">' + window.icon('clock', 18) + '</span></div><div class="stat-value" style="font-size:24px">' + (total ? App.formatMinutes(Math.round(totalSec / 60)) : '—') + '</div><div class="stat-foot">把时间花在真实表达上</div></div>';
    window.hydrateIcons(App.qs('#historyStats'));
  }

  function renderList() {
    const host = App.qs('#historyList');
    const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
    page = Math.min(page, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    const items = records.slice(start, start + PAGE_SIZE);
    if (!records.length) {
      host.innerHTML = '<div class="card"><div class="empty"><div class="empty-art">' + window.icon('mic', 30) + '</div>' +
        '<div class="empty-title">还没有面试记录</div><div class="empty-desc">完成一次 AI 模拟面试后，报告与得分会保存在这里。</div>' +
        '<a class="btn btn-primary" href="ai-config.html">开始第一次面试</a></div></div>';
      renderPagination(0, 0);
      return;
    }
    host.innerHTML = items.map(function (r) {
      const score = Number(r.score) || 0;
      const cls = scoreClass(score);
      return '<div class="history-row">' +
        '<div class="history-score ' + cls + '" style="--p:' + score + '"><b>' + score + '</b></div>' +
        '<div class="history-main">' +
          '<h3>' + App.escapeHTML(r.directionName) + '</h3>' +
          '<div class="history-meta">' +
            '<span>' + App.escapeHTML(r.date) + '</span><span class="dot-sep"></span>' +
            '<span>' + App.formatMinutes(Math.max(1, Math.round((r.duration || 0) / 60))) + '</span><span class="dot-sep"></span>' +
            '<span>' + r.count + ' 题</span><span class="dot-sep"></span>' +
            '<span class="badge badge-outline" style="height:19px;font-size:10px">' + (DIFF_LABEL[r.difficulty] || '中等') + '难度</span>' +
          '</div>' +
        '</div>' +
        '<div class="history-actions">' +
          '<a class="btn btn-sm btn-outline" href="interview-report.html?id=' + encodeURIComponent(r.id) + '">' + window.icon('file', 13) + ' 查看报告</a>' +
          '<button class="btn btn-sm btn-soft" data-retry="' + r.id + '">' + window.icon('refresh', 13) + ' 再来一次</button>' +
        '</div>' +
      '</div>';
    }).join('');
    App.qsa('[data-retry]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const r = records.find(x => x.id === btn.getAttribute('data-retry'));
        if (!r) return;
        App.setInterviewConfig({
          direction: r.direction,
          directionName: r.directionName,
          difficulty: r.difficulty || 'medium',
          count: Number(r.count) || 10,
          timeout: 300,
          createdAt: new Date().toISOString(),
        });
        location.href = 'ai-config.html';
      });
    });
    renderPagination(records.length, totalPages);
  }

  function renderPagination(total, totalPages) {
    const host = App.qs('#historyPagination');
    if (!total) { host.innerHTML = ''; return; }
    let buttons = '<button class="page-btn" data-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>上一页</button>';
    for (let i = 1; i <= totalPages; i++) {
      buttons += '<button class="page-btn' + (i === page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    buttons += '<button class="page-btn" data-page="' + (page + 1) + '"' + (page === totalPages ? ' disabled' : '') + '>下一页</button>';
    host.innerHTML = '<span class="page-info">共 ' + total + ' 条记录 · 第 ' + page + ' / ' + totalPages + ' 页</span><div class="page-btns">' + buttons + '</div>';
    App.qsa('[data-page]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        page = Number(btn.getAttribute('data-page'));
        renderList();
      });
    });
  }

  function init() {
    const user = App.requireAuth();
    if (!user) return;
    records = App.getInterviewHistory().slice().sort((a, b) => parseTime(b.date) - parseTime(a.date));
    renderStats();
    renderList();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
