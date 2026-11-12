/* 管理端 · 题库管理 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;

  const PAGE_SIZE = 10;
  const STATUS = {
    online: { label: '已上架', cls: 'online' },
    offline: { label: '已下架', cls: 'offline' },
    pending: { label: '待审核', cls: 'pending' },
    draft: { label: '草稿', cls: 'draft' },
    rejected: { label: '已驳回', cls: 'rejected' },
  };
  const TYPE = Data.TYPE_LABEL;
  const DIFF = Data.DIFF_LABEL;
  const DIFF_BADGE = { easy: 'badge-green', medium: 'badge-amber', hard: 'badge-red' };
  const TYPE_BADGE = { single: 'badge-blue', multiple: 'badge-purple', boolean: 'badge-cyan', short: 'badge-amber' };

  let page = 1;
  let selected = new Set();
  const filters = { keyword: '', stage: 'all', type: 'all', difficulty: 'all', status: 'all' };

  function db() { return App.getDB(); }

  function stageInfo(stageId) {
    for (const s of db().subjects) {
      const st = (s.stages || []).find(x => x.id === stageId);
      if (st) return { subject: s, stage: st };
    }
    return { subject: null, stage: null };
  }

  function stageName(stageId) {
    const info = stageInfo(stageId);
    return info.stage ? info.stage.name : '未知阶段';
  }

  function statusBadge(status) {
    const s = STATUS[status] || STATUS.draft;
    return '<span class="status-dot ' + s.cls + '">' + s.label + '</span>';
  }

  function typeBadge(type) {
    return '<span class="badge ' + (TYPE_BADGE[type] || 'badge') + '">' + (TYPE[type] || type) + '</span>';
  }

  function renderStats() {
    const qs = db().questions;
    const counts = {
      total: qs.length,
      online: qs.filter(q => q.status === 'online').length,
      pending: qs.filter(q => q.status === 'pending').length,
      single: qs.filter(q => q.type === 'single').length,
      multiple: qs.filter(q => q.type === 'multiple').length,
      boolean: qs.filter(q => q.type === 'boolean').length,
      short: qs.filter(q => q.type === 'short').length,
    };
    const cards = [
      { label: '题目总数', value: counts.total, icon: 'book', tone: 'brand' },
      { label: '已上架', value: counts.online, icon: 'checkCircle', tone: 'green' },
      { label: '待审核', value: counts.pending, icon: 'clock', tone: 'amber' },
      { label: '单选题', value: counts.single, icon: 'dot', tone: 'blue' },
      { label: '多选题', value: counts.multiple, icon: 'layers', tone: 'purple' },
      { label: '判断题', value: counts.boolean, icon: 'check', tone: 'cyan' },
      { label: '简答题', value: counts.short, icon: 'edit', tone: 'red' },
    ];
    App.qs('#questionStats').innerHTML = cards.map(function (c) {
      return '<div class="admin-stat"><div class="s-label"><span>' + c.label + '</span><span class="icon-tile ' + c.tone + '">' + window.icon(c.icon, 15) + '</span></div>' +
        '<div class="s-value">' + c.value + '<small>道</small></div></div>';
    }).join('');
  }

  function populateStageFilter() {
    const sel = App.qs('#qStageFilter');
    const current = sel.value;
    sel.innerHTML = '<option value="all">全部阶段</option>' + db().subjects.map(function (s) {
      return '<optgroup label="' + App.escapeHTML(s.name) + '">' + (s.stages || []).map(function (st) {
        return '<option value="' + st.id + '">' + App.escapeHTML(st.name) + '（' + (st.questions || []).length + '）</option>';
      }).join('') + '</optgroup>';
    }).join('');
    sel.value = current || 'all';
  }

  function filtered() {
    return db().questions.filter(function (q) {
      if (filters.keyword) {
        const hay = (q.stem + ' ' + (q.tags || []).join(' ')).toLowerCase();
        if (hay.indexOf(filters.keyword) === -1) return false;
      }
      if (filters.stage !== 'all' && q.stageId !== filters.stage) return false;
      if (filters.type !== 'all' && q.type !== filters.type) return false;
      if (filters.difficulty !== 'all' && q.difficulty !== filters.difficulty) return false;
      if (filters.status !== 'all' && q.status !== filters.status) return false;
      return true;
    });
  }

  function rowActions(q) {
    let html = '';
    if (q.status === 'pending') {
      html += '<button class="btn btn-icon btn-sm btn-ghost" data-transition="online" data-id="' + q.id + '" title="通过审核" style="color:var(--green-strong)">' + window.icon('check', 14) + '</button>';
      html += '<button class="btn btn-icon btn-sm btn-ghost" data-transition="rejected" data-id="' + q.id + '" title="不通过" style="color:var(--red-strong)">' + window.icon('x', 14) + '</button>';
    } else if (q.status === 'rejected') {
      html += '<button class="btn btn-icon btn-sm btn-ghost" data-transition="pending" data-label="重新提交" data-id="' + q.id + '" title="重新提交">' + window.icon('refresh', 14) + '</button>';
    } else if (q.status === 'online') {
      html += '<button class="btn btn-icon btn-sm btn-ghost" data-transition="offline" data-label="下架" data-id="' + q.id + '" title="下架">' + window.icon('eyeOff', 14) + '</button>';
    } else if (q.status === 'offline') {
      html += '<button class="btn btn-icon btn-sm btn-ghost" data-transition="pending" data-label="重新上架" data-id="' + q.id + '" title="重新上架">' + window.icon('eye', 14) + '</button>';
    } else if (q.status === 'draft') {
      html += '<button class="btn btn-icon btn-sm btn-ghost" data-transition="pending" data-label="提交审核" data-id="' + q.id + '" title="提交审核">' + window.icon('upload', 14) + '</button>';
    }
    html += '<button class="btn btn-icon btn-sm btn-ghost" data-edit="' + q.id + '" title="编辑">' + window.icon('edit', 14) + '</button>';
    html += '<button class="btn btn-icon btn-sm btn-ghost" data-del="' + q.id + '" title="删除" style="color:var(--red-strong)">' + window.icon('trash', 14) + '</button>';
    return html;
  }

  function renderTable() {
    const all = filtered();
    const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    page = Math.min(page, totalPages);
    const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    App.qs('#qResultCount').textContent = '共 ' + all.length + ' 道题目';

    const tbody = App.qs('#questionTable');
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="9"><div class="empty"><div class="empty-art">' + window.icon('search', 28) + '</div>' +
        '<div class="empty-title">暂无匹配的题目</div><div class="empty-desc">试试调整筛选条件，或新增 / 导入题目。</div></div></td></tr>';
    } else {
      tbody.innerHTML = items.map(function (q) {
        return '<tr>' +
          '<td class="col-check"><label class="checkbox checkbox-cell"><input type="checkbox" data-check="' + q.id + '"' + (selected.has(q.id) ? ' checked' : '') + '><span class="box"></span></label></td>' +
          '<td><span class="cell-id">' + q.id + '</span></td>' +
          '<td><button class="btn-link cell-stem" data-view="' + q.id + '" style="text-align:left">' + App.escapeHTML(q.stem) + '</button></td>' +
          '<td><span class="small muted" style="white-space:nowrap">' + App.escapeHTML(stageName(q.stageId)) + '</span></td>' +
          '<td>' + typeBadge(q.type) + '</td>' +
          '<td><span class="badge ' + (DIFF_BADGE[q.difficulty] || 'badge') + '">' + (DIFF[q.difficulty] || '—') + '</span></td>' +
          '<td>' + statusBadge(q.status) + '</td>' +
          '<td><span class="small muted" style="white-space:nowrap">' + App.escapeHTML(q.createdAt || '—') + '</span></td>' +
          '<td><div class="row-actions">' + rowActions(q) + '</div></td>' +
        '</tr>';
      }).join('');
    }
    window.hydrateIcons(tbody);
    bindTable(tbody);
    renderPagination(all.length, totalPages, items);
    updateBatchBar();
    updatePageCheckbox(items);
  }

  function bindTable(tbody) {
    App.qsa('[data-check]', tbody).forEach(function (cb) {
      cb.addEventListener('change', function () {
        if (cb.checked) selected.add(cb.getAttribute('data-check'));
        else selected.delete(cb.getAttribute('data-check'));
        updateBatchBar();
        updatePageCheckbox();
      });
    });
    App.qsa('[data-view]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () { showDetail(btn.getAttribute('data-view')); });
    });
    App.qsa('[data-edit]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const q = db().questions.find(x => x.id === btn.getAttribute('data-edit'));
        if (q) openQuestionModal(q);
      });
    });
    App.qsa('[data-del]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () { deleteQuestion(btn.getAttribute('data-del')); });
    });
    App.qsa('[data-transition]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () {
        transitionQuestion(btn.getAttribute('data-id'), btn.getAttribute('data-transition'), btn.getAttribute('data-label'));
      });
    });
  }

  function updatePageCheckbox(items) {
    const master = App.qs('#selectPageQuestions');
    if (!master) return;
    if (items && !items.length) {
      master.checked = false;
      master.indeterminate = false;
      return;
    }
    const current = (items || filtered().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)).map(q => q.id);
    const checked = current.filter(id => selected.has(id)).length;
    master.checked = current.length > 0 && checked === current.length;
    master.indeterminate = checked > 0 && checked < current.length;
  }

  function updateBatchBar() {
    App.qs('#questionBatchCount').textContent = selected.size;
    App.qs('#questionBatchBar').classList.toggle('show', selected.size > 0);
  }

  function renderPagination(total, totalPages) {
    const host = App.qs('#questionPagination');
    if (!total) { host.innerHTML = '<span class="page-info">共 0 道题目</span>'; return; }
    let buttons = '<button class="page-btn" data-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>上一页</button>';
    for (let i = 1; i <= totalPages; i++) buttons += '<button class="page-btn' + (i === page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    buttons += '<button class="page-btn" data-page="' + (page + 1) + '"' + (page === totalPages ? ' disabled' : '') + '>下一页</button>';
    host.innerHTML = '<span class="page-info">共 ' + total + ' 道题目 · 第 ' + page + ' / ' + totalPages + ' 页</span><div class="page-btns">' + buttons + '</div>';
    App.qsa('[data-page]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        page = Number(btn.getAttribute('data-page'));
        renderTable();
      });
    });
  }

  function transitionLabel(status) {
    return {
      online: '通过审核并上架',
      rejected: '审核不通过',
      pending: '提交审核',
      offline: '下架题目',
    }[status] || '更新状态';
  }

  async function transitionQuestion(id, target, labelOverride) {
    const q = db().questions.find(x => x.id === id);
    if (!q) return;
    const label = labelOverride || transitionLabel(target);
    const ok = await App.confirmDialog({
      title: label,
      message: target === 'offline'
        ? '确认下架题目「' + q.stem.slice(0, 40) + '…」吗？下架后学员端将不可见。'
        : target === 'rejected'
          ? '确认将该题目标记为「已驳回」吗？学员端将不可见。'
          : target === 'online'
            ? '确认通过审核并上架该题目吗？上架后学员端即可查看。'
            : '确认提交该题目进入待审核状态吗？',
      confirmText: label,
      danger: target === 'offline' || target === 'rejected',
      icon: target === 'online' ? 'checkCircle' : 'alert',
    });
    if (!ok) return;
    q.status = target;
    App.saveDB(db());
    App.addLog(label, '题目 ' + q.id, 'edit', label + '：' + q.stem.slice(0, 40));
    renderStats();
    renderTable();
    App.toast('题目状态已更新为「' + STATUS[target].label + '」', 'success');
  }

  async function deleteQuestion(id) {
    const q = db().questions.find(x => x.id === id);
    if (!q) return;
    const ok = await App.confirmDialog({
      title: '删除题目',
      message: '确认删除题目「' + q.stem.slice(0, 40) + '…」吗？',
      hint: '删除为逻辑删除，数据仍保留在系统中可恢复。',
      confirmText: '删除题目',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    const database = db();
    database.questions = database.questions.filter(x => x.id !== id);
    App.saveDB(database);
    selected.delete(id);
    App.addLog('删除题目', '题目 ' + id, 'delete', '删除题目：' + q.stem.slice(0, 40));
    renderStats();
    renderTable();
    App.toast('题目已删除', 'success');
  }

  /* ---------------- 详情 ---------------- */
  function answerDisplay(q) {
    if (q.type === 'short') return q.answerText || (Array.isArray(q.answer) ? q.answer[0] : q.answer) || '—';
    return (q.options || []).filter(o => (q.answer || []).indexOf(o.key) > -1).map(o => o.key + '. ' + o.text).join('；') || '—';
  }

  function showDetail(id) {
    const q = db().questions.find(x => x.id === id);
    if (!q) return;
    const info = stageInfo(q.stageId);
    const body =
      '<div class="row gap-8 wrap" style="margin-bottom:14px">' +
        typeBadge(q.type) + '<span class="badge ' + (DIFF_BADGE[q.difficulty] || 'badge') + '">' + (DIFF[q.difficulty] || '—') + '</span>' +
        statusBadge(q.status) + (q.tags || []).map(t => '<span class="q-tag">' + App.escapeHTML(t) + '</span>').join('') +
      '</div>' +
      '<div style="font-size:16px;line-height:1.75;font-weight:600">' + App.escapeHTML(q.stem) + '</div>' +
      '<div class="detail-kv" style="margin-top:18px">' +
        '<div class="detail-kv-item"><span>所属学科</span><b>' + App.escapeHTML(info.subject ? info.subject.name : '—') + '</b></div>' +
        '<div class="detail-kv-item"><span>所属阶段</span><b>' + App.escapeHTML(info.stage ? info.stage.name : '—') + '</b></div>' +
        '<div class="detail-kv-item"><span>题目 ID</span><b>' + q.id + '</b></div>' +
        '<div class="detail-kv-item"><span>创建时间</span><b>' + App.escapeHTML(q.createdAt || '—') + '</b></div>' +
      '</div>' +
      (q.type !== 'short' ? '<div class="detail-section-title">选项</div><div class="option-list" style="margin-top:0">' +
        (q.options || []).map(function (o) {
          const right = (q.answer || []).indexOf(o.key) > -1;
          return '<div class="option disabled' + (right ? ' correct' : '') + '" style="padding:10px 12px"><span class="opt-key">' + o.key + '</span><span class="grow">' + App.escapeHTML(o.text) + '</span>' + (right ? '<span class="opt-mark">' + window.icon('checkCircle', 15) + '</span>' : '') + '</div>';
        }).join('') + '</div>' : '') +
      '<div class="detail-section-title">正确答案</div>' +
      '<div class="analysis-answer"><b>答案</b><span>' + App.escapeHTML(answerDisplay(q)) + '</span></div>' +
      '<div class="detail-section-title">解析</div><p class="small muted" style="line-height:1.8">' + App.escapeHTML(q.explanation || '暂无解析') + '</p>' +
      '<div class="detail-section-title">答题统计</div>' +
      '<div class="detail-stat-grid">' +
        '<div class="detail-stat"><b>' + App.compact(q.attempts || 0) + '</b><span>答题次数</span></div>' +
        '<div class="detail-stat"><b>' + Math.round((q.attempts || 0) * (q.correctRate || 0) / 100) + '</b><span>正确次数</span></div>' +
        '<div class="detail-stat"><b>' + (q.correctRate || 0) + '%</b><span>正确率</span></div>' +
      '</div>' +
      '<div class="row gap-8 wrap" style="margin-top:22px">' +
        (q.status === 'pending' ? '<button class="btn btn-success-soft btn-sm" data-detail-transition="online">通过审核</button><button class="btn btn-danger-soft btn-sm" data-detail-transition="rejected">不通过</button>' : '') +
        (q.status === 'online' ? '<button class="btn btn-outline btn-sm" data-detail-transition="offline">下架</button>' : '') +
        (q.status === 'offline' || q.status === 'rejected' || q.status === 'draft' ? '<button class="btn btn-outline btn-sm" data-detail-transition="pending" data-detail-label="' + (q.status === 'offline' ? '重新上架' : q.status === 'rejected' ? '重新提交' : '提交审核') + '">' + (q.status === 'offline' ? '重新上架' : q.status === 'rejected' ? '重新提交' : '提交审核') + '</button>' : '') +
        '<button class="btn btn-soft btn-sm" data-detail-edit>编辑</button>' +
        '<button class="btn btn-danger-soft btn-sm" data-detail-del>删除</button>' +
        '<button class="btn btn-ghost btn-sm" data-close-drawer style="margin-left:auto">关闭</button>' +
      '</div>';
    App.openDrawer({
      title: '题目详情',
      desc: q.id + ' · ' + (info.stage ? info.stage.name : ''),
      body: body,
      onMount: function (layer, close) {
        layer.querySelector('[data-close-drawer]').addEventListener('click', close);
        const trans = layer.querySelector('[data-detail-transition]');
        if (trans) trans.addEventListener('click', function () {
          close();
          transitionQuestion(q.id, trans.getAttribute('data-detail-transition'), trans.getAttribute('data-detail-label'));
        });
        const edit = layer.querySelector('[data-detail-edit]');
        if (edit) edit.addEventListener('click', function () { close(); openQuestionModal(q); });
        const del = layer.querySelector('[data-detail-del]');
        if (del) del.addEventListener('click', function () { close(); deleteQuestion(q.id); });
      },
    });
  }

  /* ---------------- 新增 / 编辑 ---------------- */
  function optionsDraft(q) {
    if (q && q.options && q.options.length) {
      return q.options.map(o => ({ text: o.text, correct: (q.answer || []).indexOf(o.key) > -1 }));
    }
    return [{ text: '', correct: true }, { text: '', correct: false }];
  }

  function dynamicHTML(type, q) {
    if (type === 'boolean') {
      const answer = q && q.answer && q.answer.length ? q.answer[0] : 'A';
      return '<div class="field"><label class="field-label">判断题正确答案 <span class="required">*</span></label>' +
        '<div class="row gap-24"><label class="radio"><input type="radio" name="boolAnswer" value="A"' + (answer === 'A' ? ' checked' : '') + '><span class="dot"></span><span>正确</span></label>' +
        '<label class="radio"><input type="radio" name="boolAnswer" value="B"' + (answer === 'B' ? ' checked' : '') + '><span class="dot"></span><span>错误</span></label></div></div>';
    }
    if (type === 'short') {
      const ref = q ? (q.answerText || (Array.isArray(q.answer) ? q.answer[0] : q.answer) || '') : '';
      return '<div class="field"><label class="field-label">参考答案 <span class="required">*</span></label>' +
        '<textarea class="textarea" id="shortRefAnswer" style="min-height:90px" placeholder="供学员查看的参考答案">' + App.escapeHTML(ref) + '</textarea><p class="field-error">请输入参考答案</p></div>';
    }
    const opts = optionsDraft(q);
    return '<div class="field"><label class="field-label">选项管理 <span class="required">*</span></label>' +
      '<div id="optionsList">' + opts.map(function (o, i) {
        return optionRowHTML(String.fromCharCode(65 + i), o.text, o.correct);
      }).join('') + '</div>' +
      '<div class="row gap-8" style="margin-top:8px"><button class="btn btn-outline btn-sm" type="button" id="addOptionBtn">' + window.icon('plus', 13) + ' 添加选项</button>' +
      '<span class="small muted">至少 2 个选项，且至少 1 个正确答案' + (type === 'single' ? '（单选只能有 1 个）' : '') + '</span></div></div>';
  }

  function optionRowHTML(key, text, correct) {
    return '<div class="option-row" data-option>' +
      '<span class="opt-key">' + key + '</span>' +
      '<input class="input" data-opt-text placeholder="选项内容" value="' + App.escapeHTML(text || '') + '">' +
      '<label class="checkbox"><input type="checkbox" data-opt-correct' + (correct ? ' checked' : '') + '><span class="box"></span><span>正确</span></label>' +
      '<button class="btn btn-icon btn-sm btn-ghost" type="button" data-remove-option title="删除选项">' + window.icon('trash', 13) + '</button>' +
    '</div>';
  }

  function bindOptions(layer, type) {
    function rekey() {
      App.qsa('[data-option]', layer).forEach(function (row, i) {
        const keyEl = row.querySelector('.opt-key');
        if (keyEl) keyEl.textContent = String.fromCharCode(65 + i);
      });
    }
    App.qsa('[data-opt-correct]', layer).forEach(function (cb) {
      cb.addEventListener('change', function () {
        if (type === 'single' && cb.checked) {
          App.qsa('[data-opt-correct]', layer).forEach(x => { if (x !== cb) x.checked = false; });
        }
      });
    });
    App.qsa('[data-remove-option]', layer).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const rows = App.qsa('[data-option]', layer);
        if (rows.length <= 2) { App.toast('至少需要保留 2 个选项', 'warning'); return; }
        btn.closest('[data-option]').remove();
        rekey();
      });
    });
    const add = layer.querySelector('#addOptionBtn');
    if (add) {
      add.addEventListener('click', function () {
        const list = layer.querySelector('#optionsList');
        const key = String.fromCharCode(65 + App.qsa('[data-option]', list).length);
        list.insertAdjacentHTML('beforeend', optionRowHTML(key, '', false));
        bindOptions(layer, type);
      });
    }
  }

  function openQuestionModal(q) {
    const isEdit = !!q;
    const type = q ? q.type : 'single';
    const body =
      '<div class="form-grid">' +
        '<div class="field span-2"><label class="field-label">题目内容 <span class="required">*</span></label>' +
          '<textarea class="textarea" id="questionStem" style="min-height:80px" placeholder="请输入题干">' + App.escapeHTML(q ? q.stem : '') + '</textarea><p class="field-error">请输入题目内容</p></div>' +
        '<div class="field"><label class="field-label">所属阶段 <span class="required">*</span></label>' +
          '<select class="select" id="questionStage"><option value="">请选择阶段</option>' + db().subjects.map(function (s) {
            return '<optgroup label="' + App.escapeHTML(s.name) + '">' + (s.stages || []).map(function (st) {
              return '<option value="' + st.id + '"' + (q && q.stageId === st.id ? ' selected' : '') + '>' + App.escapeHTML(st.name) + '</option>';
            }).join('') + '</optgroup>';
          }).join('') + '</select><p class="field-error">请选择所属阶段</p></div>' +
        '<div class="field"><label class="field-label">题目类型 <span class="required">*</span></label>' +
          '<select class="select" id="questionType">' +
            ['single', 'multiple', 'boolean', 'short'].map(t => '<option value="' + t + '"' + (type === t ? ' selected' : '') + '>' + TYPE[t] + '</option>').join('') +
          '</select></div>' +
        '<div class="field"><label class="field-label">难度 <span class="required">*</span></label>' +
          '<select class="select" id="questionDifficulty">' +
            ['easy', 'medium', 'hard'].map(d => '<option value="' + d + '"' + (q && q.difficulty === d ? ' selected' : (!q && d === 'medium' ? ' selected' : '')) + '>' + DIFF[d] + '</option>').join('') +
          '</select></div>' +
        '<div class="field"><label class="field-label">标签</label><input class="input" id="questionTags" placeholder="多个标签用逗号分隔" value="' + App.escapeHTML(q ? (q.tags || []).join(', ') : '') + '"></div>' +
        '<div class="field span-2" id="dynamicArea">' + dynamicHTML(type, q) + '</div>' +
        '<div class="field span-2"><label class="field-label">答案解析</label><textarea class="textarea" id="questionExplanation" placeholder="解析将展示给学员">' + App.escapeHTML(q ? (q.explanation || '') : '') + '</textarea></div>' +
        '<div class="field span-2"><div class="callout">' + window.icon('info', 16) + '<span>当前状态：<b>' + (q ? STATUS[q.status].label : '待审核') + '</b>（只读）。' +
          (isEdit ? '编辑不会改变题目状态。' : '新增题目提交后进入待审核，审核通过后上架。') + '</span></div></div>' +
      '</div>';
    App.openModal({
      title: isEdit ? '编辑题目' : '新增题目',
      desc: isEdit ? q.id : '新增题目提交后进入待审核',
      size: 'xwide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" data-save-question>' + (isEdit ? '保存修改' : '提交审核') + '</button>',
      onMount: function (layer, close) {
        const typeSelect = layer.querySelector('#questionType');
        bindOptions(layer, typeSelect.value);
        typeSelect.addEventListener('change', function () {
          const area = layer.querySelector('#dynamicArea');
          area.innerHTML = dynamicHTML(typeSelect.value, null);
          bindOptions(layer, typeSelect.value);
          window.hydrateIcons(area);
        });
        layer.querySelector('[data-save-question]').addEventListener('click', function () {
          const stem = layer.querySelector('#questionStem');
          const stage = layer.querySelector('#questionStage');
          const typeVal = typeSelect.value;
          const difficulty = layer.querySelector('#questionDifficulty').value;
          const tagsRaw = layer.querySelector('#questionTags').value;
          const explanation = layer.querySelector('#questionExplanation').value.trim();
          const okStem = App.validateField(stem, stem.value.trim().length > 0, '请输入题目内容');
          const okStage = App.validateField(stage, !!stage.value, '请选择所属阶段');
          if (!okStem || !okStage) return;

          let options = [];
          let answer = [];
          let answerText = '';
          if (typeVal === 'boolean') {
            const checked = layer.querySelector('input[name="boolAnswer"]:checked');
            answer = [checked ? checked.value : 'A'];
            options = [{ key: 'A', text: '正确' }, { key: 'B', text: '错误' }];
          } else if (typeVal === 'short') {
            const ref = layer.querySelector('#shortRefAnswer');
            if (!ref.value.trim()) { App.toast('请输入参考答案', 'warning'); ref.focus(); return; }
            answerText = ref.value.trim();
          } else {
            const rows = App.qsa('[data-option]', layer);
            if (rows.length < 2) { App.toast('至少需要 2 个选项', 'warning'); return; }
            const parsed = rows.map(function (row, i) {
              return {
                key: String.fromCharCode(65 + i),
                text: row.querySelector('[data-opt-text]').value.trim(),
                correct: row.querySelector('[data-opt-correct]').checked,
              };
            });
            if (parsed.some(o => !o.text)) { App.toast('选项内容不能为空', 'warning'); return; }
            const corrects = parsed.filter(o => o.correct);
            if (!corrects.length) { App.toast('请至少设置一个正确答案', 'warning'); return; }
            if (typeVal === 'single' && corrects.length > 1) { App.toast('单选题只能设置一个正确答案', 'warning'); return; }
            options = parsed.map(o => ({ key: o.key, text: o.text }));
            answer = corrects.map(o => o.key);
          }

          const info = stageInfo(stage.value);
          const database = db();
          const tags = tagsRaw.split(/[,，]/).map(s => s.trim()).filter(Boolean);
          if (isEdit) {
            const item = database.questions.find(x => x.id === q.id);
            item.stem = stem.value.trim();
            item.stageId = stage.value;
            item.subjectId = info.subject ? info.subject.id : item.subjectId;
            item.type = typeVal;
            item.difficulty = difficulty;
            item.tags = tags;
            item.explanation = explanation;
            item.options = options;
            item.answer = answer;
            item.answerText = answerText;
            App.toast('题目已更新', 'success');
          } else {
            let maxId = 1000;
            database.questions.forEach(function (x) {
              const m = String(x.id).match(/^Q(\d+)$/);
              if (m) maxId = Math.max(maxId, Number(m[1]));
            });
            database.questions.unshift({
              id: 'Q' + (maxId + 1),
              stem: stem.value.trim(),
              stageId: stage.value,
              subjectId: info.subject ? info.subject.id : '',
              type: typeVal,
              difficulty: difficulty,
              status: 'pending',
              createdAt: App.formatDateTime(new Date()),
              attempts: 0,
              correctRate: 0,
              options: options,
              answer: answer,
              answerText: answerText,
              explanation: explanation,
              tags: tags,
            });
            App.toast('题目已提交审核', 'success');
          }
          App.saveDB(database);
          App.addLog(isEdit ? '编辑题目' : '新增题目', '题库管理', 'edit', (isEdit ? '编辑' : '新增') + '题目：' + stem.value.trim().slice(0, 40));
          close();
          renderStats();
          populateStageFilter();
          renderTable();
        });
      },
    });
  }

  /* ---------------- 导入 / 导出 ---------------- */
  function csvEscape(value) {
    const s = String(value == null ? '' : value);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function downloadCSV(filename, rows) {
    const content = '﻿' + rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
    App.downloadFile(filename, content, 'text/csv;charset=utf-8');
  }

  function exportQuestions() {
    const list = filtered();
    const rows = [['ID', '题目', '阶段', '类型', '难度', '状态', '创建时间']];
    list.forEach(function (q) {
      rows.push([q.id, q.stem, stageName(q.stageId), TYPE[q.type] || q.type, DIFF[q.difficulty] || q.difficulty, STATUS[q.status] ? STATUS[q.status].label : q.status, q.createdAt]);
    });
    downloadCSV('题库导出_' + App.formatDate(new Date()) + '.csv', rows);
    App.toast('已导出 ' + list.length + ' 道题目为 CSV', 'success');
  }

  function importSampleQuestions() {
    const subject = db().subjects[0];
    const stage = subject && subject.stages && subject.stages[0];
    if (!stage) return [];
    return [
      {
        stem: '（导入示例）以下哪些属于 RAG 的核心环节？', type: 'multiple', difficulty: 'medium',
        options: [{ key: 'A', text: '文档切分与向量化' }, { key: 'B', text: '问题检索召回' }, { key: 'C', text: '上下文拼接与生成' }, { key: 'D', text: '与任务无关的闲聊' }],
        answer: ['A', 'B', 'C'], explanation: 'RAG 的核心流程包括文档切分、向量化、检索召回与上下文生成。',
      },
      {
        stem: '（导入示例）Temperature 参数越高，模型输出通常越随机。', type: 'boolean', difficulty: 'easy',
        options: [{ key: 'A', text: '正确' }, { key: 'B', text: '错误' }], answer: ['A'], explanation: '温度越高，采样越分散，输出更随机。',
      },
      {
        stem: '（导入示例）请简述 LoRA 微调的主要优点。', type: 'short', difficulty: 'medium',
        options: [], answer: [], answerText: '只训练少量低秩参数，降低显存与训练成本，便于多任务快速迭代。', explanation: 'LoRA 通过低秩分解实现参数高效微调。',
      },
    ].map(function (sample) {
      return Object.assign(sample, {
        stageId: stage.id, subjectId: subject.id, tags: ['导入示例'], createdAt: App.formatDateTime(new Date()),
      });
    });
  }

  function openImportModal() {
    const body =
      '<div class="callout brand">' + window.icon('info', 16) +
        '<span>支持 .xlsx / .xls，单次最多 500 道。表头：题目、阶段、类型、难度、选项A~D、正确答案、解析。</span></div>' +
      '<div class="upload-box" id="questionUploadBox" style="margin-top:16px">' +
        '<span class="icon-tile brand" style="width:44px;height:44px">' + window.icon('upload', 20) + '</span>' +
        '<strong>点击选择文件，或将 Excel 拖拽到此处</strong>' +
        '<span class="small muted">仅支持 .xlsx / .xls，单次最多 500 道</span>' +
      '</div>' +
      '<input type="file" id="questionFileInput" accept=".xlsx,.xls" hidden>' +
      '<div class="row-between" style="margin-top:12px"><span class="small muted" id="uploadFileInfo">尚未选择文件</span>' +
        '<button class="btn-link" id="downloadTemplate">下载导入模板</button></div>' +
      '<div id="questionImportPreview" style="margin-top:14px"></div>';
    App.openModal({
      title: '导入 Excel 题库',
      desc: '支持拖拽上传，导入后题目进入待审核',
      size: 'xwide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" id="confirmQuestionImport" disabled>确认导入</button>',
      onMount: function (layer, close) {
        const input = layer.querySelector('#questionFileInput');
        const box = layer.querySelector('#questionUploadBox');
        let samples = [];
        const choose = function () { input.click(); };
        box.addEventListener('click', choose);
        box.addEventListener('dragover', function (e) { e.preventDefault(); box.classList.add('dragover'); });
        box.addEventListener('dragleave', function () { box.classList.remove('dragover'); });
        box.addEventListener('drop', function (e) {
          e.preventDefault();
          box.classList.remove('dragover');
          if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        });
        input.addEventListener('change', function () { if (input.files[0]) handleFile(input.files[0]); });
        layer.querySelector('#downloadTemplate').addEventListener('click', function () {
          downloadCSV('题库导入模板.csv', [
            ['题目', '阶段', '类型', '难度', '选项A', '选项B', '选项C', '选项D', '正确答案', '解析'],
            ['示例：什么是 RAG？', '大模型基础', '单选题', '中等', '检索增强生成', '模型微调', '模型量化', '提示词压缩', 'A', 'RAG 是检索增强生成。'],
          ]);
          App.toast('模板已下载', 'success');
        });
        function handleFile(file) {
          if (!/\.(xlsx|xls)$/i.test(file.name)) { App.toast('请上传 .xlsx 或 .xls 文件', 'warning'); return; }
          layer.querySelector('#uploadFileInfo').textContent = file.name + ' · ' + (file.size / 1024).toFixed(1) + ' KB · 解析中…';
          setTimeout(function () {
            samples = importSampleQuestions();
            layer.querySelector('#uploadFileInfo').textContent = file.name + ' · ' + (file.size / 1024).toFixed(1) + ' KB · 已解析 ' + samples.length + ' 道';
            layer.querySelector('#questionImportPreview').innerHTML =
              '<div class="import-preview"><div class="import-preview-head"><b>解析预览</b><span class="small muted">已自动映射表头，导入后进入待审核</span></div>' +
                '<div class="table-wrap"><table class="data-table"><thead><tr><th>题目</th><th>阶段</th><th>类型</th><th>难度</th></tr></thead><tbody>' +
                samples.map(function (s) {
                  return '<tr><td><div class="cell-stem">' + App.escapeHTML(s.stem) + '</div></td><td>' + App.escapeHTML(stageName(s.stageId)) + '</td><td>' + (TYPE[s.type]) + '</td><td>' + (DIFF[s.difficulty]) + '</td></tr>';
                }).join('') + '</tbody></table></div></div>';
            const btn = layer.querySelector('#confirmQuestionImport');
            btn.disabled = false;
            btn.textContent = '确认导入（' + samples.length + ' 道）';
          }, 700);
        }
        layer.querySelector('#confirmQuestionImport').addEventListener('click', function () {
          if (!samples.length) return;
          const database = db();
          let maxId = 1000;
          database.questions.forEach(function (x) {
            const m = String(x.id).match(/^Q(\d+)$/);
            if (m) maxId = Math.max(maxId, Number(m[1]));
          });
          samples.forEach(function (s, i) {
            database.questions.unshift(Object.assign({}, s, {
              id: 'Q' + (maxId + 1 + i), status: 'pending', attempts: 0, correctRate: 0,
            }));
          });
          App.saveDB(database);
          App.addLog('导入题库', '题库管理', 'create', '从 Excel 导入 ' + samples.length + ' 道题目');
          close();
          renderStats();
          populateStageFilter();
          renderTable();
          App.toast('成功导入 ' + samples.length + ' 道题目，已进入待审核', 'success');
        });
      },
    });
  }

  /* ---------------- 批量 ---------------- */
  async function batchAction(action) {
    const ids = Array.from(selected);
    if (!ids.length) { App.toast('请先选择题目', 'warning'); return; }
    const labels = { online: '批量上架', offline: '批量下架', delete: '批量删除' };
    const ok = await App.confirmDialog({
      title: labels[action],
      message: action === 'delete'
        ? '确认删除选中的 ' + ids.length + ' 道题目吗？删除后不可在列表中查看。'
        : '确认将选中的 ' + ids.length + ' 道题目' + (action === 'online' ? '上架' : '下架') + '吗？',
      hint: action === 'delete' ? '删除为逻辑删除，数据仍保留在系统中可恢复。' : '',
      confirmText: labels[action],
      danger: action === 'delete',
      icon: action === 'delete' ? 'trash' : 'alert',
    });
    if (!ok) return;
    const database = db();
    if (action === 'delete') {
      database.questions = database.questions.filter(q => ids.indexOf(q.id) === -1);
    } else {
      database.questions.forEach(function (q) {
        if (ids.indexOf(q.id) > -1) q.status = action;
      });
    }
    App.saveDB(database);
    App.addLog(labels[action], '题库管理', action === 'delete' ? 'delete' : 'edit', labels[action] + ' ' + ids.length + ' 道题目');
    selected.clear();
    renderStats();
    renderTable();
    App.toast(labels[action] + '完成', 'success');
  }

  function init() {
    if (!App.getAdmin()) return;
    renderStats();
    populateStageFilter();
    renderTable();

    App.qs('#qSearch').addEventListener('input', App.debounce(function (e) {
      filters.keyword = e.target.value.trim().toLowerCase();
      page = 1;
      renderTable();
    }, 220));
    App.qs('#qStageFilter').addEventListener('change', function (e) { filters.stage = e.target.value; page = 1; renderTable(); });
    App.qs('#qTypeFilter').addEventListener('change', function (e) { filters.type = e.target.value; page = 1; renderTable(); });
    App.qs('#qDiffFilter').addEventListener('change', function (e) { filters.difficulty = e.target.value; page = 1; renderTable(); });
    App.qs('#qStatusFilter').addEventListener('change', function (e) { filters.status = e.target.value; page = 1; renderTable(); });

    App.qs('#selectPageQuestions').addEventListener('change', function (e) {
      const items = filtered().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      items.forEach(function (q) { if (e.target.checked) selected.add(q.id); else selected.delete(q.id); });
      renderTable();
    });
    App.qs('#clearQuestionSelection').addEventListener('click', function () {
      selected.clear();
      renderTable();
    });
    App.qsa('[data-batch]').forEach(function (btn) {
      btn.addEventListener('click', function () { batchAction(btn.getAttribute('data-batch')); });
    });

    App.qs('#addQuestionBtn').addEventListener('click', function () { openQuestionModal(null); });
    App.qs('#importQuestionsBtn').addEventListener('click', openImportModal);
    App.qs('#exportQuestionsBtn').addEventListener('click', exportQuestions);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
