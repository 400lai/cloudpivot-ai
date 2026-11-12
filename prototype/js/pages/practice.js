/* 刷题练习 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;
  const H = Data.helpers;

  let target = null;
  let session = null;
  let questions = [];
  let timerId = null;
  let saveTick = 0;
  let started = false;
  let closingToRestart = false;
  let gradingQuestion = null;

  const DIFF_CLASS = { easy: 'badge-green', medium: 'badge-amber', hard: 'badge-red' };
  const MODE_LABEL = { sequential: '顺序练习', random: '随机练习', single: '单题练习' };

  function typeBadge(type) {
    const cls = { single: 'badge-blue', multiple: 'badge-purple', boolean: 'badge-cyan', short: 'badge-amber' }[type] || 'badge';
    return '<span class="badge ' + cls + '">' + Data.TYPE_LABEL[type] + '</span>';
  }

  function formatHMS(total) {
    const s = Math.max(0, Math.floor(Number(total) || 0));
    return App.pad(Math.floor(s / 3600)) + ':' + App.pad(Math.floor((s % 3600) / 60)) + ':' + App.pad(s % 60);
  }

  function resolveTarget() {
    const params = new URLSearchParams(location.search);
    const qid = params.get('question');
    const stageId = params.get('stage');
    if (qid) {
      const q = H.getQuestion(qid);
      if (q) {
        const found = H.getStageById(q.stageId);
        return {
          subject: found.subject, stage: found.stage, baseQuestions: [q],
          title: found.stage.name + ' · 单题', single: true,
        };
      }
    }
    let targetStageId = stageId;
    if (!targetStageId) {
      const subject = Data.SUBJECTS.find(s => s.stages.some(st => st.questions.length > 0));
      targetStageId = subject ? subject.stages.find(st => st.questions.length > 0).id : null;
    }
    const found = targetStageId ? H.getStageById(targetStageId) : null;
    if (!found) return null;
    return {
      subject: found.subject, stage: found.stage, baseQuestions: found.stage.questions.slice(),
      title: found.stage.name, single: false,
    };
  }

  function questionsBackURL() {
    if (!target) return 'questions.html';
    return 'questions.html?subject=' + target.subject.id + '&stage=' + target.stage.id + '&view=questions';
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showModeModal() {
    const count = target.baseQuestions.length;
    const params = new URLSearchParams(location.search);
    const hasMode = params.get('mode');
    if (hasMode === 'random' || hasMode === 'sequential') {
      startNew(hasMode);
      return;
    }
    App.openModal({
      title: '选择练习模式',
      desc: target.stage.name + ' · 本阶段共 ' + count + ' 道题',
      body:
        '<div class="mode-grid">' +
          '<button class="mode-card" data-mode="sequential">' +
            '<span class="icon-tile brand">' + window.icon('list', 21) + '</span>' +
            '<h3>顺序练习</h3><p>按题库顺序逐题作答，适合系统学习与连续复习。</p>' +
          '</button>' +
          '<button class="mode-card" data-mode="random">' +
            '<span class="icon-tile purple">' + window.icon('shuffle', 21) + '</span>' +
            '<h3>随机练习</h3><p>打乱题目顺序作答，更适合检验真实掌握程度。</p>' +
          '</button>' +
        '</div>' +
        '<div class="callout brand mt-16">' + window.icon('info', 16) + '<span>练习进度会自动保存，下次进入可继续上次进度。选择题选择后立即判分，简答题由 AI 批改。</span></div>',
      footer: '<button class="btn btn-outline" data-cancel-mode>取消</button>',
      closeOnBackdrop: true,
      onMount: function (layer, close) {
        layer.querySelector('[data-cancel-mode]').addEventListener('click', close);
        App.qsa('[data-mode]', layer).forEach(function (btn) {
          btn.addEventListener('click', function () {
            const mode = btn.getAttribute('data-mode');
            started = true;
            close();
            startNew(mode);
          });
        });
      },
      onClose: function () {
        if (!started) location.href = questionsBackURL();
      },
    });
  }

  function startNew(mode) {
    if (!target || !target.baseQuestions.length) {
      App.toast('该阶段暂无题目，题目正在录入中', 'warning');
      setTimeout(function () { location.href = questionsBackURL(); }, 700);
      return;
    }
    const params = new URLSearchParams(location.search);
    const countParam = parseInt(params.get('count'), 10);
    let order = mode === 'random' ? shuffle(target.baseQuestions) : target.baseQuestions.slice();
    if (!target.single) {
      const limit = countParam > 0 ? Math.min(countParam, order.length) : order.length;
      order = order.slice(0, limit);
    }
    session = {
      stageId: target.stage.id,
      subjectId: target.subject.id,
      stageName: target.stage.name,
      title: target.title,
      mode: target.single ? 'single' : mode,
      questionIds: order.map(q => q.id),
      answers: {},
      results: {},
      index: 0,
      elapsed: 0,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    questions = order;
    started = true;
    App.setPractice(session);
    renderAll();
    startTimer();
  }

  function resumeSession(saved) {
    const ids = (saved.questionIds || []).filter(id => H.getQuestion(id));
    if (!ids.length) {
      App.clearPractice();
      session = null;
      showModeModal();
      return;
    }
    session = Object.assign({}, saved, { questionIds: ids });
    questions = ids.map(id => H.getQuestion(id));
    session.index = Math.min(Math.max(0, Number(saved.index) || 0), questions.length - 1);
    started = true;
    App.setPractice(session);
    renderAll();
    startTimer();
    App.toast('已恢复上次练习进度', 'success');
  }

  function showResumeModal(saved) {
    const found = H.getStageById(saved.stageId);
    if (found) {
      target = {
        subject: found.subject, stage: found.stage, baseQuestions: found.stage.questions.slice(),
        title: saved.title || found.stage.name, single: false,
      };
    }
    const done = Object.keys(saved.results || {}).length;
    App.openModal({
      title: '检测到未完成的练习',
      desc: '是否继续上次的练习进度？',
      body:
        '<div class="callout brand" style="margin-bottom:16px">' + window.icon('info', 16) +
          '<span>我们为你保存了上次的题序、答案、批改结果与已用时长。</span></div>' +
        '<div class="summary-list">' +
          '<div class="summary-row"><span>练习内容</span><b>' + App.escapeHTML(saved.title || (found ? found.stage.name : '练习')) + '</b></div>' +
          '<div class="summary-row"><span>练习模式</span><b>' + (MODE_LABEL[saved.mode] || '顺序练习') + '</b></div>' +
          '<div class="summary-row"><span>当前进度</span><b>第 ' + ((Number(saved.index) || 0) + 1) + ' / ' + (saved.questionIds || []).length + ' 题</b></div>' +
          '<div class="summary-row"><span>已批改</span><b>' + done + ' 题</b></div>' +
          '<div class="summary-row"><span>已用时长</span><b>' + formatHMS(saved.elapsed) + '</b></div>' +
        '</div>',
      footer:
        '<button class="btn btn-outline" data-restart>重新开始</button>' +
        '<button class="btn btn-primary" data-continue>继续练习</button>',
      closeOnBackdrop: false,
      onMount: function (layer, close) {
        layer.querySelector('[data-restart]').addEventListener('click', function () {
          closingToRestart = true;
          close();
          closingToRestart = false;
          App.clearPractice();
          session = null;
          showModeModal();
        });
        layer.querySelector('[data-continue]').addEventListener('click', function () {
          started = true;
          close();
          resumeSession(saved);
        });
      },
      onClose: function () {
        if (!started && !closingToRestart) location.href = questionsBackURL();
      },
    });
  }

  function startTimer() {
    if (timerId) clearInterval(timerId);
    updateTimer();
    timerId = setInterval(function () {
      if (!session) return;
      session.elapsed = (Number(session.elapsed) || 0) + 1;
      updateTimer();
      saveTick += 1;
      if (saveTick % 5 === 0) saveSession();
    }, 1000);
  }

  function updateTimer() {
    const el = App.qs('#practiceTimer');
    if (el && session) el.textContent = formatHMS(session.elapsed);
  }

  function saveSession() {
    if (!session) return;
    session.updatedAt = new Date().toISOString();
    App.setPractice(session);
  }

  function renderAll() {
    if (!session) return;
    const current = questions[session.index];
    const finished = Object.keys(session.results).length;
    document.title = current ? '第 ' + (session.index + 1) + ' 题 · ' + session.title : '刷题练习 · 云枢智学';

    App.qs('#practiceTitle').textContent = session.title;
    App.qs('#practiceSub').textContent = questions.length + ' 道题 · 简答题得分 ≥ 6 分视为通过';
    App.qs('#crumbStage').textContent = session.stageName;
    App.qs('#modeBadge').textContent = MODE_LABEL[session.mode] || '顺序练习';
    App.qs('#progressText').textContent = (session.index + 1) + ' / ' + questions.length;
    App.qs('#progressBar').style.width = Math.round(((session.index + 1) / questions.length) * 100) + '%';
    App.qs('#answeredCount').textContent = '已批改 ' + finished + ' 题';
    const back = App.qs('#backQuestions');
    if (back) back.setAttribute('href', questionsBackURL());
    updateTimer();
    renderAnswerSheet();
    renderContent();
    renderBottom();
  }

  function renderAnswerSheet() {
    const host = App.qs('#answerSheet');
    host.innerHTML = questions.map(function (q, i) {
      const result = session.results[q.id];
      const cls = i === session.index ? ' current' : '';
      const state = result ? (result.correct ? ' correct' : ' wrong') : '';
      return '<button class="sheet-cell' + cls + state + '" data-sheet="' + i + '" title="第 ' + (i + 1) + ' 题 · ' + (result ? (result.correct ? '正确' : '错误') : '未作答') + '">' + (i + 1) + '</button>';
    }).join('');
    App.qsa('[data-sheet]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        goTo(Number(btn.getAttribute('data-sheet')));
      });
    });
  }

  function renderContent() {
    const host = App.qs('#practiceContent');
    const q = questions[session.index];
    if (!q) return;
    const result = session.results[q.id];
    const isShort = q.type === 'short';
    const selected = session.answers[q.id] || (isShort ? '' : []);

    let html = '<div class="question-block">' +
      '<div class="q-top"><span class="q-no">第 ' + (session.index + 1) + ' 题</span>' + typeBadge(q.type) +
        '<span class="badge ' + (DIFF_CLASS[q.difficulty] || 'badge') + '">' + Data.DIFF_LABEL[q.difficulty] + '</span>' +
        (q.tags || []).slice(0, 2).map(t => '<span class="q-tag">' + App.escapeHTML(t) + '</span>').join('') +
      '</div>' +
      '<h2 class="question-stem">' + App.escapeHTML(q.stem) + '</h2>';

    if (isShort) {
      html += '<div class="short-answer">' +
        '<textarea class="textarea" id="shortInput" placeholder="请组织语言作答，AI 将从关键点覆盖度、逻辑表达等维度评分…" ' + (result || gradingQuestion === q.id ? 'disabled' : '') + '>' + App.escapeHTML(selected || '') + '</textarea>';
      if (gradingQuestion === q.id) {
        html += '<div class="ai-grading"><span class="ring-loader"></span><span>AI 正在批改你的答案，请稍候…</span></div>';
      } else if (!result) {
        html += '<div class="short-actions"><span class="small muted">答案提交后由 AI 评分，得分 ≥ 6 分视为通过</span>' +
          '<button class="btn btn-primary" id="submitShort">' + window.icon('sparkles', 15) + ' 提交答案</button></div>';
      } else {
        html += '<div class="short-actions"><span class="small muted">已提交，答案不可修改</span><span class="badge ' + (result.correct ? 'badge-green' : 'badge-red') + '">' + (result.correct ? '已通过' : '未通过') + '</span></div>';
      }
      html += '</div>';
    } else {
      html += '<div class="option-list">' + q.options.map(function (o) {
        let cls = '';
        let mark = '';
        if (result) {
          if (q.answer.indexOf(o.key) > -1) { cls = ' correct'; mark = '<span class="opt-mark">' + window.icon('checkCircle', 17) + '</span>'; }
          else if ((result.selected || []).indexOf(o.key) > -1) { cls = ' wrong'; mark = '<span class="opt-mark">' + window.icon('xCircle', 17) + '</span>'; }
        } else if ((selected || []).indexOf(o.key) > -1) {
          cls = ' selected';
          mark = '<span class="opt-mark" style="color:var(--brand-600)">' + window.icon('checkCircle', 17) + '</span>';
        }
        return '<button class="option' + cls + (result ? ' disabled' : '') + '" data-opt="' + o.key + '"' + (result ? ' disabled' : '') + '>' +
          '<span class="opt-key">' + o.key + '</span><span class="grow">' + App.escapeHTML(o.text) + '</span>' + mark +
        '</button>';
      }).join('') + '</div>';
      if (q.type === 'multiple' && !result) {
        html += '<div class="multi-hint"><span class="small muted">多选题，请选择所有正确选项后提交</span>' +
          '<button class="btn btn-primary btn-sm" id="submitMulti">提交答案</button></div>';
      }
    }
    html += '</div>';

    if (result) html += renderAnalysis(q, result);
    host.innerHTML = html;
    window.hydrateIcons(host);
    bindQuestionEvents(q, result);
  }

  function renderAnalysis(q, result) {
    if (q.type === 'short') {
      const score = Number(result.score) || 0;
      const points = result.keyPoints || [];
      return '<div class="score-card" id="analysisArea">' +
        '<div class="score-card-head">' +
          '<div class="score-big">' + score.toFixed(1) + '<small>/ 10</small></div>' +
          '<div class="grow"><div class="row gap-8"><b style="font-size:14px">AI 批改结果</b>' +
            '<span class="badge ' + (result.correct ? 'badge-green' : 'badge-red') + '">' + (result.correct ? '通过' : '未通过') + '</span>' +
          '</div><p class="small muted" style="margin-top:4px">得分 ≥ 6 分视为通过，未通过会自动进入错题本</p></div>' +
        '</div>' +
        '<div class="score-card-body">' +
          '<p>' + App.escapeHTML(result.feedback || '') + '</p>' +
          (points.length ? '<div class="score-points">' + points.map(function (p) {
            return '<span class="score-point" style="' + (p.hit ? '' : 'background:var(--surface-3);color:var(--muted)') + '">' +
              window.icon(p.hit ? 'check' : 'minus', 12) + App.escapeHTML(p.text) + '</span>';
          }).join('') + '</div>' : '') +
          '<div class="analysis-answer" style="margin-top:16px"><b>参考答案</b><span>' + App.escapeHTML(q.answerText || '') + '</span></div>' +
          '<div style="margin-top:12px"><b style="color:var(--ink)">解析</b><p style="margin-top:4px">' + App.escapeHTML(q.explanation) + '</p></div>' +
        '</div>' +
      '</div>';
    }
    const correctText = q.options.filter(o => q.answer.indexOf(o.key) > -1).map(o => o.key + '. ' + o.text).join('；');
    return '<div class="analysis-card" id="analysisArea">' +
      '<div class="analysis-head"><h4>答案解析</h4><span class="badge ' + (result.correct ? 'badge-green' : 'badge-red') + '">' +
        (result.correct ? '回答正确' : '回答错误') + '</span></div>' +
      '<div class="analysis-body">' +
        '<div class="analysis-answer"><b>正确答案</b><span>' + App.escapeHTML(correctText) + '</span></div>' +
        '<p>' + App.escapeHTML(q.explanation) + '</p>' +
      '</div>' +
    '</div>';
  }

  function bindQuestionEvents(q, result) {
    const host = App.qs('#practiceContent');
    if (q.type === 'short') {
      const ta = App.qs('#shortInput', host);
      if (ta && !result) {
        ta.addEventListener('input', function () {
          session.answers[q.id] = ta.value;
          App.debounce(function () { saveSession(); }, 300)();
        });
      }
      const submit = App.qs('#submitShort', host);
      if (submit) {
        submit.addEventListener('click', function () {
          const text = (App.qs('#shortInput', host).value || '').trim();
          if (!text) { App.toast('请先输入你的答案', 'warning'); return; }
          if (text.length < 10) { App.toast('答案太短了，再展开说说吧', 'warning'); return; }
          session.answers[q.id] = text;
          gradingQuestion = q.id;
          renderContent();
          setTimeout(function () {
            const res = gradeShortAnswer(q, text);
            session.results[q.id] = res;
            gradingQuestion = null;
            if (!res.correct) recordMistake(q, [text]);
            saveSession();
            renderAll();
            scrollToAnalysis();
          }, 1400);
        });
      }
      return;
    }

    App.qsa('[data-opt]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (result) return;
        const key = btn.getAttribute('data-opt');
        if (q.type === 'multiple') {
          const cur = (session.answers[q.id] || []).slice();
          const i = cur.indexOf(key);
          if (i > -1) cur.splice(i, 1); else cur.push(key);
          session.answers[q.id] = cur;
          saveSession();
          renderContent();
        } else {
          session.answers[q.id] = [key];
          gradeChoice(q, [key]);
        }
      });
    });

    const submitMulti = App.qs('#submitMulti', host);
    if (submitMulti) {
      submitMulti.addEventListener('click', function () {
        const selected = session.answers[q.id] || [];
        if (!selected.length) { App.toast('请至少选择一个选项', 'warning'); return; }
        gradeChoice(q, selected);
      });
    }
  }

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    const sa = a.slice().sort(), sb = b.slice().sort();
    return sa.every((v, i) => v === sb[i]);
  }

  function gradeChoice(q, selected) {
    const correct = arraysEqual(selected, q.answer);
    session.results[q.id] = { correct: correct, selected: selected.slice(), score: correct ? 10 : 0, passed: correct, feedback: '', keyPoints: [] };
    if (!correct) recordMistake(q, selected);
    saveSession();
    renderAll();
    scrollToAnalysis();
  }

  function gradeShortAnswer(q, text) {
    const keyPoints = q.keyPoints || [];
    const matched = keyPoints.filter(function (kp) {
      if (text.indexOf(kp) > -1) return true;
      const words = kp.replace(/[（）()、，,。；;]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
      return words.some(w => text.indexOf(w) > -1);
    });
    let score = 2.6 + matched.length * 1.35 + Math.min(1.8, text.length / 80) + Math.random() * 1.0;
    if (text.length < 16) score = Math.min(score, 3.6);
    score = Math.max(1, Math.min(9.8, Math.round(score * 10) / 10));
    const passed = score >= 6;
    const feedback = passed
      ? '回答覆盖了「' + (matched.slice(0, 2).join('、') || '核心要点') + '」等关键点，结构较完整、表达清晰。建议再补充一个真实项目中的具体案例，会更有说服力。'
      : '回答尚未完整覆盖关键要点，建议围绕「' + keyPoints.slice(0, 3).join('、') + '」展开，并补充具体的实现步骤或项目经验。';
    return {
      correct: passed,
      selected: [text],
      score: score,
      passed: passed,
      feedback: feedback,
      keyPoints: keyPoints.map(k => ({ text: k, hit: matched.indexOf(k) > -1 })),
      ai: true,
    };
  }

  function recordMistake(q, userAnswer) {
    const list = App.getMistakes();
    const now = new Date();
    const time = App.formatDateTime(now);
    const existing = list.find(x => x.questionId === q.id);
    if (existing) {
      existing.wrongCount = (existing.wrongCount || 0) + 1;
      existing.mastered = false;
      existing.corrected = 0;
      existing.lastWrong = time;
      existing.userAnswer = userAnswer;
    } else {
      list.unshift({
        questionId: q.id,
        wrongCount: 1,
        corrected: 0,
        mastered: false,
        lastWrong: time,
        userAnswer: userAnswer,
      });
    }
    App.saveMistakes(list);
  }

  function scrollToAnalysis() {
    setTimeout(function () {
      const el = App.qs('#analysisArea');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);
  }

  function renderBottom() {
    const prev = App.qs('#prevBtn');
    const next = App.qs('#nextBtn');
    const isLast = session.index === questions.length - 1;
    prev.disabled = session.index === 0;
    next.innerHTML = isLast
      ? '完成 <span data-icon="check" data-icon-size="15"></span>'
      : '下一题 <span data-icon="arrowRight" data-icon-size="15"></span>';
    window.hydrateIcons(next);
  }

  function goTo(index) {
    if (gradingQuestion) { App.toast('AI 正在批改，请稍候', 'info'); return; }
    session.index = Math.max(0, Math.min(questions.length - 1, index));
    saveSession();
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function next() {
    if (gradingQuestion) { App.toast('AI 正在批改，请稍候', 'info'); return; }
    const q = questions[session.index];
    if (q && q.type === 'short' && !session.results[q.id]) {
      App.toast('请先提交简答题答案，再进入下一题', 'warning');
      const ta = App.qs('#shortInput');
      if (ta) ta.focus();
      return;
    }
    if (session.index >= questions.length - 1) finishPractice();
    else goTo(session.index + 1);
  }

  function prev() {
    if (gradingQuestion) { App.toast('AI 正在批改，请稍候', 'info'); return; }
    goTo(session.index - 1);
  }

  function showAnalysisButton() {
    const q = questions[session.index];
    const result = session.results[q.id];
    if (!result) {
      App.toast(q.type === 'short' ? '请先提交答案，AI 批改后可查看解析' : '请先作答后查看解析', 'warning');
      return;
    }
    const el = App.qs('#analysisArea');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function finishPractice() {
    if (!session) return;
    const pendingShortIndex = questions.findIndex(q => q.type === 'short' && !session.results[q.id]);
    if (pendingShortIndex > -1) {
      App.toast('还有未提交的简答题，已为你跳转到该题', 'warning');
      goTo(pendingShortIndex);
      return;
    }
    const unfinished = questions.filter(q => !session.results[q.id]).length;
    const ok = await App.confirmDialog({
      title: '结束练习',
      message: unfinished
        ? '还有 <b style="color:var(--red-strong)">' + unfinished + '</b> 道题未完成，确认结束本次练习吗？'
        : '本次练习已全部完成，确认结束并返回题库吗？',
      list: unfinished ? ['未作答的题目不会被记录', '结束后本次练习进度将被清除'] : ['本次练习用时：' + formatHMS(session.elapsed), '答题结果已同步至错题本'],
      confirmText: '结束练习',
      danger: unfinished > 0,
      icon: 'alert',
    });
    if (!ok) return;
    if (timerId) clearInterval(timerId);
    App.clearPractice();
    session = null;
    location.href = questionsBackURL();
  }

  function openShortcuts() {
    App.openModal({
      title: '快捷键',
      desc: '熟练使用快捷键，练习更顺手',
      body:
        '<div class="shortcut-panel">' +
          '<div class="shortcut-row"><span>上一题</span><span class="kbd">←</span></div>' +
          '<div class="shortcut-row"><span>下一题</span><span class="kbd">→</span></div>' +
          '<div class="shortcut-row"><span>提交答案 / 下一题</span><span class="kbd">Enter</span></div>' +
          '<div class="shortcut-row"><span>显示快捷键面板</span><span class="kbd">?</span></div>' +
          '<div class="shortcut-row"><span>关闭弹窗</span><span class="kbd">Esc</span></div>' +
          '<div class="shortcut-row"><span>简答题换行</span><span class="kbd">Shift + Enter</span></div>' +
        '</div>',
      footer: '<button class="btn btn-primary" data-close-modal>我知道了</button>',
    });
  }

  function init() {
    const user = App.requireAuth();
    if (!user) return;

    const saved = App.getPractice();
    const params = new URLSearchParams(location.search);
    const qid = params.get('question');
    const stageId = params.get('stage');
    const resumeParam = params.get('resume');

    target = resolveTarget();
    if (!target) {
      App.toast('未找到对应的练习内容', 'error');
      setTimeout(function () { location.href = 'questions.html'; }, 800);
      return;
    }

    const back = App.qs('#backQuestions');
    if (back) back.setAttribute('href', questionsBackURL());

    // 事件绑定（先绑定，保证恢复进度后按钮仍可用）
    App.qs('#prevBtn').addEventListener('click', prev);
    App.qs('#nextBtn').addEventListener('click', next);
    App.qs('#analysisBtn').addEventListener('click', showAnalysisButton);
    App.qs('#shortcutBtn').addEventListener('click', openShortcuts);
    App.qs('#endPracticeBtn').addEventListener('click', finishPractice);

    document.addEventListener('keydown', function (e) {
      const tag = (e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      if (e.key === '?' && !typing) { e.preventDefault(); openShortcuts(); return; }
      if (typing || !session) return;
      if (App.qs('.modal-layer.open')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const q = questions[session.index];
        const result = session.results[q.id];
        if (q.type === 'short' && !result) {
          const submit = App.qs('#submitShort');
          if (submit) submit.click();
        } else if (q.type === 'multiple' && !result) {
          const submit = App.qs('#submitMulti');
          if (submit) submit.click();
        } else {
          next();
        }
      }
    });

    window.addEventListener('beforeunload', function () { if (session) saveSession(); });

    if (saved && (resumeParam === '1' || (!qid && !stageId) || (stageId && saved.stageId === stageId))) {
      showResumeModal(saved);
      return;
    }

    if (target.single) {
      startNew('single');
    } else {
      showModeModal();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
