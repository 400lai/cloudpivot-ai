/* 管理端 · 面试题库管理 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;
  const DIFF = Data.DIFF_LABEL;
  const DIFF_BADGE = { easy: 'badge-green', medium: 'badge-amber', hard: 'badge-red' };

  let page = 1;
  let pageSize = 10;
  const filters = { keyword: '', knowledge: 'all', topic: 'all', difficulty: 'all', uncategorized: false };

  function db() { return App.getDB(); }

  function isOffList(topic) {
    return !!topic && Data.TOPICS.indexOf(topic) === -1;
  }

  function knowledgeBases() {
    const set = new Set(Data.KNOWLEDGE_BASES);
    db().interviewBank.forEach(q => { if (q.knowledgeBase) set.add(q.knowledgeBase); });
    return Array.from(set);
  }

  function topicOptions() {
    const counts = {};
    db().interviewBank.forEach(q => {
      if (q.topic) counts[q.topic] = (counts[q.topic] || 0) + 1;
    });
    const list = Data.TOPICS.slice();
    Object.keys(counts).forEach(t => { if (list.indexOf(t) === -1) list.push(t); });
    return list.map(function (t) {
      return { topic: t, count: counts[t] || 0, off: isOffList(t) };
    });
  }

  function populateSelects() {
    const knowledge = App.qs('#iqKnowledge');
    const currentKnowledge = knowledge.value || 'all';
    knowledge.innerHTML = '<option value="all">全部知识库</option>' + knowledgeBases().map(k => '<option value="' + App.escapeHTML(k) + '">' + App.escapeHTML(k) + '</option>').join('');
    knowledge.value = Array.from(knowledge.options).some(o => o.value === currentKnowledge) ? currentKnowledge : 'all';
    const topic = App.qs('#iqTopic');
    const currentTopic = topic.value || 'all';
    topic.innerHTML = '<option value="all">全部主题</option>' + topicOptions().map(function (t) {
      return '<option value="' + App.escapeHTML(t.topic) + '">' + App.escapeHTML(t.topic) + '（' + t.count + '）' + (t.off ? ' · 词表外' : '') + '</option>';
    }).join('');
    topic.value = Array.from(topic.options).some(o => o.value === currentTopic) ? currentTopic : 'all';
  }

  function filtered() {
    return db().interviewBank.filter(function (q) {
      if (filters.keyword && q.question.toLowerCase().indexOf(filters.keyword) === -1) return false;
      if (filters.knowledge !== 'all' && q.knowledgeBase !== filters.knowledge) return false;
      if (filters.uncategorized) { if (q.topic) return false; }
      else if (filters.topic !== 'all' && q.topic !== filters.topic) return false;
      if (filters.difficulty !== 'all' && q.difficulty !== filters.difficulty) return false;
      return true;
    });
  }

  function sourceLabel(q) {
    if (q.sourceType === 'manual') return '手工录入';
    if (q.sourceType === 'markdown') return '手动导入';
    return '知识库文档解析';
  }

  function renderTable() {
    const all = filtered();
    const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
    page = Math.min(page, totalPages);
    const items = all.slice((page - 1) * pageSize, page * pageSize);
    const tbody = App.qs('#interviewQuestionTable');
    if (!items.length) {
      const uncategorized = filters.uncategorized;
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty"><div class="empty-art">' + window.icon(uncategorized ? 'checkCircle' : 'search', 28) + '</div>' +
        '<div class="empty-title">' + (uncategorized ? '没有未分类的题目' : '没有符合条件的题目') + '</div>' +
        '<div class="empty-desc">' + (uncategorized ? '题库里的题都标好主题了。' : '试试调整筛选条件或搜索关键词。') + '</div></div></td></tr>';
    } else {
      tbody.innerHTML = items.map(function (q) {
        const sourceBadge = q.sourceType === 'manual' ? '<span class="badge badge-amber">手工录入</span>' : q.sourceType === 'markdown' ? '<span class="badge badge-purple">手动导入</span>' : '';
        let sourceText = '';
        if (q.sourceType === 'manual') sourceText = '<b style="font-size:11px">' + App.escapeHTML(q.knowledgeBase) + '</b><div class="small muted">无源文档</div>';
        else if (q.sourceType === 'markdown') sourceText = '<b style="font-size:11px">Markdown 导入</b><div class="small muted">' + App.escapeHTML(q.docTitle || '') + '</div>';
        else sourceText = '<b style="font-size:11px">' + App.escapeHTML(q.knowledgeBase) + '</b><div class="small muted">' + App.escapeHTML(q.docTitle || '') + (q.number ? ' · 第 ' + q.number + ' 题' : '') + '</div>';
        const topicHTML = q.topic
          ? '<span class="badge badge-brand">' + App.escapeHTML(q.topic) + '</span>' + (isOffList(q.topic) ? '<span class="badge badge-amber" style="margin-left:4px" title="不在主题词表中">词表外</span>' : '')
          : '<span class="status-dot draft">未分类</span>';
        return '<tr>' +
          '<td><div class="cell-stem" style="max-width:520px">' + App.escapeHTML(q.question) + '</div>' +
            (sourceBadge ? '<div style="margin-top:5px">' + sourceBadge + '</div>' : '') + '</td>' +
          '<td>' + sourceText + '</td>' +
          '<td><span class="badge ' + (DIFF_BADGE[q.difficulty] || 'badge') + '">' + (DIFF[q.difficulty] || '—') + '</span></td>' +
          '<td>' + topicHTML + '</td>' +
          '<td><div class="row-actions">' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-iq-view="' + q.id + '" title="详情">' + window.icon('eye', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-iq-edit="' + q.id + '" title="编辑">' + window.icon('edit', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-iq-del="' + q.id + '" title="删除" style="color:var(--red-strong)">' + window.icon('trash', 14) + '</button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }
    window.hydrateIcons(tbody);
    bindRows(tbody);
    renderPagination(all.length, totalPages);
  }

  function bindRows(tbody) {
    App.qsa('[data-iq-view]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () { showDetail(btn.getAttribute('data-iq-view')); });
    });
    App.qsa('[data-iq-edit]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const q = db().interviewBank.find(x => x.id === btn.getAttribute('data-iq-edit'));
        if (q) openEditModal(q);
      });
    });
    App.qsa('[data-iq-del]', tbody).forEach(function (btn) {
      btn.addEventListener('click', function () { deleteItem(btn.getAttribute('data-iq-del')); });
    });
  }

  function renderPagination(total, totalPages) {
    const host = App.qs('#interviewQuestionPagination');
    if (!total) {
      host.innerHTML = '<span class="page-info">共 0 道题目</span><div class="page-size">每页 <select class="select" id="iqPageSize">' + sizeOptions() + '</select> 条</div>';
      bindPageSize();
      return;
    }
    let buttons = '<button class="page-btn" data-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>上一页</button>';
    for (let i = 1; i <= totalPages; i++) buttons += '<button class="page-btn' + (i === page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    buttons += '<button class="page-btn" data-page="' + (page + 1) + '"' + (page === totalPages ? ' disabled' : '') + '>下一页</button>';
    host.innerHTML = '<span class="page-info">共 ' + total + ' 道题目 · 第 ' + page + ' / ' + totalPages + ' 页</span>' +
      '<div class="page-size">每页 <select class="select" id="iqPageSize">' + sizeOptions() + '</select> 条</div>' +
      '<div class="page-btns">' + buttons + '</div>';
    App.qsa('[data-page]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        page = Number(btn.getAttribute('data-page'));
        renderTable();
      });
    });
    bindPageSize();
  }

  function sizeOptions() {
    return [10, 20, 50].map(n => '<option value="' + n + '"' + (n === pageSize ? ' selected' : '') + '>' + n + '</option>').join('');
  }

  function bindPageSize() {
    const sel = App.qs('#iqPageSize');
    if (!sel) return;
    sel.addEventListener('change', function () {
      pageSize = Number(sel.value) || 10;
      page = 1;
      renderTable();
    });
  }

  function readFilters() {
    filters.keyword = App.qs('#iqSearch').value.trim().toLowerCase();
    filters.knowledge = App.qs('#iqKnowledge').value;
    filters.uncategorized = App.qs('#iqUncategorized').checked;
    filters.topic = filters.uncategorized ? 'all' : App.qs('#iqTopic').value;
    filters.difficulty = App.qs('#iqDifficulty').value;
  }

  function query() {
    readFilters();
    page = 1;
    renderTable();
  }

  function resetFilters() {
    App.qs('#iqSearch').value = '';
    App.qs('#iqKnowledge').value = 'all';
    App.qs('#iqTopic').value = 'all';
    App.qs('#iqTopic').disabled = false;
    App.qs('#iqDifficulty').value = 'all';
    App.qs('#iqUncategorized').checked = false;
    filters.keyword = '';
    filters.knowledge = 'all';
    filters.topic = 'all';
    filters.difficulty = 'all';
    filters.uncategorized = false;
    page = 1;
    renderTable();
  }

  function topicSelectOptions(selected) {
    const opts = topicOptions();
    const extra = selected && (Data.TOPICS.indexOf(selected) === -1) && selected !== '';
    let html = '<option value=""' + (!selected ? ' selected' : '') + '>未分类</option>';
    opts.forEach(function (t) {
      html += '<option value="' + App.escapeHTML(t.topic) + '"' + (selected === t.topic ? ' selected' : '') + '>' + App.escapeHTML(t.topic) + (t.off ? ' · 词表外' : '') + '</option>';
    });
    return html;
  }

  function showDetail(id) {
    const q = db().interviewBank.find(x => x.id === id);
    if (!q) return;
    const source = q.sourceType === 'manual'
      ? '手工录入 · 无源文档'
      : q.sourceType === 'markdown'
        ? 'Markdown 导入 · ' + (q.docTitle || '')
        : q.knowledgeBase + ' · ' + (q.docTitle || '') + (q.number ? ' · 第 ' + q.number + ' 题' : '');
    const body =
      '<div class="row gap-8 wrap" style="margin-bottom:14px">' +
        '<span class="badge ' + (DIFF_BADGE[q.difficulty] || 'badge') + '">' + (DIFF[q.difficulty] || '—') + '</span>' +
        (q.topic ? '<span class="badge badge-brand">' + App.escapeHTML(q.topic) + '</span>' : '<span class="status-dot draft">未分类</span>') +
        (isOffList(q.topic) ? '<span class="badge badge-amber">词表外主题</span>' : '') +
        (q.tags || []).map(t => '<span class="q-tag">' + App.escapeHTML(t) + '</span>').join('') +
      '</div>' +
      '<div style="font-size:16px;line-height:1.75;font-weight:600">' + App.escapeHTML(q.question) + '</div>' +
      '<div class="detail-section-title">参考答案</div>' +
      '<div class="analysis-answer" style="line-height:1.75">' + App.escapeHTML(q.answer || ('围绕「' + (q.topic || '该主题') + '」说明你的理解，并结合项目经验给出具体案例与结果。')) + '</div>' +
      '<div class="detail-section-title">来源信息</div>' +
      '<div class="log-detail-grid">' +
        '<div class="log-detail-row"><span>来源类型</span><b>' + sourceLabel(q) + '</b></div>' +
        '<div class="log-detail-row"><span>来源</span><b>' + App.escapeHTML(source) + '</b></div>' +
        '<div class="log-detail-row"><span>录入时间</span><b>' + App.escapeHTML(q.createdAt || '—') + '</b></div>' +
        '<div class="log-detail-row"><span>题目 ID</span><b>' + App.escapeHTML(q.id) + '</b></div>' +
      '</div>' +
      '<div class="row gap-8" style="margin-top:20px"><button class="btn btn-soft btn-sm" data-detail-edit>编辑主题 / 难度</button>' +
      '<button class="btn btn-danger-soft btn-sm" data-detail-del>删除</button>' +
      '<button class="btn btn-ghost btn-sm" data-close-drawer style="margin-left:auto">关闭</button></div>';
    App.openDrawer({
      title: '面试题详情',
      desc: q.id,
      body: body,
      onMount: function (layer, close) {
        layer.querySelector('[data-close-drawer]').addEventListener('click', close);
        layer.querySelector('[data-detail-edit]').addEventListener('click', function () { close(); openEditModal(q); });
        layer.querySelector('[data-detail-del]').addEventListener('click', function () { close(); deleteItem(q.id); });
      },
    });
  }

  function openEditModal(q) {
    const body =
      '<div class="callout">' + window.icon('info', 16) + '<span>题干与参考答案只读，仅可维护主题与难度。主题词表来自系统配置。</span></div>' +
      '<div style="margin-top:16px;padding:13px;border-radius:10px;background:var(--surface-2);font-size:12.5px;line-height:1.7">' + App.escapeHTML(q.question) + '</div>' +
      '<div class="form-grid" style="margin-top:18px">' +
        '<div class="field"><label class="field-label">主题</label><select class="select" id="editTopic">' + topicSelectOptions(q.topic || '') + '</select><p class="field-hint">选择「未分类」可清空主题</p></div>' +
        '<div class="field"><label class="field-label">难度</label><select class="select" id="editDifficulty">' +
          ['easy', 'medium', 'hard'].map(d => '<option value="' + d + '"' + (q.difficulty === d ? ' selected' : '') + '>' + DIFF[d] + '</option>').join('') +
        '</select></div>' +
      '</div>';
    App.openModal({
      title: '编辑主题与难度',
      desc: sourceLabel(q),
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" data-save-iq>保存</button>',
      onMount: function (layer, close) {
        layer.querySelector('[data-save-iq]').addEventListener('click', function () {
          const database = db();
          const item = database.interviewBank.find(x => x.id === q.id);
          item.topic = layer.querySelector('#editTopic').value;
          item.difficulty = layer.querySelector('#editDifficulty').value;
          App.saveDB(database);
          App.addLog('编辑面试题', '面试题库管理', 'edit', '更新主题 / 难度：' + q.question.slice(0, 30));
          close();
          populateSelects();
          renderTable();
          App.toast('面试题已更新', 'success');
        });
      },
    });
  }

  function openAddModal() {
    const body =
      '<div class="form-grid">' +
        '<div class="field span-2"><label class="field-label">所属知识库 <span class="required">*</span></label><select class="select" id="newIqKnowledge"><option value="">请选择知识库</option>' +
          knowledgeBases().map(k => '<option value="' + App.escapeHTML(k) + '">' + App.escapeHTML(k) + '</option>').join('') + '</select><p class="field-error">请选择所属知识库</p></div>' +
        '<div class="field span-2"><label class="field-label">题干 <span class="required">*</span></label><textarea class="textarea" id="newIqQuestion" placeholder="请输入面试题题干"></textarea><p class="field-error">请输入题干</p></div>' +
        '<div class="field span-2"><label class="field-label">参考答案</label><textarea class="textarea" id="newIqAnswer" placeholder="可留空，后续补充"></textarea></div>' +
        '<div class="field"><label class="field-label">主题</label><select class="select" id="newIqTopic">' + topicSelectOptions('') + '</select></div>' +
        '<div class="field"><label class="field-label">难度</label><select class="select" id="newIqDifficulty"><option value="easy">简单</option><option value="medium" selected>中等</option><option value="hard">困难</option></select></div>' +
        '<div class="field span-2"><label class="field-label">标签</label><input class="input" id="newIqTags" placeholder="多个标签用逗号分隔"><p class="field-hint">标签用于检索与分类，可留空</p></div>' +
      '</div>';
    App.openModal({
      title: '录入面试题',
      desc: '手工录入的题目会在题干旁展示来源标识',
      size: 'wide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" data-save-new-iq>保存题目</button>',
      onMount: function (layer, close) {
        layer.querySelector('[data-save-new-iq]').addEventListener('click', function () {
          const knowledge = layer.querySelector('#newIqKnowledge');
          const question = layer.querySelector('#newIqQuestion');
          const okK = App.validateField(knowledge, !!knowledge.value, '请选择所属知识库');
          const okQ = App.validateField(question, question.value.trim().length > 0, '请输入题干');
          if (!okK || !okQ) return;
          const database = db();
          database.interviewBank.unshift({
            id: 'iq-' + Date.now(),
            question: question.value.trim(),
            answer: layer.querySelector('#newIqAnswer').value.trim(),
            sourceType: 'manual',
            knowledgeBase: knowledge.value,
            docTitle: '',
            number: 0,
            topic: layer.querySelector('#newIqTopic').value,
            difficulty: layer.querySelector('#newIqDifficulty').value,
            tags: layer.querySelector('#newIqTags').value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
            createdAt: App.formatDate(new Date()),
          });
          App.saveDB(database);
          App.addLog('录入面试题', '面试题库管理', 'create', '手工录入：' + question.value.trim().slice(0, 30));
          close();
          populateSelects();
          renderTable();
          App.toast('面试题已录入', 'success');
        });
      },
    });
  }

  function openImportModal() {
    const body =
      '<div class="callout brand">' + window.icon('info', 16) + '<span>按 <b>#</b> ~ <b>###</b> 标题切题，标题为题干、正文为参考答案。单次最多 500 道。</span></div>' +
      '<div class="form-grid" style="margin-top:16px">' +
        '<div class="field span-2"><label class="field-label">选择知识库 <span class="required">*</span></label><select class="select" id="importIqKnowledge"><option value="">请选择知识库</option>' +
          knowledgeBases().map(k => '<option value="' + App.escapeHTML(k) + '">' + App.escapeHTML(k) + '</option>').join('') + '</select><p class="field-error">请选择知识库</p></div>' +
      '</div>' +
      '<div class="upload-box" id="mdUploadBox" style="margin-top:14px">' +
        '<span class="icon-tile purple" style="width:44px;height:44px">' + window.icon('file', 20) + '</span>' +
        '<strong>点击选择 Markdown 文件，或拖拽到此处</strong><span class="small muted">仅支持 .md 文件</span>' +
      '</div>' +
      '<input type="file" id="mdFileInput" accept=".md" hidden>' +
      '<div id="mdPreview" style="margin-top:14px"></div>' +
      '<div class="form-grid" id="importBatchFields" style="margin-top:16px;display:none">' +
        '<div class="field"><label class="field-label">统一指定主题</label><select class="select" id="importIqTopic">' + topicSelectOptions('') + '</select></div>' +
        '<div class="field"><label class="field-label">统一指定难度</label><select class="select" id="importIqDifficulty"><option value="easy">简单</option><option value="medium" selected>中等</option><option value="hard">困难</option></select></div>' +
        '<div class="field span-2"><label class="field-label">统一指定标签</label><input class="input" id="importIqTags" placeholder="多个标签用逗号分隔"></div>' +
      '</div>';
    App.openModal({
      title: '手动导入面试题',
      desc: '先解析预览，再统一指定主题、难度与标签',
      size: 'xwide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" id="confirmIqImport" disabled>确认导入</button>',
      onMount: function (layer, close) {
        const input = layer.querySelector('#mdFileInput');
        const box = layer.querySelector('#mdUploadBox');
        let parsedFile = null;
        box.addEventListener('click', function () { input.click(); });
        box.addEventListener('dragover', function (e) { e.preventDefault(); box.classList.add('dragover'); });
        box.addEventListener('dragleave', function () { box.classList.remove('dragover'); });
        box.addEventListener('drop', function (e) {
          e.preventDefault(); box.classList.remove('dragover');
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        });
        input.addEventListener('change', function () { if (input.files[0]) handleFile(input.files[0]); });
        function handleFile(file) {
          if (!/\.md$/i.test(file.name)) { App.toast('请上传 .md 格式的 Markdown 文件', 'warning'); return; }
          parsedFile = file;
          layer.querySelector('#mdPreview').innerHTML =
            '<div class="import-preview"><div class="import-preview-head"><b>' + App.escapeHTML(file.name) + '</b><span class="small muted">' + (file.size / 1024).toFixed(1) + ' KB · 按标题切题</span></div>' +
              '<div class="table-wrap"><table class="data-table"><thead><tr><th style="width:60px">行号</th><th>题目（标题）</th><th>参考答案（正文摘要）</th></tr></thead><tbody>' +
                '<tr><td>1</td><td>RAG 与微调的区别是什么？</td><td>RAG 通过外部检索增强上下文，微调通过参数更新学习任务模式…</td></tr>' +
                '<tr><td>18</td><td>如何评估一个 Agent 系统的效果？</td><td>从任务完成率、工具调用准确性、平均轮次与人工接管率…</td></tr>' +
                '<tr><td>32</td><td>什么场景下优先选择 LoRA？</td><td>显存受限、需要多任务快速迭代、希望保留基座能力时…</td></tr>' +
              '</tbody></table></div></div>';
          layer.querySelector('#importBatchFields').style.display = 'grid';
          const btn = layer.querySelector('#confirmIqImport');
          btn.disabled = false;
          btn.textContent = '确认导入（3 道示例）';
        }
        layer.querySelector('#confirmIqImport').addEventListener('click', function () {
          const knowledge = layer.querySelector('#importIqKnowledge');
          if (!knowledge.value) { App.validateField(knowledge, false, '请选择知识库'); App.toast('请选择知识库', 'warning'); return; }
          if (!parsedFile) return;
          const database = db();
          const topic = layer.querySelector('#importIqTopic').value;
          const difficulty = layer.querySelector('#importIqDifficulty').value;
          const tags = layer.querySelector('#importIqTags').value.split(/[,，]/).map(s => s.trim()).filter(Boolean);
          const samples = [
            { q: 'RAG 与微调的区别是什么？', a: 'RAG 通过外部检索增强上下文，微调通过参数更新学习任务模式，两者适用于不同的知识更新频率与成本约束。' },
            { q: '如何评估一个 Agent 系统的效果？', a: '从任务完成率、工具调用准确性、平均轮次与人工接管率等维度综合评估。' },
            { q: '什么场景下优先选择 LoRA？', a: '显存受限、需要多任务快速迭代、希望保留基座能力时优先选择 LoRA。' },
          ];
          samples.forEach(function (s, i) {
            database.interviewBank.unshift({
              id: 'iq-' + Date.now() + '-' + i,
              question: s.q,
              answer: s.a,
              sourceType: 'markdown',
              knowledgeBase: knowledge.value,
              docTitle: parsedFile.name,
              number: 0,
              topic: topic,
              difficulty: difficulty,
              tags: tags,
              createdAt: App.formatDate(new Date()),
            });
          });
          App.saveDB(database);
          App.addLog('手动导入面试题', '面试题库管理', 'create', '从 ' + parsedFile.name + ' 导入 ' + samples.length + ' 道题目');
          close();
          populateSelects();
          renderTable();
          App.toast('成功导入 3 道面试题', 'success');
        });
      },
    });
  }

  async function deleteItem(id) {
    const database = db();
    const q = database.interviewBank.find(x => x.id === id);
    if (!q) return;
    let message;
    if (q.sourceType === 'manual') {
      message = '该题为手工录入，没有源文档，删除后不可恢复。确认删除吗？';
    } else if (q.sourceType === 'markdown') {
      message = '该题来自 Markdown 导入文件「' + (q.docTitle || '') + '」，删除后不可恢复。确认删除吗？';
    } else {
      message = '该题来自知识库文档「' + (q.docTitle || '') + '」' + (q.number ? ' 第 ' + q.number + ' 题' : '') + '，删除后源文档仍可重新解析。确认删除吗？';
    }
    const ok = await App.confirmDialog({
      title: '删除面试题',
      message: message,
      hint: '删除为逻辑删除，数据仍保留在系统中可恢复。',
      confirmText: '删除题目',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    database.interviewBank = database.interviewBank.filter(x => x.id !== id);
    App.saveDB(database);
    App.addLog('删除面试题', '面试题库管理', 'delete', '删除面试题：' + q.question.slice(0, 30));
    populateSelects();
    renderTable();
    App.toast('面试题已删除', 'success');
  }

  function init() {
    if (!App.getAdmin()) return;
    populateSelects();
    renderTable();

    App.qs('#iqTopic').addEventListener('change', function (e) {
      if (e.target.value !== 'all') {
        App.qs('#iqUncategorized').checked = false;
      }
    });
    App.qs('#iqUncategorized').addEventListener('change', function (e) {
      if (e.target.checked) {
        App.qs('#iqTopic').value = 'all';
        App.qs('#iqTopic').disabled = true;
      } else {
        App.qs('#iqTopic').disabled = false;
      }
    });
    App.qs('#iqQueryBtn').addEventListener('click', query);
    App.qs('#iqResetBtn').addEventListener('click', resetFilters);
    App.qs('#iqSearch').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); query(); } });
    App.qs('#importInterviewBtn').addEventListener('click', openImportModal);
    App.qs('#addInterviewBtn').addEventListener('click', openAddModal);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
