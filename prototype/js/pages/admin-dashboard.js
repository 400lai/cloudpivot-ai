/* 管理端 · 数据看板 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;
  let range = 7;

  function renderStats() {
    const db = App.getDB();
    const stats = [
      { label: '学科数量', value: db.subjects.length, unit: '个', icon: 'layers', tone: 'brand', foot: '较上月持平' },
      { label: '题目数量', value: db.questions.length, unit: '道', icon: 'book', tone: 'blue', foot: '今日新增 <b class="trend up">+23</b>' },
      { label: '注册用户', value: 12580, unit: '人', icon: 'users', tone: 'green', foot: '今日新增 <b class="trend up">+156</b>', formatted: true },
      { label: 'AI面试次数', value: 3420, unit: '次', icon: 'mic', tone: 'purple', foot: '今日新增 <b class="trend up">+89</b>', formatted: true },
    ];
    App.qs('#dashboardStats').innerHTML = stats.map(function (s) {
      return '<div class="admin-stat">' +
        '<div class="s-label"><span>' + s.label + '</span><span class="icon-tile ' + s.tone + '">' + window.icon(s.icon, 16) + '</span></div>' +
        '<div class="s-value">' + (s.formatted ? App.formatNumber(s.value) : s.value) + '<small>' + s.unit + '</small></div>' +
        '<div class="s-foot">' + s.foot + '</div>' +
      '</div>';
    }).join('');
  }

  function dates(count) {
    const arr = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      arr.push((d.getMonth() + 1) + '/' + d.getDate());
    }
    return arr;
  }

  function growthData(count) {
    if (count === 7) return [128, 156, 142, 188, 210, 236, 268];
    const arr = [];
    for (let i = 0; i < count; i++) {
      const base = 40 + i * (count === 90 ? 2.1 : 5.2);
      const wave = Math.sin(i * 0.62) * (count === 90 ? 7 : 12);
      arr.push(Math.max(16, Math.round(base + wave + (i % 4) * 4)));
    }
    return arr;
  }

  function niceMax(v) {
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1))));
    return Math.ceil(v / pow) * pow;
  }

  function renderGrowth() {
    const values = growthData(range);
    const labels = dates(range);
    const host = App.qs('#growthChart');
    const W = 680, H = 260;
    const m = { left: 44, right: 22, top: 20, bottom: 32 };
    const pw = W - m.left - m.right;
    const ph = H - m.top - m.bottom;
    const max = niceMax(Math.max.apply(null, values));
    const ticks = 4;
    const last = values.length - 1;
    const xAt = i => m.left + (i / last) * pw;
    const yAt = v => m.top + ph - (v / max) * ph;
    const points = values.map((v, i) => ({ x: xAt(i), y: yAt(v), v: v, label: labels[i] }));
    const line = points.map(p => (p === points[0] ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
    const area = line + ' L ' + xAt(last).toFixed(1) + ' ' + (m.top + ph) + ' L ' + m.left + ' ' + (m.top + ph) + ' Z';

    let grid = '';
    for (let i = 0; i <= ticks; i++) {
      const v = (max / ticks) * i;
      const y = yAt(v);
      grid += '<line class="grid-line" x1="' + m.left + '" x2="' + (W - m.right) + '" y1="' + y + '" y2="' + y + '"/>';
      grid += '<text class="axis-text" x="' + (m.left - 10) + '" y="' + (y + 3.5) + '" text-anchor="end">' + App.compact(v) + '</text>';
    }

    const step = range === 7 ? 1 : range === 30 ? 5 : 15;
    let xlabels = '';
    labels.forEach(function (label, i) {
      if (i % step === 0 || i === last) {
        xlabels += '<text class="axis-text" x="' + xAt(i) + '" y="' + (H - 10) + '" text-anchor="middle">' + label + '</text>';
      }
    });

    const pointMarks = points.map(function (p) {
      return '<circle class="point-ring" cx="' + p.x + '" cy="' + p.y + '" r="4"/>';
    }).join('');

    const hits = points.map(function (p) {
      const half = Math.max(14, pw / values.length / 2);
      return '<rect class="hit" x="' + (p.x - half) + '" y="' + m.top + '" width="' + (half * 2) + '" height="' + (ph + 14) + '" tabindex="0" data-tip="' + p.label + ' · 新增 ' + p.v + ' 人" aria-label="' + p.label + '，新增 ' + p.v + ' 人"></rect>';
    }).join('');

    const end = points[last];
    const endLabel = '<text x="' + (end.x - 6) + '" y="' + (end.y - 11) + '" text-anchor="end" style="fill:var(--ink-2);font-size:11px;font-weight:700">' + App.formatNumber(end.v) + '</text>';

    host.innerHTML =
      '<svg class="line-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="用户增长趋势折线图，' + range + ' 天">' +
        '<desc>最近 ' + range + ' 天新增注册用户趋势，最新一天新增 ' + end.v + ' 人。</desc>' +
        grid +
        '<path class="area-fill" d="' + area + '"/>' +
        '<path class="series-line" d="' + line + '"/>' +
        pointMarks + endLabel +
        hits +
        xlabels +
      '</svg>';

    const tbody = App.qs('#growthTable tbody');
    if (tbody) tbody.innerHTML = points.map(p => '<tr><td>' + p.label + '</td><td>' + p.v + ' 人</td></tr>').join('');
    App.qsa('[data-range]').forEach(function (btn) {
      btn.classList.toggle('active', Number(btn.getAttribute('data-range')) === range);
    });
  }

  function renderDistribution() {
    const db = App.getDB();
    const counts = {};
    db.questions.forEach(function (q) {
      counts[q.subjectId] = (counts[q.subjectId] || 0) + 1;
    });
    const rows = db.subjects.map(function (s) {
      return { name: s.name, short: s.short || s.name, count: counts[s.id] || 0, tint: s.tint };
    }).sort((a, b) => b.count - a.count);
    const total = rows.reduce((n, r) => n + r.count, 0);
    const max = Math.max.apply(null, rows.map(r => r.count).concat([1]));
    App.qs('#distTotal').textContent = total + ' 题';
    App.qs('#subjectDist').innerHTML = rows.map(function (r) {
      return '<div class="dist-row" tabindex="0" data-tip="' + App.escapeHTML(r.name) + ' · ' + r.count + ' 题">' +
        '<span class="dist-label" title="' + App.escapeHTML(r.name) + '">' + App.escapeHTML(r.short) + '</span>' +
        '<div class="dist-track"><div class="dist-bar" style="width:' + Math.max(2, (r.count / max) * 100) + '%"></div></div>' +
        '<span class="dist-value">' + r.count + '</span>' +
      '</div>';
    }).join('');
    const tbody = App.qs('#distTable tbody');
    if (tbody) tbody.innerHTML = rows.map(r => '<tr><td>' + App.escapeHTML(r.name) + '</td><td>' + r.count + ' 题</td></tr>').join('');
  }

  function renderActivity() {
    const db = App.getDB();
    const rows = db.logs.slice(0, 6);
    App.qs('#activityTable').innerHTML = rows.map(function (log) {
      return '<tr>' +
        '<td><div class="activity-user">' + App.avatarHTML(log.user, App.hashColor(log.user), 'sm') + '<b>' + App.escapeHTML(log.user) + '</b></div></td>' +
        '<td><span class="activity-action">' + window.icon(log.type === 'delete' ? 'trash' : log.type === 'create' ? 'plus' : log.type === 'login' ? 'logout' : 'edit', 13) + App.escapeHTML(log.action) + '</span></td>' +
        '<td><div class="activity-detail" title="' + App.escapeHTML(log.detail) + '">' + App.escapeHTML(log.detail) + '</div></td>' +
        '<td><span class="activity-time">' + App.escapeHTML(log.time) + '</span></td>' +
      '</tr>';
    }).join('');
    window.hydrateIcons(App.qs('#activityTable'));
  }

  function renderAll() {
    renderStats();
    renderGrowth();
    renderDistribution();
    renderActivity();
  }

  function init() {
    if (!App.getAdmin()) return;
    renderAll();
    App.qsa('[data-range]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        range = Number(btn.getAttribute('data-range'));
        renderGrowth();
      });
    });
    App.qs('#refreshDashboard').addEventListener('click', function () {
      renderAll();
      App.toast('数据已刷新', 'success');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
