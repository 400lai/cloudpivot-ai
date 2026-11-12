/* AI 模拟面试 · 进行中 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;

  const DIFF_LABEL = { easy: '简单', medium: '中等', hard: '困难' };
  const RECOGNITION = window.SpeechRecognition || window.webkitSpeechRecognition;

  let session = null;
  let timerId = null;
  let busy = false;
  let tick = 0;
  let voiceOn = true;
  let recording = false;
  let recognition = null;
  let completedPromptShown = false;

  function defaultConfig() {
    return { direction: 'agent', directionName: 'AI应用与智能体开发', difficulty: 'medium', count: 10, timeout: 300 };
  }

  function nowTime() {
    return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function saveSession() {
    if (session) {
      session.updatedAt = new Date().toISOString();
      App.setInterviewSession(session);
    }
  }

  function addMessage(role, text, extra) {
    session.messages.push(Object.assign({
      id: 'm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      role: role,
      text: text,
      time: nowTime(),
    }, extra || {}));
  }

  function scoreClass(score) {
    if (score == null) return '';
    if (score >= 8) return 'high';
    if (score >= 6) return 'mid';
    return 'low';
  }

  function avgScore() {
    if (!session || !session.scores.length) return null;
    return session.scores.reduce((a, b) => a + b, 0) / session.scores.length;
  }

  function initVoice() {
    voiceOn = App.storage.get('cp_voice_enabled', true);
    App.setSpeechEnabled(voiceOn);
    renderVoiceToggle();
  }

  function renderVoiceToggle() {
    const btn = App.qs('#voiceToggle');
    if (!btn) return;
    btn.classList.toggle('off', !voiceOn);
    btn.innerHTML = window.icon(voiceOn ? 'volume' : 'volumeOff', 14) + ' 语音播报' + (voiceOn ? '' : ' 已关');
  }

  function startNewSession(config) {
    const cfg = Object.assign({}, config);
    const questions = Data.helpers.buildInterviewQuestions(cfg.direction, cfg.difficulty, Number(cfg.count) || 10);
    questions.forEach(function (q) { q.score = null; });
    session = {
      config: cfg,
      questions: questions,
      messages: [],
      index: 0,
      answered: 0,
      scores: [],
      elapsed: 0,
      questionRemaining: cfg.timeout || 300,
      status: 'active',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    completedPromptShown = false;
    addMessage('ai',
      '你好，我是本次 AI 面试官。接下来我们会围绕「' + cfg.directionName + '」进行 ' + questions.length + ' 道题的面试，难度为「' + DIFF_LABEL[cfg.difficulty] + '」。每题请在 5 分钟内作答，回答时可以结合你的项目经验。准备好就开始吧。',
      { type: 'welcome' });
    addMessage('ai', questions[0].text, { type: 'question', questionNo: 1 });
    busy = false;
    saveSession();
    renderAll();
    startTimer();
    scrollBottom();
    setTimeout(function () {
      if (voiceOn) App.speak(questions[0].text);
    }, 500);
  }

  function normalizeSession(saved) {
    if (!saved || !Array.isArray(saved.questions) || !saved.questions.length || !Array.isArray(saved.messages)) return null;
    if (!saved.config) saved.config = defaultConfig();
    saved.index = Math.min(Math.max(0, Number(saved.index) || 0), saved.questions.length - 1);
    saved.answered = Number(saved.answered) || 0;
    saved.scores = Array.isArray(saved.scores) ? saved.scores : [];
    saved.elapsed = Number(saved.elapsed) || 0;
    saved.questionRemaining = Number(saved.questionRemaining);
    if (isNaN(saved.questionRemaining) || saved.questionRemaining <= 0) saved.questionRemaining = saved.config.timeout || 300;
    saved.status = saved.status || 'active';
    return saved;
  }

  function showResumeModal(saved) {
    let decided = false;
    App.openModal({
      title: '是否继续上次的面试？',
      desc: '我们保存了上次的对话、进度与得分',
      body:
        '<div class="callout brand" style="margin-bottom:16px">' + window.icon('info', 16) +
          '<span>继续面试可以从上次的题目接着作答；重新开始会清除上次进度。</span></div>' +
        '<div class="summary-list">' +
          '<div class="summary-row"><span>技术方向</span><b>' + App.escapeHTML(saved.config.directionName || 'AI应用与智能体开发') + '</b></div>' +
          '<div class="summary-row"><span>面试难度</span><b>' + (DIFF_LABEL[saved.config.difficulty] || '中等') + '</b></div>' +
          '<div class="summary-row"><span>已完成</span><b>' + (saved.answered || 0) + ' / ' + saved.questions.length + ' 题</b></div>' +
          '<div class="summary-row"><span>已用时间</span><b>' + App.formatClock(saved.elapsed) + '</b></div>' +
        '</div>',
      footer:
        '<button class="btn btn-outline" data-restart-int>重新开始</button>' +
        '<button class="btn btn-primary" data-continue-int>继续面试</button>',
      closeOnBackdrop: false,
      onMount: function (layer, close) {
        layer.querySelector('[data-continue-int]').addEventListener('click', function () {
          decided = true;
          close();
          session = normalizeSession(saved);
          if (!session) { startNewSession(defaultConfig()); return; }
          initVoice();
          renderAll();
          startTimer();
          scrollBottom();
          if (session.status === 'completed') promptReport();
        });
        layer.querySelector('[data-restart-int]').addEventListener('click', function () {
          decided = true;
          close();
          App.clearInterviewSession();
          startNewSession(saved.config || defaultConfig());
        });
      },
      onClose: function () {
        if (!decided) {
          session = normalizeSession(saved);
          if (session) {
            initVoice();
            renderAll();
            startTimer();
            scrollBottom();
          }
        }
      },
    });
  }

  function startTimer() {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(function () {
      if (!session) return;
      session.elapsed += 1;
      if (!busy && session.status === 'active') {
        session.questionRemaining = Math.max(0, session.questionRemaining - 1);
        if (session.questionRemaining <= 0) handleTimeout();
      }
      updateLiveTime();
      tick += 1;
      if (tick % 5 === 0) saveSession();
    }, 1000);
  }

  function updateLiveTime() {
    const total = App.formatClock(session.elapsed);
    const top = App.qs('#roomTimer');
    const left = App.qs('#elapsedLeft');
    if (top) top.textContent = total;
    if (left) left.textContent = total;
    const remain = App.qs('#questionRemaining');
    if (remain) {
      remain.textContent = App.formatClock(session.questionRemaining);
      remain.style.color = session.questionRemaining <= 60 ? 'var(--red-strong)' : '';
    }
  }

  function handleTimeout() {
    if (busy || !session || session.status !== 'active') return;
    if (App.qs('.modal-layer.open')) return;
    App.toast('本题作答超时，已自动提交', 'warning');
    session.questionRemaining = session.config.timeout || 300;
    const input = App.qs('#composerInput');
    const text = (input && input.value.trim()) || '（本题超时，未作答）';
    if (input) input.value = '';
    updateSendState();
    submitAnswer(text, true);
  }

  function renderAll() {
    if (!session) return;
    const cfg = session.config;
    const total = session.questions.length;
    App.qs('#roomDirection').textContent = cfg.directionName;
    App.qs('#roomDifficulty').textContent = DIFF_LABEL[cfg.difficulty] || '中等';
    App.qs('#difficultyLeft').textContent = DIFF_LABEL[cfg.difficulty] || '中等';
    App.qs('#bigTotal').textContent = total;
    App.qs('#questionListCount').textContent = total + ' 题';
    App.qs('#bigAnswered').textContent = session.answered;
    App.qs('#answeredBar').style.width = Math.round((session.answered / total) * 100) + '%';
    const avg = avgScore();
    App.qs('#avgScoreLeft').textContent = avg == null ? '—' : avg.toFixed(1) + ' / 10';
    updateLiveTime();
    const currentNo = session.status === 'completed' ? total : Math.min(session.answered + 1, total);
    App.qs('#roomProgress').textContent = currentNo + ' / ' + total;
    renderQuestionList();
    renderStats();
    renderChat();
    updateComposerState();
  }

  function renderQuestionList() {
    const host = App.qs('#questionList');
    host.innerHTML = session.questions.map(function (q, i) {
      const active = session.status === 'active' && i === session.index;
      const done = q.score != null;
      const sc = scoreClass(q.score);
      return '<button class="interview-q-item' + (active ? ' active' : '') + (done ? ' done' : '') + '" data-goto-q="' + q.no + '">' +
        '<span class="interview-q-no">' + (done ? '✓' : q.no) + '</span>' +
        '<span class="interview-q-text">' + App.escapeHTML(q.text) + '</span>' +
        '<span class="interview-q-score ' + sc + '">' + (done ? q.score.toFixed(1) : '—') + '</span>' +
      '</button>';
    }).join('');
    App.qsa('[data-goto-q]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const no = btn.getAttribute('data-goto-q');
        const target = App.qs('.msg[data-qno="' + no + '"]');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.querySelector('.msg-bubble').style.boxShadow = '0 0 0 3px var(--brand-100)';
          setTimeout(function () { const b = target.querySelector('.msg-bubble'); if (b) b.style.boxShadow = ''; }, 1600);
        }
      });
    });
  }

  function renderStats() {
    const avg = avgScore();
    App.qs('#roomStats').innerHTML =
      '<div class="room-stat-item"><b>' + session.answered + '</b><span>已回答</span></div>' +
      '<div class="room-stat-item"><b>' + session.questions.length + '</b><span>总题数</span></div>' +
      '<div class="room-stat-item"><b>' + (avg == null ? '—' : avg.toFixed(1)) + '</b><span>平均分</span></div>' +
      '<div class="room-stat-item"><b>' + App.formatClock(session.elapsed) + '</b><span>用时</span></div>';
  }

  function renderChat() {
    const host = App.qs('#chatInner');
    const user = App.getUser() || { name: '我' };
    let html = '<div class="chat-date">今天 · ' + App.escapeHTML(session.config.directionName) + ' · ' + (DIFF_LABEL[session.config.difficulty] || '中等') + '面试</div>';
    html += session.messages.map(function (m, i) {
      const isAi = m.role === 'ai';
      const avatar = isAi
        ? '<span class="msg-avatar ai">AI</span>'
        : '<span class="msg-avatar user">' + App.escapeHTML(App.initials(user.name)) + '</span>';
      const qno = m.questionNo ? '<span class="badge badge-brand" style="height:19px;font-size:9.5px">第 ' + m.questionNo + ' 题</span>' : '';
      const score = m.score != null
        ? '<span class="score-tag ' + scoreClass(m.score) + '">' + m.score.toFixed(1) + ' / 10</span>'
        : '';
      const replay = isAi
        ? '<div class="msg-actions"><button class="msg-action" data-replay="' + i + '">' + window.icon('volume', 12) + ' 重播</button></div>'
        : '';
      return '<div class="msg ' + m.role + '" data-qno="' + (m.questionNo || '') + '" id="msg-' + m.id + '">' +
        avatar +
        '<div class="msg-content">' +
          '<div class="msg-meta">' + qno + '<b>' + (isAi ? 'AI 面试官' : App.escapeHTML(user.name)) + '</b><span>' + m.time + '</span>' + score + '</div>' +
          '<div class="msg-bubble ' + m.role + '">' + App.escapeHTML(m.text).replace(/\n/g, '<br>') + '</div>' +
          replay +
        '</div>' +
      '</div>';
    }).join('');
    host.innerHTML = html;
    window.hydrateIcons(host);
    App.qsa('[data-replay]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const idx = Number(btn.getAttribute('data-replay'));
        const m = session.messages[idx];
        if (m) App.speak(m.text);
      });
    });
  }

  function scrollBottom() {
    const area = App.qs('#chatArea');
    if (area) area.scrollTop = area.scrollHeight;
  }

  function updateComposerState() {
    const input = App.qs('#composerInput');
    const send = App.qs('#sendBtn');
    const voice = App.qs('#voiceInputBtn');
    if (!input || !send) return;
    const completed = session && session.status === 'completed';
    input.disabled = busy || completed;
    send.disabled = busy || completed || !input.value.trim();
    if (voice) voice.disabled = busy || completed;
    input.placeholder = completed ? '面试已完成，请查看面试报告' : (busy ? 'AI 面试官正在分析你的回答…' : '输入你的回答，或使用语音作答…');
    const charCount = App.qs('#charCount');
    if (charCount) charCount.textContent = input.value.length + ' 字';
    input.style.height = 'auto';
    input.style.height = Math.min(150, Math.max(54, input.scrollHeight)) + 'px';
  }

  function updateSendState() { updateComposerState(); }

  function appendTempBanner(text) {
    const host = App.qs('#chatInner');
    const div = document.createElement('div');
    div.className = 'analysis-banner';
    div.id = 'analysisBanner';
    div.innerHTML = '<span class="dots"><span></span><span></span><span></span></span><span>' + App.escapeHTML(text) + '</span>';
    host.appendChild(div);
    scrollBottom();
    return div;
  }

  function appendTyping(text) {
    const host = App.qs('#chatInner');
    const div = document.createElement('div');
    div.className = 'msg ai';
    div.id = 'typingIndicator';
    div.innerHTML =
      '<span class="msg-avatar ai">AI</span>' +
      '<div class="msg-content"><div class="msg-meta"><b>AI 面试官</b><span>正在输入</span></div>' +
      '<div class="msg-bubble ai"><div class="typing"><i></i><i></i><i></i></div><span style="font-size:11px;color:var(--muted-2)">' + App.escapeHTML(text) + '</span></div></div>';
    host.appendChild(div);
    scrollBottom();
    return div;
  }

  function computeScore(text, q, difficulty) {
    const base = { easy: 6.2, medium: 5.3, hard: 4.6 }[difficulty] || 5.3;
    const keywords = ['项目', '设计', '实现', '优化', '数据', '模型', '方案', '评估', '流程', '权衡', '经验', '架构', '测试', '指标', '业务', '团队', '问题', '原因', '结果'];
    const hits = keywords.filter(k => text.indexOf(k) > -1).length;
    let score = base + Math.min(2.4, text.length / 80) + Math.min(1.4, hits * 0.16) + Math.random() * 1.1;
    if (text.length < 20) score = Math.min(score, 5.2);
    return Math.round(Math.max(2.5, Math.min(9.7, score)) * 10) / 10;
  }

  function feedbackText(score, q) {
    const tips = [
      '可以再补充一个具体的项目案例，并说明你在其中的角色与结果。',
      '建议按「结论 — 原因 — 案例」的结构组织回答，让逻辑更清晰。',
      '回答中可以加入关键指标或数据，增强说服力。',
      '可以补充你对方案取舍的思考，展示更完整的工程判断。',
    ];
    if (score >= 8) {
      return '回答结构清晰，能够结合实践展开，专业理解比较到位。' + tips[q.no % tips.length];
    }
    if (score >= 6) {
      return '回答方向正确，核心概念基本覆盖，但展开深度还可以加强。' + tips[q.no % tips.length];
    }
    return '回答较为简略，关键点覆盖不足。建议先给出结论，再补充实现细节与项目经验。' + tips[q.no % tips.length];
  }

  function submitAnswer(textOverride, isTimeout) {
    if (!session || busy || session.status !== 'active') return;
    const input = App.qs('#composerInput');
    const text = String(textOverride != null ? textOverride : (input ? input.value : '')).trim();
    if (!text) {
      if (!isTimeout) App.toast('请先输入你的回答', 'warning');
      return;
    }
    if (!isTimeout && text.length < 6) {
      App.toast('回答太短了，再展开说说吧', 'warning');
      return;
    }
    busy = true;
    if (input) input.value = '';
    updateComposerState();
    addMessage('user', text, { type: 'answer' });
    saveSession();
    renderChat();
    scrollBottom();

    const q = session.questions[session.index];
    const banner = appendTempBanner('AI 面试官正在分析你的回答…');
    setTimeout(function () {
      if (banner && banner.isConnected) banner.querySelector('span:last-child').textContent = '分析完成，正在评分…';
    }, 850);
    setTimeout(function () {
      if (banner && banner.isConnected) banner.remove();
      appendTyping('AI 面试官正在思考下一题…');
    }, 1700);
    setTimeout(function () {
      finalizeAnswer(q, text);
    }, 2500);
  }

  function finalizeAnswer(q, text) {
    const score = computeScore(text, q, session.config.difficulty);
    q.score = score;
    session.scores.push(score);
    session.answered += 1;
    addMessage('ai', feedbackText(score, q), { type: 'feedback', score: score, questionNo: q.no });
    let nextText = '';
    if (session.index < session.questions.length - 1) {
      session.index += 1;
      session.questionRemaining = session.config.timeout || 300;
      const nextQ = session.questions[session.index];
      addMessage('ai', nextQ.text, { type: 'question', questionNo: nextQ.no });
      nextText = nextQ.text;
    } else {
      session.status = 'completed';
      addMessage('ai', '今天的面试到这里就结束了。感谢你的认真作答，下面为你生成一份能力分析报告，帮助你更有针对性地补强。', { type: 'closing' });
    }
    busy = false;
    saveSession();
    renderAll();
    scrollBottom();
    if (voiceOn) {
      setTimeout(function () { App.speak(nextText || '面试结束，正在生成你的能力报告。'); }, 300);
    }
    if (session.status === 'completed') {
      setTimeout(promptReport, 800);
    }
  }

  function promptReport() {
    if (completedPromptShown || !session || session.status !== 'completed') return;
    completedPromptShown = true;
    App.confirmDialog({
      title: '面试已完成 🎉',
      message: '你已完成全部 ' + session.questions.length + ' 道题目，是否查看本次面试报告？',
      confirmText: '查看面试报告',
      cancelText: '稍后查看',
      icon: 'checkCircle',
      tone: 'brand',
    }).then(function (ok) {
      if (ok) generateReport();
    });
  }

  function generateReport() {
    if (!session) return;
    const total = session.questions.length;
    const scores = session.questions.map(q => Number(q.score) || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / total;
    const overall = Math.max(0, Math.min(100, Math.round(avg * 10)));
    const dimDefs = [
      { name: '专业知识', delta: 4, icon: 'book' },
      { name: '逻辑表达', delta: -2, icon: 'list' },
      { name: '项目经验', delta: -6, icon: 'briefcase' },
      { name: '问题解决', delta: 0, icon: 'target' },
      { name: '沟通表达', delta: 2, icon: 'message' },
      { name: '学习潜力', delta: 5, icon: 'trendingUp' },
    ];
    const dimensions = dimDefs.map(function (d, i) {
      const variation = (scores[i % scores.length] - avg) * 2.5;
      const score = Math.max(28, Math.min(98, Math.round(overall + d.delta + variation)));
      return { name: d.name, icon: d.icon, score: score };
    });
    const sortedDims = dimensions.slice().sort((a, b) => b.score - a.score);
    const strongMap = {
      '专业知识': '专业基础较扎实，能够准确使用方向内的核心概念回答问题。',
      '逻辑表达': '回答结构清晰，善于先给结论再展开论述。',
      '项目经验': '能够结合真实项目经历说明方案与结果，可信度较高。',
      '问题解决': '面对开放问题时，能主动拆解问题并给出可执行方案。',
      '沟通表达': '表达自然流畅，信息密度与节奏控制得当。',
      '学习潜力': '对新知识保持敏感，能够主动反思并规划后续学习。',
    };
    const midMap = {
      '专业知识': '对核心概念有基本理解，能够围绕问题给出方向性回答。',
      '逻辑表达': '能够把回答拆成几个要点，结构意识正在形成。',
      '项目经验': '能够提到项目背景，但还需要把方案与结果讲得更具体。',
      '问题解决': '面对开放问题时能尝试给出思路，方案权衡可以继续加强。',
      '沟通表达': '表达基本清楚，信息组织还可以更聚焦。',
      '学习潜力': '有主动学习的意识，建议把目标拆成更具体的行动计划。',
    };
    let strengths;
    if (overall >= 80) {
      strengths = sortedDims.slice(0, 2).map(d => strongMap[d.name] || d.name + '表现较好。');
      strengths.push('整体表现出较好的岗位匹配度，具备进入下一轮面试的潜力。');
    } else if (overall >= 60) {
      strengths = sortedDims.slice(0, 2).map(d => midMap[d.name] || d.name + '有一定基础。');
      strengths.push('能够围绕问题完整作答，具备继续提升的基础，按建议专项补强会有明显提升。');
    } else {
      strengths = [
        '能够尝试回答本次面试问题，并完整参与面试流程。',
        '在「' + sortedDims[0].name + '」维度相对其他维度表现更好，可作为后续补强的起点。',
        '本次报告已给出可执行的改进方向，建议先补齐核心概念与表达结构。',
      ];
    }

    const adviceMap = {
      '专业知识': { title: '专业知识深度不足', advice: '建议先梳理该方向的知识图谱，再针对薄弱阶段进行专项刷题，并把错题按主题归档复习。' },
      '逻辑表达': { title: '回答结构可以更清晰', advice: '尝试使用「结论 — 要点 — 案例」的三段式结构，每次回答控制在 1–2 分钟。' },
      '项目经验': { title: '缺少可展开的项目案例', advice: '准备 1–2 个可以讲深讲透的项目，按背景、目标、方案、结果、复盘五个部分整理。' },
      '问题解决': { title: '方案权衡体现不足', advice: '回答开放问题时，先澄清约束条件，再给出至少两个方案并说明取舍。' },
      '沟通表达': { title: '表达节奏需要优化', advice: '减少信息堆砌，先讲重点，再根据面试官的反应补充细节。' },
      '学习潜力': { title: '学习规划不够具体', advice: '把学习目标拆成周计划，并持续输出笔记与复盘，形成可验证的成长记录。' },
    };
    const improvements = sortedDims.slice(-3).reverse().map(function (d) {
      const item = adviceMap[d.name] || { title: d.name + '待提升', advice: '建议针对该维度安排专项训练。' };
      return { title: item.title, advice: item.advice };
    });
    const suggestions = [
      '针对本次得分最低的「' + sortedDims[sortedDims.length - 1].name + '」安排 2 个阶段的专项刷题，并在错题本中跟踪纠正进度。',
      '用 STAR 法则重写本次面试中的项目经历回答，压缩到 90 秒以内。',
      '一周内完成一次同方向的再次面试，对比两次报告的能力维度变化。',
    ];
    const result = {
      id: 'ir-' + Date.now(),
      historyId: 'ir-' + Date.now(),
      direction: session.config.direction,
      directionName: session.config.directionName,
      difficulty: session.config.difficulty,
      date: App.formatDateTime(new Date()),
      duration: session.elapsed,
      count: total,
      answered: session.answered,
      scores: scores,
      overall: overall,
      accuracy: overall,
      dimensions: dimensions,
      strengths: strengths,
      improvements: improvements,
      suggestions: suggestions,
      messages: session.messages,
      questions: session.questions,
    };
    App.setInterviewResult(result);
    App.addInterviewHistory({
      id: result.id,
      direction: result.direction,
      directionName: result.directionName,
      difficulty: result.difficulty,
      score: result.overall,
      date: result.date,
      duration: result.duration,
      count: result.count,
    });
    App.clearInterviewSession();
    if (timerId) clearInterval(timerId);
    location.href = 'interview-report.html?id=' + encodeURIComponent(result.id);
  }

  function bindEvents() {
    const input = App.qs('#composerInput');
    input.addEventListener('input', updateComposerState);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitAnswer();
      }
    });
    App.qs('#sendBtn').addEventListener('click', function () { submitAnswer(); });

    App.qs('#togglePanels').addEventListener('click', function () {
      const collapsed = document.body.classList.toggle('panels-collapsed');
      this.innerHTML = window.icon(collapsed ? 'grid' : 'maximize', 14) + (collapsed ? ' 展开面板' : ' 收起面板');
    });

    App.qs('#voiceToggle').addEventListener('click', function () {
      voiceOn = !voiceOn;
      App.storage.set('cp_voice_enabled', voiceOn);
      App.setSpeechEnabled(voiceOn);
      renderVoiceToggle();
      App.toast(voiceOn ? '已开启语音播报' : '已关闭语音播报', 'info');
    });

    App.qs('#replayLastBtn').addEventListener('click', function () {
      if (!session) return;
      const lastAi = session.messages.slice().reverse().find(m => m.role === 'ai');
      if (lastAi) App.speak(lastAi.text);
      else App.toast('暂无可以重播的内容', 'info');
    });

    App.qs('#voiceInputBtn').addEventListener('click', startVoiceInput);

    App.qs('#exitInterviewBtn').addEventListener('click', async function () {
      if (busy) { App.toast('AI 正在分析回答，请稍候', 'info'); return; }
      const ok = await App.confirmDialog({
        title: '退出面试',
        message: session && session.status === 'completed'
          ? '面试已完成，退出后可随时查看报告。确定退出吗？'
          : '当前面试进度会保存在本地，下次进入可选择继续。确定退出吗？',
        confirmText: '退出面试',
        icon: 'alert',
      });
      if (!ok) return;
      saveSession();
      if (timerId) clearInterval(timerId);
      location.href = 'ai-config.html';
    });

    App.qs('#endInterviewBtn').addEventListener('click', async function () {
      if (busy) { App.toast('AI 正在分析回答，请稍候', 'info'); return; }
      const ok = await App.confirmDialog({
        title: '结束面试',
        message: '确定结束本次面试并生成报告吗？未作答的题目将按 0 分计入成绩。',
        confirmText: '结束并生成报告',
        icon: 'checkCircle',
        tone: 'brand',
      });
      if (!ok) return;
      generateReport();
    });

    window.addEventListener('beforeunload', function () { if (session) saveSession(); });

    function updateNet() {
      const el = App.qs('#roomNet');
      if (!el) return;
      const online = navigator.onLine !== false;
      el.innerHTML = window.icon(online ? 'wifi' : 'wifiOff', 13) + (online ? ' 在线' : ' 离线');
      el.style.color = online ? 'var(--green-strong)' : 'var(--red-strong)';
    }
    window.addEventListener('online', updateNet);
    window.addEventListener('offline', updateNet);
    updateNet();
  }

  function simulateVoiceInput() {
    App.toast('当前浏览器不支持语音识别，已切换为模拟语音输入', 'info');
    recording = true;
    const btn = App.qs('#voiceInputBtn');
    btn.classList.add('recording');
    btn.innerHTML = window.icon('mic', 15) + ' 正在识别…';
    setTimeout(function () {
      const input = App.qs('#composerInput');
      input.value = (input.value ? input.value + ' ' : '') + '我认为可以从目标拆解、方案设计和效果评估三个方面来回答这个问题，并结合项目中的实际数据说明结果。';
      recording = false;
      btn.classList.remove('recording');
      btn.innerHTML = window.icon('mic', 15) + ' 语音输入';
      updateComposerState();
      input.focus();
      App.toast('模拟语音识别完成', 'success');
    }, 1500);
  }

  function startVoiceInput() {
    if (busy || !session || session.status === 'completed') return;
    if (recording) {
      if (recognition) { try { recognition.stop(); } catch (e) {} }
      return;
    }
    if (!RECOGNITION) { simulateVoiceInput(); return; }
    try {
      recognition = new RECOGNITION();
      recognition.lang = 'zh-CN';
      recognition.interimResults = true;
      recognition.continuous = false;
      let baseText = App.qs('#composerInput').value;
      recognition.onstart = function () {
        recording = true;
        const btn = App.qs('#voiceInputBtn');
        btn.classList.add('recording');
        btn.innerHTML = window.icon('mic', 15) + ' 正在聆听…';
      };
      recognition.onresult = function (event) {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
        App.qs('#composerInput').value = (baseText ? baseText + ' ' : '') + transcript;
        updateComposerState();
      };
      recognition.onerror = function () {
        App.toast('语音识别失败，已切换为模拟输入', 'warning');
        recording = false;
        const btn = App.qs('#voiceInputBtn');
        btn.classList.remove('recording');
        btn.innerHTML = window.icon('mic', 15) + ' 语音输入';
        simulateVoiceInput();
      };
      recognition.onend = function () {
        recording = false;
        const btn = App.qs('#voiceInputBtn');
        btn.classList.remove('recording');
        btn.innerHTML = window.icon('mic', 15) + ' 语音输入';
        updateComposerState();
      };
      recognition.start();
    } catch (e) {
      simulateVoiceInput();
    }
  }

  function init() {
    const user = App.requireAuth();
    if (!user) return;
    initVoice();
    bindEvents();
    const saved = App.getInterviewSession();
    if (saved) {
      const normalized = normalizeSession(saved);
      if (normalized) {
        showResumeModal(normalized);
        return;
      }
    }
    startNewSession(App.getInterviewConfig() || defaultConfig());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
