/* 管理端 · B站课程库 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;
  const PAGE_SIZE = 8;
  const GRADIENTS = [
    ['#6366F1', '#8B5CF6'], ['#0EA5E9', '#6366F1'], ['#7C3AED', '#EC4899'],
    ['#F59E0B', '#EF4444'], ['#10B981', '#06B6D4'], ['#EC4899', '#8B5CF6'],
  ];
  let page = 1;
  const filters = { keyword: '', subject: 'all', source: 'all' };

  function db() { return App.getDB(); }

  function subjectName(id) {
    if (id === 'other') return '其他学科';
    const s = db().subjects.find(x => x.id === id) || Data.DIRECTION_META.find(x => x.id === id);
    return s ? s.name : '未分类';
  }

  function subjectOptions(selected) {
    return db().subjects.map(s => '<option value="' + s.id + '"' + (selected === s.id ? ' selected' : '') + '>' + App.escapeHTML(s.name) + '</option>').join('') +
      '<option value="other"' + (selected === 'other' ? ' selected' : '') + '>其他学科</option>';
  }

  function renderStats() {
    const courses = db().courses;
    const totalHours = courses.reduce((n, c) => n + (Number(c.duration) || 0), 0) / 60;
    const subjectIds = new Set(courses.filter(c => c.subjectId && c.subjectId !== 'other').map(c => c.subjectId));
    App.qs('#courseStats').innerHTML =
      '<div class="admin-stat"><div class="s-label"><span>课程总数</span><span class="icon-tile brand">' + window.icon('video', 16) + '</span></div><div class="s-value">' + courses.length + '<small>门</small></div><div class="s-foot">课程库独立维护，可被多条路线引用</div></div>' +
      '<div class="admin-stat"><div class="s-label"><span>总时长</span><span class="icon-tile blue">' + window.icon('clock', 16) + '</span></div><div class="s-value">' + totalHours.toFixed(1) + '<small>小时</small></div><div class="s-foot">按课程时长累计</div></div>' +
      '<div class="admin-stat"><div class="s-label"><span>关联学科数</span><span class="icon-tile green">' + window.icon('layers', 16) + '</span></div><div class="s-value">' + subjectIds.size + '<small>个</small></div><div class="s-foot">「其他学科」不计入</div></div>' +
      '<div class="admin-stat"><div class="s-label"><span>B站课程</span><span class="icon-tile purple">' + window.icon('play', 16) + '</span></div><div class="s-value">' + courses.filter(c => c.source === 'B站').length + '<small>门</small></div><div class="s-foot">其余来源标记为「其他」</div></div>';
  }

  function renderSubjectFilter() {
    const sel = App.qs('#courseSubjectFilter');
    const current = sel.value || 'all';
    sel.innerHTML = '<option value="all">全部学科</option>' + subjectOptions('');
    sel.value = current;
  }

  function filtered() {
    return db().courses.filter(function (c) {
      if (filters.keyword) {
        const hay = (c.title + ' ' + (c.bvid || '')).toLowerCase();
        if (hay.indexOf(filters.keyword) === -1) return false;
      }
      if (filters.subject !== 'all' && c.subjectId !== filters.subject) return false;
      if (filters.source !== 'all' && c.source !== filters.source) return false;
      return true;
    });
  }

  function coverHTML(c) {
    const cover = Data.helpers.courseCover(c);
    return '<span class="course-thumb" style="background-image:url(\'' + App.escapeHTML(cover) + '\');background-size:cover;background-position:center"></span>';
  }

  function renderTable() {
    const all = filtered();
    const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    page = Math.min(page, totalPages);
    const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    App.qs('#courseCount').textContent = '共 ' + all.length + ' 门课程';
    const tbody = App.qs('#courseTable');
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty"><div class="empty-art">' + window.icon('video', 28) + '</div>' +
        '<div class="empty-title">暂无匹配的课程</div><div class="empty-desc">试试调整筛选条件，或新增 / 导入课程。</div></div></td></tr>';
    } else {
      tbody.innerHTML = items.map(function (c, i) {
        const globalIndex = (page - 1) * PAGE_SIZE + i + 1;
        return '<tr>' +
          '<td><span class="cell-id">' + globalIndex + '</span></td>' +
          '<td>' + coverHTML(c) + '</td>' +
          '<td><div class="course-title-cell"><div><b>' + App.escapeHTML(c.title) + '</b>' +
            '<span>' + (c.bvid ? c.bvid : (c.link || '暂无课程链接')) + '</span></div></div></td>' +
          '<td><span class="duration-cell">' + App.formatMinutes(c.duration) + '</span></td>' +
          '<td><span class="badge ' + (c.subjectId === 'other' ? 'badge-outline' : 'badge-brand') + '">' + App.escapeHTML(subjectName(c.subjectId)) + '</span></td>' +
          '<td><span class="badge ' + (c.source === 'B站' ? 'badge-blue' : 'badge') + '">' + App.escapeHTML(c.source || '其他') + '</span></td>' +
          '<td><div class="row-actions">' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-edit-course="' + c.id + '" title="编辑">' + window.icon('edit', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost danger" data-del-course="' + c.id + '" title="删除">' + window.icon('trash', 14) + '</button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }
    window.hydrateIcons(tbody);
    bindRowActions(tbody);
    renderPagination(all.length, totalPages);
  }

  function renderPagination(total, totalPages) {
    const host = App.qs('#coursePagination');
    if (!total) { host.innerHTML = '<span class="page-info">共 0 门课程</span>'; return; }
    let buttons = '<button class="page-btn" data-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>上一页</button>';
    for (let i = 1; i <= totalPages; i++) buttons += '<button class="page-btn' + (i === page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    buttons += '<button class="page-btn" data-page="' + (page + 1) + '"' + (page === totalPages ? ' disabled' : '') + '>下一页</button>';
    host.innerHTML = '<span class="page-info">共 ' + total + ' 门课程 · 第 ' + page + ' / ' + totalPages + ' 页</span><div class="page-btns">' + buttons + '</div>';
    App.qsa('[data-page]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        page = Number(btn.getAttribute('data-page'));
        renderTable();
      });
    });
  }

  function bindRowActions(root) {
    App.qsa('[data-edit-course]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const course = db().courses.find(c => c.id === btn.getAttribute('data-edit-course'));
        if (course) openCourseModal(course);
      });
    });
    App.qsa('[data-del-course]', root).forEach(function (btn) {
      btn.addEventListener('click', function () { deleteCourse(btn.getAttribute('data-del-course')); });
    });
  }

  function durationValue(minutes) {
    const m = Number(minutes) || 0;
    return Math.floor(m / 60) + ':' + App.pad(m % 60);
  }

  function parseDuration(value) {
    const str = String(value || '').trim();
    const m = str.match(/^(\d{1,3}):([0-5]\d)$/);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function extractBvid(link) {
    const m = String(link || '').match(/BV[0-9A-Za-z]+/);
    return m ? m[0] : '';
  }

  function openCourseModal(course) {
    const isEdit = !!course;
    const body =
      '<div class="form-grid">' +
        '<div class="field span-2"><label class="field-label">课程名称 <span class="required">*</span></label>' +
          '<input class="input" id="courseName" placeholder="请输入课程名称" value="' + App.escapeHTML(course ? course.title : '') + '"><p class="field-error">请输入课程名称</p></div>' +
        '<div class="field span-2"><label class="field-label">封面图片 URL</label>' +
          '<input class="input" id="courseCover" placeholder="https://…（可选）" value="' + App.escapeHTML(course ? (course.coverUrl || '') : '') + '"><p class="field-hint">选填，留空使用系统默认封面</p></div>' +
        '<div class="field"><label class="field-label">时长 <span class="required">*</span></label>' +
          '<input class="input" id="courseDuration" placeholder="例如 6:20" value="' + (course ? durationValue(course.duration) : '') + '"><p class="field-hint">格式：小时:分钟，如 6:20</p><p class="field-error">请输入正确时长，格式如 6:20</p></div>' +
        '<div class="field"><label class="field-label">所属学科 <span class="required">*</span></label>' +
          '<select class="select" id="courseSubject">' + subjectOptions(course ? course.subjectId : (db().subjects[0] ? db().subjects[0].id : 'other')) + '</select><p class="field-error">请选择所属学科</p></div>' +
        '<div class="field"><label class="field-label">来源</label>' +
          '<select class="select" id="courseSource"><option value="B站"' + (course && course.source === 'B站' ? ' selected' : '') + '>B站</option><option value="其他"' + (course && course.source === '其他' ? ' selected' : '') + '>其他</option></select></div>' +
        '<div class="field"><label class="field-label">课程链接</label>' +
          '<input class="input" id="courseLink" placeholder="B站视频链接或课程地址" value="' + App.escapeHTML(course ? (course.link || (course.bvid ? 'https://www.bilibili.com/video/' + course.bvid : '')) : '') + '"><p class="field-hint">B站链接将自动提取 BV 号</p></div>' +
      '</div>';
    App.openModal({
      title: isEdit ? '编辑课程' : '新增课程',
      desc: '课程库独立维护，可被多条学习路线引用',
      size: 'wide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" data-save-course>' + (isEdit ? '保存修改' : '新增课程') + '</button>',
      onMount: function (layer, close) {
        layer.querySelector('[data-save-course]').addEventListener('click', function () {
          const name = App.qs('#courseName', layer);
          const duration = App.qs('#courseDuration', layer);
          const subject = App.qs('#courseSubject', layer);
          const cover = App.qs('#courseCover', layer);
          const source = App.qs('#courseSource', layer).value;
          const link = App.qs('#courseLink', layer);
          const okName = App.validateField(name, name.value.trim().length > 0, '请输入课程名称');
          const mins = parseDuration(duration.value);
          const okDuration = App.validateField(duration, mins != null, '请输入正确时长，格式如 6:20');
          if (!okName || !okDuration) return;
          const database = db();
          const gradient = GRADIENTS[database.courses.length % GRADIENTS.length];
          if (isEdit) {
            const item = database.courses.find(c => c.id === course.id);
            item.title = name.value.trim();
            item.duration = mins;
            item.subjectId = subject.value;
            item.source = source;
            item.link = link.value.trim();
            item.bvid = extractBvid(link.value.trim());
            item.coverUrl = cover.value.trim();
            App.saveDB(database);
            App.toast('课程已更新', 'success');
          } else {
            database.courses.unshift({
              id: 'c-' + Date.now(),
              title: name.value.trim(),
              subjectId: subject.value,
              duration: mins,
              bvid: extractBvid(link.value.trim()),
              link: link.value.trim(),
              playCount: 0,
              source: source,
              coverFrom: gradient[0],
              coverTo: gradient[1],
              cover: '../assets/images/covers/default.svg',
              emoji: '📺',
              coverUrl: cover.value.trim(),
              addedAt: App.formatDate(new Date()),
            });
            App.saveDB(database);
            App.toast('课程已新增', 'success');
          }
          close();
          renderStats();
          renderSubjectFilter();
          renderTable();
        });
      },
    });
  }

  async function deleteCourse(id) {
    const database = db();
    const course = database.courses.find(c => c.id === id);
    if (!course) return;
    const ok = await App.confirmDialog({
      title: '删除课程',
      message: '确认删除课程「' + course.title + '」吗？删除后，引用该课程的学习路线将不再展示这门课程。',
      hint: '删除为逻辑删除，数据仍保留在系统中可恢复。',
      confirmText: '删除课程',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    database.courses = database.courses.filter(c => c.id !== id);
    App.saveDB(database);
    renderStats();
    renderTable();
    App.toast('课程已删除', 'success');
  }

  function importSample() {
    return [
      'AI 产品经理入门 | 180 | AI应用与智能体开发 | B站 | https://www.bilibili.com/video/BV1demo001',
      'Stable Diffusion 商业实战 | 240 | AI视觉设计 | B站 | https://www.bilibili.com/video/BV1demo002 |',
      'AI 短剧项目复盘 | 120 | AI视频与短剧创作 | 其他 |',
      '无效课程行示例 | abc | 不存在的学科 | B站',
    ].join('\n');
  }

  function parseImport(text) {
    const database = db();
    const lines = String(text || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    return lines.map(function (line, i) {
      const parts = line.split(/[|｜]/).map(s => s.trim());
      const row = { line: i + 1, raw: line, name: parts[0] || '', duration: null, subjectId: 'other', subjectName: parts[2] || '', source: parts[3] || 'B站', link: parts[4] || '', coverUrl: parts[5] || '', warnings: [], errors: [] };
      if (parts.length < 4) row.errors.push('字段不足，至少需要 4 项（名称 | 时长 | 学科 | 来源）');
      if (!row.name) row.errors.push('课程名称为空');
      const mins = Number(parts[1]);
      if (!parts[1] || isNaN(mins) || mins <= 0) row.errors.push('时长需为正整数（分钟）');
      else row.duration = mins;
      const subject = database.subjects.find(s => s.name === row.subjectName);
      if (row.subjectName === '其他学科') row.subjectId = 'other';
      else if (subject) row.subjectId = subject.id;
      else row.errors.push('学科名称不存在：' + (row.subjectName || '空'));
      if (!row.source) { row.source = 'B站'; row.warnings.push('来源为空，默认按 B站 导入'); }
      else if (row.source !== 'B站' && row.source !== '其他') row.errors.push('来源仅支持 B站 / 其他');
      if (!row.link) row.warnings.push('课程链接为空');
      if (database.courses.some(c => c.title === row.name)) row.warnings.push('同名课程已存在');
      if (row.errors.length) row.status = 'invalid';
      else if (row.warnings.length) row.status = 'warning';
      else row.status = 'valid';
      return row;
    });
  }

  function openImportModal() {
    const body =
      '<div class="callout brand">' + window.icon('info', 16) +
        '<span>每行一门课程，使用竖线分隔：<b>课程名称 | 时长(分钟) | 学科名称 | 来源 | 课程链接 | 封面URL(可选)</b></span></div>' +
      '<div class="field" style="margin-top:16px"><div class="row-between"><label class="field-label">粘贴课程数据</label>' +
        '<button class="btn-link" id="fillSample" type="button">填入示例</button></div>' +
        '<textarea class="textarea" id="importText" style="min-height:150px;font-family:ui-monospace,Menlo,monospace;font-size:12px" placeholder="课程名称 | 时长(分钟) | 学科名称 | 来源 | 课程链接 | 封面URL"></textarea></div>' +
      '<div class="row-between" style="margin-top:12px"><span class="small muted" id="importHint">粘贴后点击「解析预览」检查数据</span>' +
        '<button class="btn btn-outline btn-sm" id="parseImportBtn"><span data-icon="refresh" data-icon-size="14"></span> 解析预览</button></div>' +
      '<div id="importPreview"></div>';
    App.openModal({
      title: '批量导入课程',
      desc: '先解析预览，确认无误后统一导入',
      size: 'xwide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" id="confirmImportBtn" disabled>确认导入</button>',
      onMount: function (layer, close) {
        let parsed = [];
        const textarea = layer.querySelector('#importText');
        layer.querySelector('#fillSample').addEventListener('click', function () {
          textarea.value = importSample();
          textarea.focus();
        });
        layer.querySelector('#parseImportBtn').addEventListener('click', function () {
          if (!textarea.value.trim()) { App.toast('请先粘贴课程数据', 'warning'); return; }
          parsed = parseImport(textarea.value);
          const valid = parsed.filter(r => r.status === 'valid').length;
          const warn = parsed.filter(r => r.status === 'warning').length;
          const invalid = parsed.filter(r => r.status === 'invalid').length;
          layer.querySelector('#importHint').textContent = '共解析 ' + parsed.length + ' 行：有效 ' + valid + ' · 警告 ' + warn + ' · 无效 ' + invalid;
          layer.querySelector('#importPreview').innerHTML =
            '<div class="import-preview"><div class="import-preview-head"><b>解析预览</b><span class="small muted">警告行仍可导入，无效行将被跳过</span></div>' +
              '<div class="table-wrap"><table class="data-table"><thead><tr><th>行号</th><th>课程名称</th><th>时长</th><th>学科</th><th>来源</th><th>状态 / 原因</th></tr></thead><tbody>' +
              parsed.map(function (r) {
                const badge = r.status === 'valid' ? '<span class="badge badge-green">有效</span>' : r.status === 'warning' ? '<span class="badge badge-amber">警告</span>' : '<span class="badge badge-red">无效</span>';
                const reason = r.errors.concat(r.warnings).join('；') || '—';
                return '<tr><td>' + r.line + '</td><td>' + App.escapeHTML(r.name || '—') + '</td><td>' + (r.duration || '—') + ' 分钟</td><td>' + App.escapeHTML(r.subjectName || '—') + '</td><td>' + App.escapeHTML(r.source) + '</td><td>' + badge + ' <span class="small muted">' + App.escapeHTML(reason) + '</span></td></tr>';
              }).join('') +
              '</tbody></table></div></div>';
          const importable = parsed.filter(r => r.status !== 'invalid');
          const btn = layer.querySelector('#confirmImportBtn');
          btn.disabled = importable.length === 0;
          btn.textContent = '确认导入（' + importable.length + ' 门）';
          window.hydrateIcons(layer.querySelector('#importPreview'));
        });
        layer.querySelector('#confirmImportBtn').addEventListener('click', function () {
          const importable = parsed.filter(r => r.status !== 'invalid');
          if (!importable.length) return;
          const database = db();
          importable.forEach(function (r) {
            const gradient = GRADIENTS[(database.courses.length + 1) % GRADIENTS.length];
            database.courses.unshift({
              id: 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
              title: r.name,
              subjectId: r.subjectId,
              duration: r.duration,
              bvid: extractBvid(r.link),
              link: r.link,
              playCount: 0,
              source: r.source,
              coverFrom: gradient[0],
              coverTo: gradient[1],
              cover: '../assets/images/covers/default.svg',
              emoji: '📺',
              coverUrl: r.coverUrl,
              addedAt: App.formatDate(new Date()),
            });
          });
          App.saveDB(database);
          close();
          renderStats();
          renderSubjectFilter();
          renderTable();
          App.toast('成功导入 ' + importable.length + ' 门课程', 'success');
        });
      },
    });
  }

  function init() {
    if (!App.getAdmin()) return;
    renderStats();
    renderSubjectFilter();
    renderTable();

    App.qs('#courseSearch').addEventListener('input', App.debounce(function (e) {
      filters.keyword = e.target.value.trim().toLowerCase();
      page = 1;
      renderTable();
    }, 220));
    App.qs('#courseSubjectFilter').addEventListener('change', function (e) {
      filters.subject = e.target.value;
      page = 1;
      renderTable();
    });
    App.qs('#courseSourceFilter').addEventListener('change', function (e) {
      filters.source = e.target.value;
      page = 1;
      renderTable();
    });
    App.qs('#addCourseBtn').addEventListener('click', function () { openCourseModal(null); });
    App.qs('#importCoursesBtn').addEventListener('click', openImportModal);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
