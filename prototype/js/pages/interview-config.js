/* AI 面试配置 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;

  const DIFFICULTIES = [
    { id: 'easy', name: '简单', sub: '基础面试', desc: '适合初次尝试 AI 面试、希望熟悉流程的同学' },
    { id: 'medium', name: '中等', sub: '进阶面试', desc: '适合有一定项目经验、准备求职面试的同学' },
    { id: 'hard', name: '困难', sub: '高级面试', desc: '适合冲刺高级岗位、希望挑战深水区的候选人' },
  ];

  const state = { direction: 'agent', difficulty: 'medium', count: 10 };

  function getQuota() {
    const today = App.formatDate(new Date());
    let q = App.storage.get('cp_interview_quota', null);
    if (!q || q.date !== today) {
      q = { date: today, used: 0 };
      App.storage.set('cp_interview_quota', q);
    }
    return q;
  }

  function remaining() { return Math.max(0, 5 - (Number(getQuota().used) || 0)); }

  function directionMeta(id) { return Data.DIRECTION_META.find(d => d.id === id) || Data.DIRECTION_META[0]; }

  function estimateMinutes(count) {
    return Math.max(10, Math.round((Number(count) || 0) * 3 / 5) * 5);
  }

  function loadSaved() {
    const cfg = App.getInterviewConfig();
    if (cfg && cfg.direction && Data.DIRECTION_META.some(d => d.id === cfg.direction)) {
      state.direction = cfg.direction;
      state.difficulty = cfg.difficulty || 'medium';
      state.count = Number(cfg.count) || 10;
    }
  }

  function renderDirections() {
    const host = App.qs('#directionGrid');
    host.innerHTML = Data.DIRECTION_META.map(function (d) {
      return '<button class="direction-card' + (state.direction === d.id ? ' active' : '') + '" data-dir="' + d.id + '">' +
        '<span class="d-icon" style="background:' + d.tint + '">' + d.icon + '</span>' +
        '<b>' + d.name + '</b><span>' + d.short + '</span>' +
      '</button>';
    }).join('');
    App.qsa('[data-dir]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.direction = btn.getAttribute('data-dir');
        renderDirections();
        renderSummary();
      });
    });
  }

  function renderDifficulties() {
    const host = App.qs('#difficultyGrid');
    host.innerHTML = DIFFICULTIES.map(function (d) {
      return '<button class="difficulty-card' + (state.difficulty === d.id ? ' active' : '') + '" data-diff="' + d.id + '">' +
        '<b>' + d.name + ' <span class="small muted" style="font-weight:500">' + d.sub + '</span></b>' +
        '<p>' + d.desc + '</p>' +
      '</button>';
    }).join('');
    App.qsa('[data-diff]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.difficulty = btn.getAttribute('data-diff');
        renderDifficulties();
        renderSummary();
      });
    });
  }

  function renderSummary() {
    const meta = directionMeta(state.direction);
    const diff = DIFFICULTIES.find(d => d.id === state.difficulty);
    App.qs('#summaryDirection').innerHTML =
      '<span class="d-icon" style="background:' + meta.tint + '">' + meta.icon + '</span>' +
      '<div><b>' + meta.name + '</b><span>' + meta.short + ' · ' + diff.name + '难度</span></div>';
    App.qs('#summaryList').innerHTML =
      '<div class="summary-row"><span>技术方向</span><b>' + meta.name + '</b></div>' +
      '<div class="summary-row"><span>面试难度</span><b>' + diff.name + '（' + diff.sub + '）</b></div>' +
      '<div class="summary-row"><span>题目数量</span><b>' + state.count + ' 题</b></div>' +
      '<div class="summary-row"><span>每题限时</span><b>5 分钟 / 题</b></div>' +
      '<div class="summary-row"><span>预计时长</span><b>约 ' + estimateMinutes(state.count) + ' 分钟</b></div>';
    renderQuota();
  }

  function renderQuota() {
    const q = getQuota();
    const left = remaining();
    App.qs('#quotaNum').textContent = left;
    App.qs('#quotaDots').innerHTML = [0, 1, 2, 3, 4].map(function (i) {
      return '<i class="' + (i < q.used ? 'used' : '') + '"></i>';
    }).join('');
    const btn = App.qs('#startInterviewBtn');
    if (left <= 0) {
      btn.disabled = true;
      btn.innerHTML = '今日次数已用完 <span data-icon="lock" data-icon-size="16"></span>';
      App.qs('#quotaNote').textContent = '今日额度已用尽，次日 0 点重置';
      window.hydrateIcons(btn);
    } else {
      btn.disabled = false;
      btn.innerHTML = '开始 AI 面试 <span data-icon="arrowRight" data-icon-size="17"></span>';
      App.qs('#quotaNote').textContent = '每日 0 点重置，每次面试消耗 1 次';
      window.hydrateIcons(btn);
    }
  }

  function start() {
    if (remaining() <= 0) {
      App.toast('今日 AI 面试次数已用完，请明日再来', 'warning');
      return;
    }
    const existing = App.getInterviewSession();
    const go = function () {
      const q = getQuota();
      q.used = Math.min(5, (Number(q.used) || 0) + 1);
      App.storage.set('cp_interview_quota', q);
      const meta = directionMeta(state.direction);
      App.setInterviewConfig({
        direction: state.direction,
        directionName: meta.name,
        difficulty: state.difficulty,
        count: state.count,
        timeout: 300,
        createdAt: new Date().toISOString(),
      });
      App.clearInterviewSession();
      location.href = 'ai-interview.html';
    };
    if (existing) {
      App.confirmDialog({
        title: '开始新的面试',
        message: '检测到一场未完成的面试，开始新面试将清除上次进度，确定继续吗？',
        confirmText: '开始新面试',
        cancelText: '返回配置',
        danger: true,
        icon: 'alert',
      }).then(function (ok) { if (ok) go(); });
    } else {
      go();
    }
  }

  function init() {
    const user = App.requireAuth();
    if (!user) return;
    loadSaved();
    renderDirections();
    renderDifficulties();
    App.qs('#questionCount').value = String(state.count);
    App.qs('#questionCount').addEventListener('change', function (e) {
      state.count = Number(e.target.value) || 10;
      renderSummary();
    });
    App.qs('#startInterviewBtn').addEventListener('click', start);
    renderSummary();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
