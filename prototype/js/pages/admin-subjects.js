/* 管理端 · 学科管理 */
(function () {
  'use strict';
  const App = window.App;
  const COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#F97316'];

  function getDB() { return App.getDB(); }

  function stageQuestionCount(subject) {
    return (subject.stages || []).reduce((n, st) => n + ((st.questions || []).length), 0);
  }

  function renderStats(db) {
    const totalStages = db.subjects.reduce((n, s) => n + (s.stages || []).length, 0);
    const totalQuestions = db.subjects.reduce((n, s) => n + stageQuestionCount(s), 0);
    const withStages = db.subjects.filter(s => (s.stages || []).length > 0).length;
    const items = [
      { label: '总学科数', value: db.subjects.length, icon: 'layers', tone: 'brand' },
      { label: '有阶段的学科', value: withStages, icon: 'grid', tone: 'blue' },
      { label: '阶段总数', value: totalStages, icon: 'folderOpen', tone: 'purple' },
      { label: '题目总数', value: totalQuestions, icon: 'book', tone: 'green' },
    ];
    App.qs('#subjectStats').innerHTML = items.map(function (s) {
      return '<div class="admin-stat"><div class="s-label"><span>' + s.label + '</span><span class="icon-tile ' + s.tone + '">' + window.icon(s.icon, 16) + '</span></div>' +
        '<div class="s-value">' + s.value + '<small>' + (s.label === '题目总数' ? '道' : '个') + '</small></div></div>';
    }).join('');
  }

  function render() {
    const db = getDB();
    renderStats(db);
    const host = App.qs('#subjectGrid');
    if (!db.subjects.length) {
      host.innerHTML = '<div class="admin-card" style="grid-column:1/-1"><div class="empty"><div class="empty-art">' + window.icon('layers', 28) + '</div>' +
        '<div class="empty-title">暂无学科</div><div class="empty-desc">点击右上角「新增学科」创建第一个学科。</div></div></div>';
      return;
    }
    host.innerHTML = db.subjects.map(function (s, idx) {
      const courses = db.courses.filter(c => c.subjectId === s.id).length;
      const routes = db.roadmaps.filter(r => r.subjectId === s.id).length;
      const qCount = stageQuestionCount(s);
      return '<div class="subject-admin-card">' +
        '<div class="subject-admin-head">' +
          '<span class="s-icon" style="background:' + (s.tint || (s.color + '1A')) + '">' + s.icon + '</span>' +
          '<div class="grow"><h3>' + App.escapeHTML(s.name) + ' <span class="badge badge-outline" style="height:20px;font-size:10px">#' + (idx + 1) + '</span></h3>' +
            '<p>' + App.escapeHTML(s.desc || '暂无学科描述') + '</p></div>' +
          '<div class="subject-actions">' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-s-move="up" data-id="' + s.id + '" title="上移" ' + (idx === 0 ? 'disabled' : '') + '>' + window.icon('arrowUp', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-s-move="down" data-id="' + s.id + '" title="下移" ' + (idx === db.subjects.length - 1 ? 'disabled' : '') + '>' + window.icon('arrowDown', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-s-edit="' + s.id + '" title="编辑学科">' + window.icon('edit', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-s-del="' + s.id + '" title="删除学科" style="color:var(--red-strong)">' + window.icon('trash', 14) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="subject-admin-stats"><span>课程 <b>' + courses + '</b></span><span>路线 <b>' + routes + '</b></span><span>题目 <b>' + qCount + '</b></span><span>阶段 <b>' + (s.stages || []).length + '</b></span></div>' +
        '<div class="stage-admin-list">' +
          ((s.stages || []).length ? s.stages.map(function (st, si) {
            const enabled = st.enabled !== false;
            return '<div class="stage-admin-row' + (enabled ? '' : ' disabled') + '">' +
              '<span class="st-icon">' + (st.icon || '📘') + '</span>' +
              '<b>' + App.escapeHTML(st.name) + '</b><span class="st-meta">' + (st.questions || []).length + ' 题' + (enabled ? '' : ' · 已禁用') + '</span>' +
              '<div class="st-actions">' +
                '<button class="btn btn-icon btn-sm btn-ghost" data-st-move="up" data-sid="' + s.id + '" data-stid="' + st.id + '" title="上移" ' + (si === 0 ? 'disabled' : '') + '>' + window.icon('arrowUp', 12) + '</button>' +
                '<button class="btn btn-icon btn-sm btn-ghost" data-st-move="down" data-sid="' + s.id + '" data-stid="' + st.id + '" title="下移" ' + (si === s.stages.length - 1 ? 'disabled' : '') + '>' + window.icon('arrowDown', 12) + '</button>' +
                '<button class="btn btn-icon btn-sm btn-ghost" data-st-toggle="' + st.id + '" data-sid="' + s.id + '" title="' + (enabled ? '禁用阶段' : '启用阶段') + '">' + window.icon(enabled ? 'eye' : 'eyeOff', 12) + '</button>' +
                '<button class="btn btn-icon btn-sm btn-ghost" data-st-edit="' + st.id + '" data-sid="' + s.id + '" title="编辑阶段">' + window.icon('edit', 12) + '</button>' +
                '<button class="btn btn-icon btn-sm btn-ghost" data-st-del="' + st.id + '" data-sid="' + s.id + '" title="删除阶段" style="color:var(--red-strong)">' + window.icon('trash', 12) + '</button>' +
              '</div>' +
            '</div>';
          }).join('') : '<div class="small muted" style="padding:12px 8px">暂无阶段，点击下方按钮添加</div>') +
        '</div>' +
        '<button class="subject-add-stage" data-st-add="' + s.id + '">' + window.icon('plus', 13) + ' 添加阶段</button>' +
      '</div>';
    }).join('');
    window.hydrateIcons(host);
    bind(host);
  }

  function findSubject(db, id) { return db.subjects.find(s => s.id === id); }

  function bind(host) {
    const db = getDB();
    App.qsa('[data-s-move]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const subject = findSubject(db, btn.getAttribute('data-id'));
        const i = db.subjects.indexOf(subject);
        const dir = btn.getAttribute('data-s-move');
        const j = dir === 'up' ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= db.subjects.length) return;
        const tmp = db.subjects[i]; db.subjects[i] = db.subjects[j]; db.subjects[j] = tmp;
        App.saveDB(db); render();
      });
    });
    App.qsa('[data-s-edit]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const subject = findSubject(db, btn.getAttribute('data-s-edit'));
        if (subject) openSubjectModal(subject);
      });
    });
    App.qsa('[data-s-del]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { deleteSubject(btn.getAttribute('data-s-del')); });
    });
    App.qsa('[data-st-move]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const subject = findSubject(db, btn.getAttribute('data-sid'));
        if (!subject) return;
        const stage = subject.stages.find(x => x.id === btn.getAttribute('data-stid'));
        const i = subject.stages.indexOf(stage);
        const dir = btn.getAttribute('data-st-move');
        const j = dir === 'up' ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= subject.stages.length) return;
        const tmp = subject.stages[i]; subject.stages[i] = subject.stages[j]; subject.stages[j] = tmp;
        App.saveDB(db); render();
      });
    });
    App.qsa('[data-st-toggle]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const subject = findSubject(db, btn.getAttribute('data-sid'));
        if (!subject) return;
        const stage = subject.stages.find(x => x.id === btn.getAttribute('data-st-toggle'));
        if (!stage) return;
        stage.enabled = stage.enabled === false;
        App.saveDB(db); render();
        App.toast('阶段已' + (stage.enabled ? '启用' : '禁用'), 'success');
      });
    });
    App.qsa('[data-st-edit]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const subject = findSubject(db, btn.getAttribute('data-sid'));
        if (!subject) return;
        const stage = subject.stages.find(x => x.id === btn.getAttribute('data-st-edit'));
        if (stage) openStageModal(subject, stage);
      });
    });
    App.qsa('[data-st-del]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { deleteStage(btn.getAttribute('data-sid'), btn.getAttribute('data-st-del')); });
    });
    App.qsa('[data-st-add]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const subject = findSubject(db, btn.getAttribute('data-st-add'));
        if (subject) openStageModal(subject, null);
      });
    });
  }

  function colorSwatches(selected) {
    return '<div class="color-swatches" id="subjectColors">' + COLORS.map(function (c) {
      return '<button type="button" class="color-swatch' + (c === selected ? ' active' : '') + '" data-color="' + c + '" style="background:' + c + '" aria-label="主题色 ' + c + '"></button>';
    }).join('') + '</div><input type="hidden" id="subjectColor" value="' + selected + '">';
  }

  function openSubjectModal(subject) {
    const isEdit = !!subject;
    const selectedColor = subject ? subject.color || COLORS[0] : COLORS[0];
    const body =
      '<div class="form-grid">' +
        '<div class="field"><label class="field-label">学科名称 <span class="required">*</span></label>' +
          '<input class="input" id="subjectName" placeholder="例如：AI应用与智能体开发" value="' + App.escapeHTML(subject ? subject.name : '') + '"><p class="field-error">请输入学科名称</p></div>' +
        '<div class="field"><label class="field-label">学科图标（Emoji） <span class="required">*</span></label>' +
          '<input class="input" id="subjectIcon" placeholder="例如 🤖" maxlength="4" value="' + App.escapeHTML(subject ? subject.icon : '') + '"><p class="field-error">请输入一个 Emoji 图标</p></div>' +
        '<div class="field span-2"><label class="field-label">学科描述 <span class="required">*</span></label>' +
          '<textarea class="textarea" id="subjectDesc" placeholder="一句话说明该学科的学习内容与适合人群">' + App.escapeHTML(subject ? subject.desc : '') + '</textarea><p class="field-error">请输入学科描述</p></div>' +
        '<div class="field"><label class="field-label">排序号</label>' +
          '<input class="input" id="subjectSort" type="number" min="1" value="' + (subject ? (getDB().subjects.indexOf(subject) + 1) : (getDB().subjects.length + 1)) + '">' +
          '<p class="field-hint">数字越小越靠前</p></div>' +
        '<div class="field"><label class="field-label">主题颜色</label>' + colorSwatches(selectedColor) + '</div>' +
      '</div>';
    App.openModal({
      title: isEdit ? '编辑学科' : '新增学科',
      desc: isEdit ? '修改学科信息与排序' : '创建学科后，可以继续为其添加阶段与题目',
      size: 'wide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" data-save-subject>' + (isEdit ? '保存修改' : '创建学科') + '</button>',
      onMount: function (layer, close) {
        const colorInput = layer.querySelector('#subjectColor');
        App.qsa('[data-color]', layer).forEach(function (btn) {
          btn.addEventListener('click', function () {
            App.qsa('[data-color]', layer).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            colorInput.value = btn.getAttribute('data-color');
          });
        });
        layer.querySelector('[data-save-subject]').addEventListener('click', function () {
          const name = App.qs('#subjectName', layer);
          const icon = App.qs('#subjectIcon', layer);
          const desc = App.qs('#subjectDesc', layer);
          const sort = Number(App.qs('#subjectSort', layer).value) || 1;
          const okName = App.validateField(name, name.value.trim().length > 0, '请输入学科名称');
          const okIcon = App.validateField(icon, icon.value.trim().length > 0, '请输入一个 Emoji 图标');
          const okDesc = App.validateField(desc, desc.value.trim().length > 0, '请输入学科描述');
          if (!okName || !okIcon || !okDesc) return;
          const db = getDB();
          const color = colorInput.value || COLORS[0];
          if (isEdit) {
            const item = db.subjects.find(s => s.id === subject.id);
            item.name = name.value.trim();
            item.icon = icon.value.trim();
            item.desc = desc.value.trim();
            item.color = color;
            item.tint = color + '1A';
            const from = db.subjects.indexOf(item);
            db.subjects.splice(from, 1);
            const to = Math.max(0, Math.min(db.subjects.length, sort - 1));
            db.subjects.splice(to, 0, item);
            App.saveDB(db);
            App.toast('学科已更新', 'success');
          } else {
            const item = {
              id: 'subject-' + Date.now(),
              name: name.value.trim(), icon: icon.value.trim(), desc: desc.value.trim(),
              color: color, tint: color + '1A', short: name.value.trim(),
              stages: [], courseIds: [], quizCount: 0,
            };
            const to = Math.max(0, Math.min(db.subjects.length, sort - 1));
            db.subjects.splice(to, 0, item);
            App.saveDB(db);
            App.toast('学科已创建', 'success');
          }
          close();
          render();
        });
      },
    });
  }

  async function deleteSubject(id) {
    const db = getDB();
    const subject = findSubject(db, id);
    if (!subject) return;
    const stageCount = (subject.stages || []).length;
    const qCount = stageQuestionCount(subject);
    let message = '确认删除学科「' + subject.name + '」吗？';
    if (stageCount && qCount) message += '该学科下有 ' + stageCount + ' 个阶段、' + qCount + ' 道题目，删除后关联内容将一并移除。';
    else if (stageCount) message += '该学科下有 ' + stageCount + ' 个阶段，删除后阶段将一并移除。';
    else message += '该学科暂无阶段。';
    const ok = await App.confirmDialog({
      title: '删除学科',
      message: message,
      hint: '删除为逻辑删除，数据仍保留在系统中可恢复。',
      confirmText: '删除学科',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    db.subjects = db.subjects.filter(s => s.id !== id);
    App.saveDB(db);
    render();
    App.toast('学科已删除', 'success');
  }

  function openStageModal(subject, stage) {
    const isEdit = !!stage;
    const body =
      '<div class="form-grid">' +
        '<div class="field"><label class="field-label">阶段图标</label><input class="input" id="stageIcon" placeholder="留空默认 📘" maxlength="4" value="' + App.escapeHTML(stage ? stage.icon : '') + '"><p class="field-hint">可选，留空使用默认图标</p></div>' +
        '<div class="field"><label class="field-label">阶段名称 <span class="required">*</span></label><input class="input" id="stageName" placeholder="例如：大模型基础" value="' + App.escapeHTML(stage ? stage.name : '') + '"><p class="field-error">请输入阶段名称</p></div>' +
        '<div class="field"><label class="field-label">排序号</label><input class="input" id="stageSort" type="number" min="1" value="' + (stage ? (subject.stages.indexOf(stage) + 1) : (subject.stages.length + 1)) + '"><p class="field-hint">数字越小越靠前</p></div>' +
      '</div>' +
      '<div class="callout brand mt-16">' + window.icon('info', 16) + '<span>阶段用于组织题目，学员在题库中心按阶段查看与练习。</span></div>';
    App.openModal({
      title: isEdit ? '编辑阶段' : '添加阶段',
      desc: subject.name,
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" data-save-stage>' + (isEdit ? '保存修改' : '添加阶段') + '</button>',
      onMount: function (layer, close) {
        layer.querySelector('[data-save-stage]').addEventListener('click', function () {
          const name = App.qs('#stageName', layer);
          const icon = App.qs('#stageIcon', layer);
          const sort = Number(App.qs('#stageSort', layer).value) || 1;
          const okName = App.validateField(name, name.value.trim().length > 0, '请输入阶段名称');
          if (!okName) return;
          const db = getDB();
          const target = findSubject(db, subject.id);
          if (!target) return;
          if (isEdit) {
            const item = target.stages.find(s => s.id === stage.id);
            item.name = name.value.trim();
            item.icon = icon.value.trim() || '📘';
            const from = target.stages.indexOf(item);
            target.stages.splice(from, 1);
            const to = Math.max(0, Math.min(target.stages.length, sort - 1));
            target.stages.splice(to, 0, item);
            App.toast('阶段已更新', 'success');
          } else {
            const item = {
              id: 'stage-' + Date.now(),
              name: name.value.trim(),
              icon: icon.value.trim() || '📘',
              desc: '',
              questions: [],
              enabled: true,
            };
            const to = Math.max(0, Math.min(target.stages.length, sort - 1));
            target.stages.splice(to, 0, item);
            App.toast('阶段已添加', 'success');
          }
          App.saveDB(db);
          close();
          render();
        });
      },
    });
  }

  async function deleteStage(subjectId, stageId) {
    const db = getDB();
    const subject = findSubject(db, subjectId);
    if (!subject) return;
    const stage = subject.stages.find(s => s.id === stageId);
    if (!stage) return;
    const qCount = (stage.questions || []).length;
    const ok = await App.confirmDialog({
      title: '删除阶段',
      message: qCount
        ? '阶段「' + stage.name + '」下有 ' + qCount + ' 道题目，删除后题目将一并移除（逻辑删除）。确认删除吗？'
        : '确认删除阶段「' + stage.name + '」吗？该阶段暂无题目。',
      confirmText: '删除阶段',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    subject.stages = subject.stages.filter(s => s.id !== stageId);
    App.saveDB(db);
    render();
    App.toast('阶段已删除', 'success');
  }

  function init() {
    if (!App.getAdmin()) return;
    render();
    App.qs('#addSubjectBtn').addEventListener('click', function () { openSubjectModal(null); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
