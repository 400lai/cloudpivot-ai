/* 题库中心 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;
  const H = Data.helpers;

  const state = {
    subjectId: null,
    stageId: null,
    view: 'stages',
    type: 'all',
    difficulty: 'all',
    keyword: '',
  };

  const DIFF_CLASS = { easy: 'badge-green', medium: 'badge-amber', hard: 'badge-red' };

  function initState() {
    const params = new URLSearchParams(location.search);
    const subject = params.get('subject');
    const stage = params.get('stage');
    const view = params.get('view');
    state.subjectId = (subject && H.getSubject(subject)) ? subject : Data.SUBJECTS[0].id;
    if (stage) {
      const found = H.getStageById(stage);
      if (found && found.subject.id === state.subjectId) {
        state.stageId = stage;
        state.view = 'questions';
      }
    }
    if (view === 'questions' && state.stageId) state.view = 'questions';
  }

  function syncURL() {
    const params = new URLSearchParams();
    params.set('subject', state.subjectId);
    if (state.stageId) params.set('stage', state.stageId);
    if (state.stageId && state.view === 'questions') params.set('view', 'questions');
    history.replaceState(null, '', 'questions.html?' + params.toString());
  }

  function renderRail() {
    const host = App.qs('#subjectRail');
    host.innerHTML =
      '<div class="subject-rail-title">全部学科</div>' +
      '<div class="subject-list">' +
      Data.SUBJECTS.map(function (s) {
        return '<button class="subject-item' + (s.id === state.subjectId ? ' active' : '') + '" data-subject="' + s.id + '">' +
          '<span class="s-icon" style="background:' + s.tint + '">' + s.icon + '</span>' +
          '<span class="s-name">' + s.name + '</span>' +
          '<span class="s-count" title="阶段数量">' + s.stages.length + '</span>' +
        '</button>';
      }).join('') +
      '</div>';
    App.qsa('[data-subject]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.subjectId = btn.getAttribute('data-subject');
        state.stageId = null;
        state.view = 'stages';
        resetFilters();
        renderAll();
        syncURL();
      });
    });
  }

  function resetFilters() {
    state.type = 'all';
    state.difficulty = 'all';
    state.keyword = '';
  }

  function renderAll() {
    renderRail();
    renderMain();
  }

  function renderMain() {
    const host = App.qs('#questionsMain');
    if (state.view === 'questions' && state.stageId) renderQuestionView(host);
    else renderStageView(host);
  }

  function renderStageView(host) {
    const subject = H.getSubject(state.subjectId);
    if (!subject) return;
    const totalQuestions = subject.stages.reduce((n, st) => n + st.questions.length, 0);
    let html =
      '<div class="subject-hero">' +
        '<span class="big-icon" style="background:' + subject.tint + '">' + subject.icon + '</span>' +
        '<div><h1>' + subject.name + '</h1><p>' + subject.desc + '</p>' +
          '<div class="meta"><span><span data-icon="layers" data-icon-size="13"></span> 共 ' + subject.stages.length + ' 个阶段</span>' +
          '<span><span data-icon="book" data-icon-size="13"></span> ' + totalQuestions + ' 道题目</span>' +
          '<span><span data-icon="route" data-icon-size="13"></span> 阶段内按序练习</span></div>' +
        '</div>' +
      '</div>';

    if (!subject.stages.length) {
      html += '<div class="card mt-16"><div class="empty"><div class="empty-art">' + window.icon('folderOpen', 28) + '</div>' +
        '<div class="empty-title">该学科暂无阶段</div><div class="empty-desc">题目正在录入中，稍后再来看看吧。</div></div></div>';
      host.innerHTML = html;
      window.hydrateIcons(host);
      return;
    }

    html += '<div class="stage-list">' + subject.stages.map(function (st, i) {
      const count = st.questions.length;
      return '<div class="stage-row' + (count === 0 ? ' is-empty' : '') + '">' +
        '<span class="stage-icon" style="background:' + subject.tint + '">' + st.icon + '</span>' +
        '<div><h3>' + st.name + '</h3><div class="stage-meta"><span>共 ' + count + ' 题</span><span class="dot-sep"></span><span>' + st.desc + '</span></div></div>' +
        '<div class="stage-actions">' +
          '<button class="btn btn-sm btn-outline" data-view-stage="' + st.id + '">查看题目</button>' +
          '<button class="btn btn-sm btn-primary" data-practice-stage="' + st.id + '"' + (count === 0 ? ' disabled' : '') + '>开始练习</button>' +
        '</div>' +
      '</div>';
    }).join('') + '</div>';

    host.innerHTML = html;
    window.hydrateIcons(host);

    App.qsa('[data-view-stage]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        openStage(btn.getAttribute('data-view-stage'));
      });
    });
    App.qsa('[data-practice-stage]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        location.href = 'practice.html?stage=' + btn.getAttribute('data-practice-stage');
      });
    });
  }

  function openStage(stageId) {
    state.stageId = stageId;
    state.view = 'questions';
    resetFilters();
    syncURL();
    renderMain();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function typeBadge(type) {
    const cls = { single: 'badge-blue', multiple: 'badge-purple', boolean: 'badge-cyan', short: 'badge-amber' }[type] || 'badge';
    return '<span class="badge ' + cls + '">' + Data.TYPE_LABEL[type] + '</span>';
  }

  function renderQuestionView(host) {
    const subject = H.getSubject(state.subjectId);
    const stage = H.getStage(state.subjectId, state.stageId);
    if (!subject || !stage) { state.view = 'stages'; return renderStageView(host); }

    if (!stage.questions.length) {
      host.innerHTML =
        '<div class="q-crumbs"><a href="#" data-back-stage>题库中心</a><span>/</span><span>' + subject.name + '</span></div>' +
        '<div class="card"><div class="empty"><div class="empty-art">' + window.icon('file', 28) + '</div>' +
          '<div class="empty-title">该阶段暂无题目</div><div class="empty-desc">题目正在录入中，去其他阶段继续练习吧。</div>' +
          '<button class="btn btn-outline" data-back-stage>返回阶段列表</button></div></div>';
      bindBack(host);
      window.hydrateIcons(host);
      return;
    }

    host.innerHTML =
      '<div class="q-crumbs"><a href="#" data-back-stage>‹ 返回阶段列表</a><span class="dot-sep"></span><span>' + subject.name + ' / ' + stage.name + '</span></div>' +
      '<div class="subject-hero" style="padding:20px 22px">' +
        '<span class="stage-icon" style="background:' + subject.tint + ';width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font-size:24px">' + stage.icon + '</span>' +
        '<div><h1 style="font-size:20px">' + stage.name + '</h1><p>' + stage.desc + '</p>' +
          '<div class="meta"><span>共 ' + stage.questions.length + ' 题</span><span class="dot-sep"></span><span>来自 ' + subject.name + '</span></div>' +
        '</div>' +
        '<button class="btn btn-primary" data-practice-stage style="margin-left:auto">开始练习</button>' +
      '</div>' +
      '<div class="q-toolbar" style="margin-top:16px">' +
        '<div class="input-wrap search"><span data-icon="search" data-icon-size="16"></span>' +
          '<input class="input input-sm" id="qSearch" placeholder="搜索题干或标签" style="padding-left:36px"></div>' +
        '<span class="label">题型</span>' +
        '<select class="select" id="qType">' +
          '<option value="all">全部题型</option><option value="single">单选题</option><option value="multiple">多选题</option><option value="boolean">判断题</option><option value="short">简答题</option>' +
        '</select>' +
        '<span class="label">难度</span>' +
        '<select class="select" id="qDiff">' +
          '<option value="all">全部难度</option><option value="easy">简单</option><option value="medium">中等</option><option value="hard">困难</option>' +
        '</select>' +
        '<span class="small muted" id="qCount" style="margin-left:auto"></span>' +
      '</div>' +
      '<div class="q-list" id="qList"></div>';

    bindBack(host);
    const search = App.qs('#qSearch', host);
    const type = App.qs('#qType', host);
    const diff = App.qs('#qDiff', host);
    const practiceAll = App.qs('[data-practice-stage]', host);
    if (practiceAll) practiceAll.addEventListener('click', function () { location.href = 'practice.html?stage=' + stage.id; });

    search.addEventListener('input', App.debounce(function () {
      state.keyword = search.value.trim().toLowerCase();
      renderList();
    }, 180));
    type.addEventListener('change', function () { state.type = type.value; renderList(); });
    diff.addEventListener('change', function () { state.difficulty = diff.value; renderList(); });

    function renderList() {
      const list = App.qs('#qList', host);
      const filtered = stage.questions.filter(function (q) {
        if (state.type !== 'all' && q.type !== state.type) return false;
        if (state.difficulty !== 'all' && q.difficulty !== state.difficulty) return false;
        if (state.keyword) {
          const hay = (q.stem + ' ' + (q.tags || []).join(' ')).toLowerCase();
          if (hay.indexOf(state.keyword) === -1) return false;
        }
        return true;
      });
      const count = App.qs('#qCount', host);
      if (count) count.textContent = '共 ' + filtered.length + ' 道题';
      if (!filtered.length) {
        list.innerHTML = '<div class="card"><div class="empty"><div class="empty-art">' + window.icon('search', 28) + '</div>' +
          '<div class="empty-title">没有找到匹配的题目</div><div class="empty-desc">试试调整筛选条件或更换关键词。</div></div></div>';
        return;
      }
      list.innerHTML = filtered.map(function (q) {
        const originNo = stage.questions.indexOf(q) + 1;
        return '<article class="q-card">' +
          '<div class="q-card-top"><span class="q-no">第 ' + originNo + ' 题</span>' + typeBadge(q.type) +
            '<span class="badge ' + DIFF_CLASS[q.difficulty] + '">' + Data.DIFF_LABEL[q.difficulty] + '</span>' +
            (q.tags || []).slice(0, 2).map(t => '<span class="q-tag">' + App.escapeHTML(t) + '</span>').join('') +
          '</div>' +
          '<h3>' + App.escapeHTML(q.stem) + '</h3>' +
          '<div class="q-meta">' +
            '<span>' + stage.name + '</span><span class="dot-sep"></span>' +
            '<span>' + App.compact(q.attempts) + ' 人做过</span><span class="dot-sep"></span>' +
            '<span class="q-accuracy">正确率 ' + q.correctRate + '%</span>' +
          '</div>' +
          '<div class="q-actions">' +
            '<button class="btn btn-sm btn-outline" data-analysis="' + q.id + '">' + window.icon('eye', 13) + ' 查看解析</button>' +
            '<button class="btn btn-sm btn-soft" data-practice-q="' + q.id + '">' + window.icon('play', 13) + ' 开始练习</button>' +
          '</div>' +
        '</article>';
      }).join('');
      App.qsa('[data-analysis]', list).forEach(function (btn) {
        btn.addEventListener('click', function () { showAnalysis(btn.getAttribute('data-analysis')); });
      });
      App.qsa('[data-practice-q]', list).forEach(function (btn) {
        btn.addEventListener('click', function () { location.href = 'practice.html?question=' + btn.getAttribute('data-practice-q'); });
      });
      window.hydrateIcons(list);
    }
    renderList();
    window.hydrateIcons(host);
  }

  function bindBack(host) {
    App.qsa('[data-back-stage]', host).forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        state.view = 'stages';
        state.stageId = null;
        resetFilters();
        syncURL();
        renderMain();
      });
    });
  }

  function showAnalysis(id) {
    const q = H.getQuestion(id);
    if (!q) return;
    const isShort = q.type === 'short';
    const correctText = isShort ? q.answerText : q.options.filter(o => q.answer.indexOf(o.key) > -1).map(o => o.key + '. ' + o.text).join('；');
    const body =
      '<div class="row gap-8 wrap" style="margin-bottom:14px">' + typeBadge(q.type) +
        '<span class="badge ' + DIFF_CLASS[q.difficulty] + '">' + Data.DIFF_LABEL[q.difficulty] + '</span>' +
        (q.tags || []).map(t => '<span class="q-tag">' + App.escapeHTML(t) + '</span>').join('') +
      '</div>' +
      '<h3 style="font-size:16px;line-height:1.7">' + App.escapeHTML(q.stem) + '</h3>' +
      (isShort ? '' : '<div class="option-list" style="margin-top:18px">' + q.options.map(function (o) {
        const isRight = q.answer.indexOf(o.key) > -1;
        return '<div class="option disabled ' + (isRight ? 'correct' : '') + '" style="padding:11px 13px">' +
          '<span class="opt-key">' + o.key + '</span><span>' + App.escapeHTML(o.text) + '</span>' +
          (isRight ? '<span class="opt-mark">' + window.icon('checkCircle', 16) + '</span>' : '') +
        '</div>';
      }).join('') + '</div>') +
      '<div class="analysis-answer" style="margin-top:18px"><b>正确答案：</b><span>' + App.escapeHTML(correctText) + '</span></div>' +
      '<div style="font-size:12.5px;line-height:1.85;color:var(--ink-3)"><b style="display:block;margin-bottom:4px;color:var(--ink)">解析</b>' + App.escapeHTML(q.explanation) + '</div>';
    App.openModal({
      title: '题目解析',
      desc: '来自「' + (H.getSubject(q.subjectId) ? H.getSubject(q.subjectId).name : '') + '」',
      size: 'wide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>关闭</button>' +
        '<button class="btn btn-primary" data-practice-now>开始练习</button>',
      onMount: function (layer, close) {
        layer.querySelector('[data-practice-now]').addEventListener('click', function () {
          location.href = 'practice.html?question=' + q.id;
        });
      },
    });
  }

  function init() {
    initState();
    renderAll();
    syncURL();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
