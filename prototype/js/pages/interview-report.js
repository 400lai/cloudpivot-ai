/* 面试报告 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;

  const DIFF_LABEL = { easy: '简单', medium: '中等', hard: '困难' };
  let currentResult = null;

  function gradeOf(score) {
    if (score >= 85) return { label: '表现优秀', color: '#6ee7b7', ring: '#10B981' };
    if (score >= 70) return { label: '表现良好', color: '#a5b4fc', ring: '#6366F1' };
    if (score >= 60) return { label: '基本合格', color: '#fcd34d', ring: '#F59E0B' };
    return { label: '仍需提升', color: '#fca5a5', ring: '#EF4444' };
  }

  function dimClass(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'mid';
    return 'low';
  }

  function makeDimensions(overall) {
    const defs = [
      { name: '专业知识', delta: 4, icon: 'book' },
      { name: '逻辑表达', delta: -2, icon: 'list' },
      { name: '项目经验', delta: -6, icon: 'briefcase' },
      { name: '问题解决', delta: 0, icon: 'target' },
      { name: '沟通表达', delta: 2, icon: 'message' },
      { name: '学习潜力', delta: 5, icon: 'trendingUp' },
    ];
    return defs.map(function (d, i) {
      return { name: d.name, icon: d.icon, score: Math.max(30, Math.min(97, overall + d.delta + ((i % 2) ? -2 : 2))) };
    });
  }

  const ADVICE = {
    '专业知识': { title: '专业知识深度不足', advice: '建议先梳理该方向的知识图谱，再针对薄弱阶段进行专项刷题，并把错题按主题归档复习。' },
    '逻辑表达': { title: '回答结构可以更清晰', advice: '尝试使用「结论 — 要点 — 案例」的三段式结构，每次回答控制在 1–2 分钟。' },
    '项目经验': { title: '缺少可展开的项目案例', advice: '准备 1–2 个可以讲深讲透的项目，按背景、目标、方案、结果、复盘五个部分整理。' },
    '问题解决': { title: '方案权衡体现不足', advice: '回答开放问题时，先澄清约束条件，再给出至少两个方案并说明取舍。' },
    '沟通表达': { title: '表达节奏需要优化', advice: '减少信息堆砌，先讲重点，再根据面试官的反应补充细节。' },
    '学习潜力': { title: '学习规划不够具体', advice: '把学习目标拆成周计划，并持续输出笔记与复盘，形成可验证的成长记录。' },
  };

  function buildFallback(record) {
    const overall = Number(record.score) || 78;
    const dims = makeDimensions(overall);
    const sorted = dims.slice().sort((a, b) => b.score - a.score);
    const improvements = sorted.slice(-3).reverse().map(function (d) {
      const a = ADVICE[d.name] || { title: d.name + '待提升', advice: '建议针对该维度安排专项训练。' };
      return { title: a.title, advice: a.advice };
    });
    let strengths;
    if (overall >= 80) {
      strengths = [
        '回答能够围绕问题展开，具备较好的专业理解。',
        sorted[0].name + '维度表现相对突出，是本次面试的加分项。',
        '整体表达能力较好，具备进入下一轮面试的潜力。',
      ];
    } else if (overall >= 60) {
      strengths = [
        '能够围绕问题完整作答，表达基本清楚。',
        sorted[0].name + '维度相对其他维度表现更好。',
        '具备继续提升的基础，建议按报告建议专项补强。',
      ];
    } else {
      strengths = [
        '能够尝试回答本次面试问题，并完整参与面试流程。',
        '在「' + sorted[0].name + '」维度相对其他维度表现更好，可作为补强起点。',
        '报告已给出可执行的改进方向，建议先补齐核心概念与表达结构。',
      ];
    }
    return {
      id: record.id,
      direction: record.direction,
      directionName: record.directionName,
      difficulty: record.difficulty,
      date: record.date,
      duration: record.duration,
      count: record.count,
      answered: record.count,
      overall: overall,
      accuracy: overall,
      dimensions: dims,
      strengths: strengths,
      improvements: improvements,
      suggestions: [
        '针对本次得分最低的「' + sorted[sorted.length - 1].name + '」安排 2 个阶段的专项刷题，并在错题本中跟踪纠正进度。',
        '用 STAR 法则重写项目经历回答，把单个项目控制在 90 秒以内。',
        '一周内完成一次同方向的再次面试，对比能力维度变化。',
      ],
      messages: null,
      questions: null,
    };
  }

  function getResult() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const latest = App.getInterviewResult();
    if (latest && (!id || latest.id === id)) return latest;
    const history = App.getInterviewHistory();
    if (id) {
      const record = history.find(h => h.id === id);
      if (record) return buildFallback(record);
    }
    if (latest) return latest;
    return buildFallback(history[0] || {
      id: 'demo', direction: 'agent', directionName: 'AI应用与智能体开发', difficulty: 'medium',
      score: 82, date: App.formatDateTime(new Date()), duration: 1420, count: 10,
    });
  }

  function getTrend(result) {
    const history = App.getInterviewHistory().filter(h => h.id !== result.id && h.direction === result.direction);
    if (!history.length) return { text: '首次面试', cls: 'flat', icon: 'minus' };
    const prev = history[0];
    const delta = result.overall - prev.score;
    if (delta > 0) return { text: '+' + delta + ' 分', cls: 'up', icon: 'trendingUp', prev: prev.score };
    if (delta < 0) return { text: delta + ' 分', cls: 'down', icon: 'trendingDown', prev: prev.score };
    return { text: '持平', cls: 'flat', icon: 'minus', prev: prev.score };
  }

  function renderHero(result) {
    const grade = gradeOf(result.overall);
    const trend = getTrend(result);
    const host = App.qs('#reportHero');
    host.innerHTML =
      '<div class="report-hero">' +
        '<div class="report-ring-wrap">' +
          '<div class="score-ring" style="--score:' + result.overall + ';--ring-color:' + grade.ring + '">' +
            '<div class="score-ring-inner"><div class="score-num">' + result.overall + '<span>分</span></div>' +
            '<div class="score-label"><b style="background:rgba(255,255,255,.12);color:' + grade.color + '">' + grade.label + '</b></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="report-intro">' +
          '<span class="eyebrow">Interview Report</span>' +
          '<h1>面试能力报告</h1>' +
          '<div class="report-meta"><span>' + App.escapeHTML(result.directionName) + '</span><span class="dot-sep"></span>' +
            '<span>' + (DIFF_LABEL[result.difficulty] || '中等') + '难度</span><span class="dot-sep"></span><span>' + App.escapeHTML(result.date) + '</span></div>' +
          '<div class="report-summary-grid four">' +
            '<div class="report-summary-item"><span>回答准确度</span><b>' + (result.accuracy || result.overall) + '%</b></div>' +
            '<div class="report-summary-item"><span>面试时长</span><b>' + App.formatMinutes(Math.max(1, Math.round((result.duration || 0) / 60))) + '</b></div>' +
            '<div class="report-summary-item"><span>答题数量</span><b>' + (result.answered || result.count) + ' / ' + result.count + ' 题</b></div>' +
            '<div class="report-summary-item"><span>相比上次</span><b class="trend ' + trend.cls + '" style="font-size:15px">' + window.icon(trend.icon, 14) + ' ' + trend.text + '</b>' +
              (trend.prev != null ? '<span style="margin-top:2px">上次 ' + trend.prev + ' 分</span>' : '') + '</div>' +
          '</div>' +
          '<div class="report-actions">' +
            '<a class="btn btn-primary" href="interview-history.html">' + window.icon('clock', 16) + ' 查看历史记录</a>' +
            '<a class="btn" href="ai-config.html">' + window.icon('refresh', 16) + ' 再来一次</a>' +
            '<button class="btn" id="replayBtn">' + window.icon('play', 16) + ' 查看面试回放</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    window.hydrateIcons(host);
    App.qs('#replayBtn').addEventListener('click', function () { showReplay(result); });
  }

  function renderBody(result) {
    const dims = result.dimensions || makeDimensions(result.overall);
    const strengths = result.strengths || [];
    const improvements = result.improvements || [];
    const suggestions = result.suggestions || [];
    const host = App.qs('#reportBody');
    host.innerHTML =
      '<section class="report-section card">' +
        '<div class="card-head"><div><h3 class="card-title">能力分析</h3><p class="card-sub">基于本次面试表现的多维度评估</p></div><span class="badge badge-brand">6 个维度</span></div>' +
        '<div class="card-body"><div class="dimension-grid">' + dims.map(function (d) {
          const cls = dimClass(d.score);
          return '<div class="dimension-card ' + cls + '">' +
            '<div class="dimension-top"><span>' + App.escapeHTML(d.name) + '</span><b class="dim-val">' + d.score + '</b></div>' +
            '<div class="progress"><span style="width:' + d.score + '%"></span></div>' +
            '<div class="dim-note">' + (cls === 'high' ? '表现突出' : cls === 'mid' ? '表现良好，仍有提升空间' : '建议重点补强') + '</div>' +
          '</div>';
        }).join('') + '</div></div>' +
      '</section>' +
      '<section class="report-section sw-grid">' +
        '<div class="sw-card"><div class="sw-card-head"><span class="icon-tile green">' + window.icon('checkCircle', 17) + '</span> 本次亮点</div>' +
          strengths.map(s => '<div class="sw-item good">' + window.icon('check', 15) + '<span>' + App.escapeHTML(s) + '</span></div>').join('') +
        '</div>' +
        '<div class="sw-card"><div class="sw-card-head"><span class="icon-tile amber">' + window.icon('target', 17) + '</span> 待提升项</div>' +
          improvements.map(function (it) {
            return '<div class="sw-item improve">' + window.icon('arrowUpRight', 15) + '<span><b style="display:block;color:var(--ink-2)">' + App.escapeHTML(it.title) + '</b>' +
              '<span class="sw-hint">' + App.escapeHTML(it.advice) + '</span></span></div>';
          }).join('') +
        '</div>' +
      '</section>' +
      '<section class="report-section card">' +
        '<div class="card-head"><div><h3 class="card-title">改进建议</h3><p class="card-sub">按优先级排序，建议从第一条开始行动</p></div></div>' +
        '<div class="card-body"><div class="suggest-list">' + suggestions.map(function (s, i) {
          return '<div class="suggest-item"><span class="suggest-num">' + (i + 1) + '</span><div><b>' + (i === 0 ? '优先补强短板' : i === 1 ? '优化表达结构' : '建立反馈循环') + '</b><p>' + App.escapeHTML(s) + '</p></div></div>';
        }).join('') + '</div></div>' +
      '</section>' +
      '<section class="report-section">' +
        '<div class="section-head" style="margin-bottom:14px"><div><h2 style="font-size:20px">能力提升建议</h2><p class="small muted" style="margin-top:4px">根据本次报告为你推荐下一步行动</p></div></div>' +
        '<div class="recommend-grid">' +
          '<div class="recommend-card"><span class="icon-tile brand">' + window.icon('book', 19) + '</span><h4>推荐题目</h4>' +
            '<p>针对本次得分较低的维度，建议先完成对应阶段的专项练习，并在错题本中持续跟踪纠正次数。</p></div>' +
          '<div class="recommend-card"><span class="icon-tile green">' + window.icon('route', 19) + '</span><h4>推荐课程</h4>' +
            '<p>按学习路线补齐知识体系，优先观看与本次薄弱维度相关的课程，再做一次阶段练习。</p></div>' +
          '<div class="recommend-card"><span class="icon-tile purple">' + window.icon('mic', 19) + '</span><h4>推荐再次面试</h4>' +
            '<p>完成一轮补强后，用相同方向再面一次，对比两次报告中的能力维度与总分变化。</p></div>' +
        '</div>' +
      '</section>' +
      '<div class="report-footer-actions">' +
        '<span class="small muted">报告生成于 ' + App.escapeHTML(result.date) + ' · 结果仅供训练参考</span>' +
        '<div class="row gap-10"><a class="btn btn-outline" href="interview-history.html">查看历史记录</a>' +
        '<a class="btn btn-primary" href="ai-config.html">再来一次</a></div>' +
      '</div>';
    window.hydrateIcons(host);
  }

  function showReplay(result) {
    let messages = result.messages;
    if (!messages || !messages.length) {
      const questions = (result.questions && result.questions.length)
        ? result.questions
        : Data.helpers.buildInterviewQuestions(result.direction, result.difficulty, result.count).map(function (q, i) {
          q.score = Math.max(30, Math.min(96, result.overall + ((i % 3) - 1) * 5)) / 10;
          return q;
        });
      messages = [];
      questions.forEach(function (q) {
        messages.push({ role: 'ai', text: q.text, time: '', score: q.score, questionNo: q.no });
        messages.push({ role: 'user', text: '（本次记录未保存回答文本，可在新一轮面试中体验完整回放）', time: '' });
      });
    }
    const body =
      '<div class="chat-inner" style="gap:16px">' + messages.filter(m => m.type !== 'welcome').map(function (m) {
        const isAi = m.role === 'ai';
        const score = m.score != null ? '<span class="score-tag ' + (m.score >= 8 ? 'high' : m.score >= 6 ? 'mid' : 'low') + '">' + Number(m.score).toFixed(1) + ' / 10</span>' : '';
        return '<div class="msg ' + m.role + '">' +
          '<span class="msg-avatar ' + (isAi ? 'ai' : 'user') + '">' + (isAi ? 'AI' : '我') + '</span>' +
          '<div class="msg-content"><div class="msg-meta">' +
            (m.questionNo ? '<span class="badge badge-brand" style="height:19px;font-size:9.5px">第 ' + m.questionNo + ' 题</span>' : '') +
            '<b>' + (isAi ? 'AI 面试官' : '我的回答') + '</b>' + score + '</div>' +
            '<div class="msg-bubble ' + m.role + '" style="max-width:none">' + App.escapeHTML(m.text).replace(/\n/g, '<br>') + '</div>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>';
    App.openModal({
      title: '面试回放',
      desc: result.directionName + ' · ' + (DIFF_LABEL[result.difficulty] || '中等') + ' · ' + result.date,
      size: 'xwide',
      body: body,
      footer: '<button class="btn btn-primary" data-close-modal>关闭回放</button>',
    });
  }

  function init() {
    const user = App.requireAuth();
    if (!user) return;
    currentResult = getResult();
    if (!currentResult.dimensions) currentResult.dimensions = makeDimensions(currentResult.overall);
    if (!currentResult.strengths) {
      const fallback = buildFallback({
        id: currentResult.id, direction: currentResult.direction, directionName: currentResult.directionName,
        difficulty: currentResult.difficulty, score: currentResult.overall, date: currentResult.date,
        duration: currentResult.duration, count: currentResult.count,
      });
      currentResult.strengths = fallback.strengths;
      currentResult.improvements = fallback.improvements;
      currentResult.suggestions = fallback.suggestions;
    }
    renderHero(currentResult);
    renderBody(currentResult);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
