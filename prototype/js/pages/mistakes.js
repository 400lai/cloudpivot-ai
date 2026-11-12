/* 错题本 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;
  const H = Data.helpers;

  let list = App.getMistakes();
  const selected = new Set();
  const filters = { status: 'all', subject: 'all', time: 'all', sort: 'recent' };
  let redo = null;

  function enrich() {
    return list.map(function (m) {
      const q = H.getQuestion(m.questionId);
      if (!q) return null;
      const found = H.getStageById(q.stageId);
      return Object.assign({}, m, {
        question: q,
        subject: found ? found.subject : null,
        stage: found ? found.stage : null,
      });
    }).filter(Boolean);
  }

  function level(m) {
    if (m.wrongCount >= 3) return { label: '高频易错', cls: 'badge-red' };
    if (m.wrongCount === 2) return { label: '多次错误', cls: 'badge-amber' };
    return { label: '偶尔错误', cls: 'badge-outline' };
  }

  function answerText(q, keys) {
    if (!keys || !keys.length) return '未作答';
    if (q.type === 'short') return String(keys[0] || '');
    return keys.map(function (k) {
      const opt = (q.options || []).find(o => o.key === k);
      return opt ? k + '. ' + opt.text : k;
    }).join('；');
  }

  function correctText(q) {
    if (q.type === 'short') return q.answerText || '';
    return (q.options || []).filter(o => q.answer.indexOf(o.key) > -1).map(o => o.key + '. ' + o.text).join('；');
  }

  function daysAgo(str) {
    const d = new Date(String(str).replace(' ', 'T'));
    if (isNaN(d.getTime())) return Infinity;
    return (Date.now() - d.getTime()) / 86400000;
  }

  function filtered() {
    let arr = enrich();
    if (filters.status === 'pending') arr = arr.filter(m => !m.mastered);
    else if (filters.status === 'mastered') arr = arr.filter(m => m.mastered);
    if (filters.subject !== 'all') arr = arr.filter(m => m.subject && m.subject.id === filters.subject);
    if (filters.time !== 'all') {
      const days = Number(filters.time);
      arr = arr.filter(m => daysAgo(m.lastWrong) <= days);
    }
    if (filters.sort === 'wrong') arr.sort((a, b) => b.wrongCount - a.wrongCount || daysAgo(a.lastWrong) - daysAgo(b.lastWrong));
    else arr.sort((a, b) => daysAgo(a.lastWrong) - daysAgo(b.lastWrong));
    return arr;
  }

  function pendingList() {
    return enrich().filter(m => !m.mastered).sort((a, b) => b.wrongCount - a.wrongCount || daysAgo(a.lastWrong) - daysAgo(b.lastWrong));
  }

  function renderStats() {
    const all = enrich();
    const pending = all.filter(m => !m.mastered).length;
    const mastered = all.length - pending;
    const rate = all.length ? Math.round((mastered / all.length) * 100) : 0;
    const items = [
      { label: '错题总数', value: all.length, unit: '题', color: 'brand' },
      { label: '待复习', value: pending, unit: '题', color: 'amber' },
      { label: '已掌握', value: mastered, unit: '题', color: 'green' },
      { label: '掌握率', value: rate, unit: '%', color: 'purple' },
    ];
    App.qs('#mistakeStats').innerHTML = items.map(function (it) {
      return '<div class="mistake-stat"><div class="label">' + it.label + '</div><div class="value">' + it.value + '<span>' + it.unit + '</span></div></div>';
    }).join('');
  }

  function renderTop3() {
    const host = App.qs('#top3Grid');
    const section = App.qs('#top3Section');
    const top = pendingList().slice(0, 3);
    if (!top.length) {
      section.classList.add('hidden');
      return;
    }
    section.classList.remove('hidden');
    host.innerHTML = top.map(function (m, i) {
      return '<button class="top3-card" data-redo-one="' + m.questionId + '" style="text-align:left">' +
        '<span class="top3-rank">' + window.icon('alert', 11) + ' TOP ' + (i + 1) + ' · 错误 ' + m.wrongCount + ' 次</span>' +
        '<h4>' + App.escapeHTML(m.question.stem) + '</h4>' +
        '<div class="top3-meta"><span>' + (m.subject ? m.subject.name : '') + '</span><span>点击重做 ' + window.icon('arrowRight', 12) + '</span></div>' +
      '</button>';
    }).join('');
    App.qsa('[data-redo-one]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { startRedo([btn.getAttribute('data-redo-one')]); });
    });
    window.hydrateIcons(host);
  }

  function populateSubjects() {
    const sel = App.qs('#filterSubject');
    const seen = {};
    enrich().forEach(function (m) {
      if (m.subject && !seen[m.subject.id]) {
        seen[m.subject.id] = true;
        const opt = document.createElement('option');
        opt.value = m.subject.id;
        opt.textContent = m.subject.name;
        sel.appendChild(opt);
      }
    });
  }

  function renderList() {
    const host = App.qs('#mistakeList');
    const arr = filtered();
    App.qs('#filterCount').textContent = '共 ' + arr.length + ' 道错题';
    if (!arr.length) {
      host.innerHTML = '<div class="card"><div class="empty">' +
        '<div class="empty-art">' + window.icon('checkCircle', 30) + '</div>' +
        '<div class="empty-title">暂无错题</div>' +
        '<div class="empty-desc">继续保持！答错的题目会自动进入错题本，方便你集中复习。</div>' +
        '<a class="btn btn-primary" href="questions.html">去刷题</a></div></div>';
      return;
    }
    host.innerHTML = arr.map(function (m) {
      const q = m.question;
      const lv = level(m);
      const dots = [1, 2, 3].map(n => '<i class="' + (n <= m.corrected ? 'on' : '') + '"></i>').join('');
      return '<article class="mistake-card' + (m.mastered ? ' mastered' : '') + '">' +
        '<label class="checkbox mistake-check"><input type="checkbox" data-check="' + q.id + '"' + (selected.has(q.id) ? ' checked' : '') + '><span class="box"></span></label>' +
        '<div class="mistake-main">' +
          '<div class="row gap-8 wrap">' +
            '<span class="badge ' + lv.cls + '">' + lv.label + '</span>' +
            (m.mastered ? '<span class="badge badge-green">已掌握</span>' : '') +
            '<span class="badge badge-outline">' + (m.subject ? m.subject.name : '') + '</span>' +
            '<span class="q-tag">' + (m.stage ? m.stage.name : '') + '</span>' +
          '</div>' +
          '<h3 style="margin-top:9px">' + App.escapeHTML(q.stem) + '</h3>' +
          '<div class="mistake-meta">' +
            '<span class="progress-dots">' + dots + '</span>' +
            '<span>已纠正 ' + Math.min(3, m.corrected) + '/3 次</span>' +
            '<span class="dot-sep"></span><span>最近答错：' + App.escapeHTML(m.lastWrong) + '</span>' +
            '<span class="dot-sep"></span><span>错误 ' + m.wrongCount + ' 次</span>' +
          '</div>' +
          '<div class="mistake-answers">' +
            '<div class="mistake-answer wrong"><b>你的答案</b>' + App.escapeHTML(answerText(q, m.userAnswer)) + '</div>' +
            '<div class="mistake-answer right"><b>正确答案</b>' + App.escapeHTML(correctText(q)) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="mistake-side">' +
          '<span class="small muted">' + (q.type === 'short' ? '简答题' : Data.TYPE_LABEL[q.type]) + ' · ' + Data.DIFF_LABEL[q.difficulty] + '</span>' +
          '<div class="mistake-actions">' +
            '<button class="btn btn-sm btn-soft" data-redo="' + q.id + '">' + window.icon('refresh', 13) + ' 重新做题</button>' +
            (m.mastered ? '' : '<button class="btn btn-sm btn-outline" data-master="' + q.id + '">标记已掌握</button>') +
            '<button class="btn btn-sm btn-ghost danger" data-remove="' + q.id + '" title="移除错题">' + window.icon('trash', 14) + '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
    window.hydrateIcons(host);

    App.qsa('[data-check]', host).forEach(function (cb) {
      cb.addEventListener('change', function () {
        const id = cb.getAttribute('data-check');
        if (cb.checked) selected.add(id); else selected.delete(id);
        updateBatchBar();
      });
    });
    App.qsa('[data-redo]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { startRedo([btn.getAttribute('data-redo')]); });
    });
    App.qsa('[data-master]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { markMastered([btn.getAttribute('data-master')]); });
    });
    App.qsa('[data-remove]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { removeMistakes([btn.getAttribute('data-remove')]); });
    });
  }

  function updateBatchBar() {
    const bar = App.qs('#batchBar');
    App.qs('#batchCount').textContent = selected.size;
    bar.classList.toggle('show', selected.size > 0);
  }

  async function markMastered(ids, fromBatch) {
    const count = ids.length;
    const ok = await App.confirmDialog({
      title: fromBatch ? '批量标记已掌握' : '标记已掌握',
      message: '确认将选中的 ' + count + ' 道错题标记为已掌握吗？标记后将不再出现在待复习列表。',
      confirmText: '标记已掌握',
      icon: 'checkCircle',
      tone: 'brand',
    });
    if (!ok) return;
    list = App.getMistakes().map(function (m) {
      if (ids.indexOf(m.questionId) > -1) { m.mastered = true; m.corrected = 3; }
      return m;
    });
    App.saveMistakes(list);
    ids.forEach(id => selected.delete(id));
    renderAll();
    App.toast('已标记 ' + count + ' 道错题为已掌握', 'success');
  }

  async function removeMistakes(ids, fromBatch) {
    const count = ids.length;
    const ok = await App.confirmDialog({
      title: fromBatch ? '批量移除错题' : '移除错题',
      message: '确认移除选中的 ' + count + ' 道错题吗？移除后将不再出现在错题本中。',
      confirmText: '移除',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    list = App.getMistakes().filter(m => ids.indexOf(m.questionId) === -1);
    App.saveMistakes(list);
    ids.forEach(id => selected.delete(id));
    renderAll();
    App.toast('已移除 ' + count + ' 道错题', 'success');
  }

  function renderAll() {
    renderStats();
    renderTop3();
    renderList();
    updateBatchBar();
  }

  /* ---------------- 重做模式 ---------------- */
  function startRedo(ids) {
    const all = pendingList();
    let items = [];
    if (all.length) {
      items = (ids && ids.length)
        ? ids.map(id => H.getQuestion(id)).filter(Boolean)
        : all.map(m => m.question);
    }
    redo = { ids: items.map(q => q.id), index: 0, selected: [], submitted: false, results: {}, finished: false };
    App.qs('#redoShell').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderRedo();
  }

  function closeRedo() {
    App.qs('#redoShell').classList.add('hidden');
    App.qs('#redoShell').innerHTML = '';
    document.body.style.overflow = '';
    redo = null;
    list = App.getMistakes();
    renderAll();
  }

  function redoMistake(qid) {
    return App.getMistakes().find(m => m.questionId === qid);
  }

  function renderRedo() {
    const host = App.qs('#redoShell');
    if (!redo) return;
    if (!redo.ids.length) {
      host.innerHTML = '<div class="redo-top"><div class="row gap-10"><b>错题重做</b></div><button class="btn btn-outline btn-sm" data-redo-close>返回浏览</button></div>' +
        '<div class="redo-main"><div class="card"><div class="empty"><div class="empty-art">' + window.icon('checkCircle', 30) + '</div>' +
        '<div class="empty-title">没有待复习的错题</div><div class="empty-desc">你已完成当前所有错题的复习。</div>' +
        '<button class="btn btn-primary" data-redo-close>返回浏览</button></div></div></div>';
      bindRedoCommon(host);
      return;
    }
    const qid = redo.ids[redo.index];
    const q = H.getQuestion(qid);
    if (!q) { redo.index += 1; if (redo.index >= redo.ids.length) return closeRedo(); return renderRedo(); }
    const found = H.getStageById(q.stageId);
    const result = redo.results[qid];
    const m = redoMistake(qid) || { wrongCount: 1, corrected: 0, mastered: false };
    const isChoice = q.options && q.options.length > 0;
    const selected = redo.selected || [];
    const progressPct = Math.round(((redo.index + 1) / redo.ids.length) * 100);

    let body = '<div class="redo-head"><div class="row gap-8 wrap">' +
      '<span class="badge badge-brand">第 ' + (redo.index + 1) + ' / ' + redo.ids.length + ' 题</span>' +
      '<span class="badge badge-outline">' + (found ? found.subject.name : '') + '</span>' +
      '<span class="q-tag">' + (found ? found.stage.name : '') + '</span>' +
      (m.mastered ? '<span class="badge badge-green">已掌握</span>' : '') +
      '</div><span class="small muted">已纠正 ' + Math.min(3, m.corrected) + '/3 次</span></div>' +
      '<div class="card redo-question">' +
        '<div class="q-top" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">' +
          '<span class="badge ' + (q.type === 'short' ? 'badge-amber' : 'badge-blue') + '">' + Data.TYPE_LABEL[q.type] + '</span>' +
          '<span class="badge badge-outline">' + Data.DIFF_LABEL[q.difficulty] + '</span>' +
          '<span class="badge badge-red">历史错误 ' + m.wrongCount + ' 次</span>' +
        '</div>' +
        '<h2 class="question-stem" style="font-size:17px">' + App.escapeHTML(q.stem) + '</h2>';

    if (isChoice) {
      body += '<div class="option-list">' + q.options.map(function (o) {
        let cls = '';
        let mark = '';
        if (result) {
          if (q.answer.indexOf(o.key) > -1) { cls = ' correct'; mark = '<span class="opt-mark">' + window.icon('checkCircle', 16) + '</span>'; }
          else if ((result.selected || []).indexOf(o.key) > -1) { cls = ' wrong'; mark = '<span class="opt-mark">' + window.icon('xCircle', 16) + '</span>'; }
        } else if (selected.indexOf(o.key) > -1) {
          cls = ' selected';
          mark = '<span class="opt-mark" style="color:var(--brand-600)">' + window.icon('checkCircle', 16) + '</span>';
        }
        return '<button class="option' + cls + (result ? ' disabled' : '') + '" data-redo-opt="' + o.key + '"' + (result ? ' disabled' : '') + '>' +
          '<span class="opt-key">' + o.key + '</span><span class="grow">' + App.escapeHTML(o.text) + '</span>' + mark + '</button>';
      }).join('') + '</div>';
      if (!result) {
        body += '<div class="multi-hint"><span class="small muted">' + (q.type === 'multiple' ? '多选题，请选择所有正确选项' : '选择你的答案后提交') + '</span>' +
          '<button class="btn btn-primary btn-sm" data-redo-submit>提交答案</button></div>';
      }
    } else {
      body += '<div class="callout warn" style="margin-top:18px">' + window.icon('alertCircle', 16) +
        '<span>此题暂无可选的答题选项，请自行复习。正确答案见下方解析。</span></div>';
      body += '<div class="analysis-card" style="margin-top:14px"><div class="analysis-head"><h4>参考答案</h4><span class="badge badge-green">请自行核对</span></div>' +
        '<div class="analysis-body"><div class="analysis-answer" style="margin-bottom:10px"><b>答案</b><span>' + App.escapeHTML(correctText(q)) + '</span></div>' +
        '<p>' + App.escapeHTML(q.explanation) + '</p></div></div>';
    }

    if (result) {
      if (result.correct) {
        body += '<div class="result-banner correct">' + window.icon('checkCircle', 17) + '回答正确，已纠正次数 +1' +
          (m.mastered ? '，本题已掌握' : '') + '</div>';
      } else {
        body += '<div class="result-banner wrong">' + window.icon('xCircle', 17) + '回答错误，已纠正次数不变，看看解析再试一次</div>';
      }
      if (isChoice) {
        body += '<div class="analysis-card" style="margin-top:14px"><div class="analysis-head"><h4>答案解析</h4>' +
          '<span class="badge ' + (result.correct ? 'badge-green' : 'badge-red') + '">' + (result.correct ? '回答正确' : '回答错误') + '</span></div>' +
          '<div class="analysis-body"><div class="analysis-answer"><b>正确答案</b><span>' + App.escapeHTML(correctText(q)) + '</span></div>' +
          '<p>' + App.escapeHTML(q.explanation) + '</p></div></div>';
      }
    }

    body += '</div>' +
      '<div class="redo-nav">' +
        '<button class="btn btn-outline" data-redo-prev' + (redo.index === 0 ? ' disabled' : '') + '>' + window.icon('arrowLeft', 15) + ' 上一题</button>' +
        '<button class="btn btn-ghost" data-redo-close>退出练习</button>' +
        '<button class="btn btn-primary" data-redo-next>' + (redo.index === redo.ids.length - 1 ? '完成重做' : '下一题') + ' ' + window.icon('arrowRight', 15) + '</button>' +
      '</div>';

    host.innerHTML =
      '<div class="redo-top">' +
        '<div class="row gap-12"><b style="font-size:15px">错题重做</b><span class="badge badge-amber">连续答对 3 次自动掌握</span></div>' +
        '<div class="row gap-12"><span class="small muted">进度 ' + (redo.index + 1) + ' / ' + redo.ids.length + '</span><div class="progress"><span style="width:' + progressPct + '%"></span></div></div>' +
        '<button class="btn btn-outline btn-sm" data-redo-close>退出练习</button>' +
      '</div>' +
      '<div class="redo-main">' + body + '</div>';

    window.hydrateIcons(host);
    bindRedoEvents(host, q, result);
  }

  function bindRedoCommon(host) {
    App.qsa('[data-redo-close]', host).forEach(function (btn) {
      btn.addEventListener('click', async function () {
        if (redo && redo.results && Object.keys(redo.results).length) {
          const ok = await App.confirmDialog({
            title: '退出错题重做',
            message: '退出后，本次已纠正的次数会保留。确定要退出吗？',
            confirmText: '退出练习',
            cancelText: '继续练习',
            icon: 'alert',
          });
          if (!ok) return;
        }
        closeRedo();
      });
    });
  }

  function bindRedoEvents(host, q, result) {
    bindRedoCommon(host);
    if (q.options && q.options.length) {
      App.qsa('[data-redo-opt]', host).forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (result || !redo) return;
          const key = btn.getAttribute('data-redo-opt');
          if (q.type === 'multiple') {
            const i = redo.selected.indexOf(key);
            if (i > -1) redo.selected.splice(i, 1); else redo.selected.push(key);
          } else {
            redo.selected = [key];
          }
          renderRedo();
        });
      });
      const submit = App.qs('[data-redo-submit]', host);
      if (submit) {
        submit.addEventListener('click', function () {
          if (!redo.selected.length) { App.toast('请至少选择一个选项', 'warning'); return; }
          const selectedSorted = redo.selected.slice().sort().join(',');
          const answerSorted = q.answer.slice().sort().join(',');
          const isCorrect = selectedSorted === answerSorted;
          redo.results[q.id] = { correct: isCorrect, selected: redo.selected.slice() };
          const mistakes = App.getMistakes();
          const m = mistakes.find(x => x.questionId === q.id);
          if (isCorrect && m) {
            m.corrected = Math.min(3, (m.corrected || 0) + 1);
            if (m.corrected >= 3) m.mastered = true;
            App.saveMistakes(mistakes);
            list = App.getMistakes();
            App.toast(m.mastered ? '已连续答对 3 次，本题已标记为已掌握' : '回答正确，已纠正 ' + m.corrected + '/3 次', 'success');
          } else if (!isCorrect) {
            App.toast('回答错误，已纠正次数不变', 'warning');
          }
          renderRedo();
        });
      }
    }
    const prev = App.qs('[data-redo-prev]', host);
    if (prev) prev.addEventListener('click', function () {
      if (redo.index > 0) { redo.index -= 1; redo.selected = []; renderRedo(); }
    });
    const next = App.qs('[data-redo-next]', host);
    if (next) next.addEventListener('click', function () {
      if (redo.index < redo.ids.length - 1) {
        redo.index += 1;
        redo.selected = [];
        renderRedo();
      } else {
        App.toast('本轮错题重做完成', 'success');
        closeRedo();
      }
    });
  }

  function init() {
    const user = App.requireAuth();
    if (!user) return;
    populateSubjects();
    renderAll();

    App.qs('#filterStatus').addEventListener('change', function (e) { filters.status = e.target.value; renderList(); });
    App.qs('#filterSubject').addEventListener('change', function (e) { filters.subject = e.target.value; renderList(); });
    App.qs('#filterTime').addEventListener('change', function (e) { filters.time = e.target.value; renderList(); });
    App.qs('#filterSort').addEventListener('change', function (e) { filters.sort = e.target.value; renderList(); });

    App.qs('#startRedoBtn').addEventListener('click', function () { startRedo(); });

    App.qs('#batchMaster').addEventListener('click', function () {
      if (!selected.size) { App.toast('请先选择错题', 'warning'); return; }
      markMastered(Array.from(selected), true);
    });
    App.qs('#batchRemove').addEventListener('click', function () {
      if (!selected.size) { App.toast('请先选择错题', 'warning'); return; }
      removeMistakes(Array.from(selected), true);
    });
    App.qs('#batchCancel').addEventListener('click', function () {
      selected.clear();
      renderList();
      updateBatchBar();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
