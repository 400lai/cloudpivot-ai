/* 管理端 · 学习路线管理 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;

  let view = 'list';
  let currentId = null;

  function db() { return App.getDB(); }
  function subjectName(id) {
    const s = db().subjects.find(x => x.id === id);
    return s ? s.name : '未关联学科';
  }
  function subjectMeta(id) {
    return Data.DIRECTION_META.find(x => x.id === id) || { icon: '🗺️', tint: '#EEF0FF' };
  }
  function getCourse(id) { return db().courses.find(c => c.id === id); }
  function coverStyle(course) {
    return "background-image:url('" + App.escapeHTML(Data.helpers.courseCover(course)) + "');background-size:cover;background-position:center";
  }
  function routeCourses(route) {
    return (route.courseIds || []).map(getCourse).filter(Boolean);
  }
  function totalMinutes(route) {
    return routeCourses(route).reduce((n, c) => n + (Number(c.duration) || 0), 0);
  }

  function render() {
    App.qs('#roadmapHeadActions').style.display = view === 'list' ? 'flex' : 'none';
    if (view === 'detail') renderDetail();
    else renderList();
  }

  function renderList() {
    const routes = db().roadmaps;
    const host = App.qs('#roadmapMain');
    if (!routes.length) {
      host.innerHTML = '<div class="admin-card"><div class="empty"><div class="empty-art">' + window.icon('route', 30) + '</div>' +
        '<div class="empty-title">暂无学习路线</div><div class="empty-desc">点击上方「新建路线」创建一条学习路线。</div>' +
        '<button class="btn btn-primary" id="emptyAddRoute">新建路线</button></div></div>';
      App.qs('#emptyAddRoute').addEventListener('click', function () { openRouteModal(null); });
      return;
    }
    host.innerHTML = '<div class="roadmap-admin-grid">' + routes.map(function (route) {
      const courses = routeCourses(route);
      const preview = courses.slice(0, 4);
      return '<div class="roadmap-admin-card">' +
        '<div class="roadmap-admin-head">' +
          '<span class="rm-icon" style="background:' + subjectMeta(route.subjectId).tint + '">' + (route.icon || '🗺️') + '</span>' +
          '<div class="grow"><h3>' + App.escapeHTML(route.name) + '</h3>' +
            '<div class="rm-sub">' + App.escapeHTML(subjectName(route.subjectId)) + ' · ' + App.escapeHTML(route.education || '本科及以上') + '</div></div>' +
          '<div class="role-card-actions">' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-rm-preview="' + route.id + '" title="预览">' + window.icon('eye', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-rm-edit="' + route.id + '" title="编辑">' + window.icon('edit', 14) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-rm-del="' + route.id + '" title="删除" style="color:var(--red-strong)">' + window.icon('trash', 14) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="roadmap-admin-meta">' +
          '<span class="badge ' + (route.status === 'active' ? 'badge-green' : 'badge-outline') + '">' + (route.status === 'active' ? '启用中' : '已禁用') + '</span>' +
          '<span>' + courses.length + ' 门 B站课程</span><span class="dot-sep"></span><span>' + App.formatMinutes(totalMinutes(route)) + '</span>' +
        '</div>' +
        '<p class="roadmap-admin-desc">' + App.escapeHTML(route.desc || '暂无路线描述') + '</p>' +
        '<div class="roadmap-course-preview">' + (preview.length ? preview.map(function (c) {
          return '<div class="roadmap-course-chip"><span class="mini-cover" style="' + coverStyle(c) + '"></span>' + App.escapeHTML(c.title) + '</div>';
        }).join('') : '<span class="small muted" style="padding:4px 0">暂无课程</span>') + '</div>' +
        '<div class="roadmap-admin-foot">' +
          '<button class="btn btn-sm ' + (route.status === 'active' ? 'btn-success-soft' : 'btn-outline') + '" data-rm-toggle="' + route.id + '">' + window.icon(route.status === 'active' ? 'pause' : 'play', 13) + ' ' + (route.status === 'active' ? '禁用路线' : '启用路线') + '</button>' +
          '<button class="btn btn-sm btn-soft" data-rm-detail="' + route.id + '">课程管理 ' + window.icon('arrowRight', 13) + '</button>' +
        '</div>' +
      '</div>';
    }).join('') + '</div>';
    window.hydrateIcons(host);
    bindList(host);
  }

  function bindList(host) {
    App.qsa('[data-rm-preview]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { previewRoute(btn.getAttribute('data-rm-preview')); });
    });
    App.qsa('[data-rm-edit]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const route = db().roadmaps.find(r => r.id === btn.getAttribute('data-rm-edit'));
        if (route) openRouteModal(route);
      });
    });
    App.qsa('[data-rm-del]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { deleteRoute(btn.getAttribute('data-rm-del')); });
    });
    App.qsa('[data-rm-toggle]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { toggleRoute(btn.getAttribute('data-rm-toggle')); });
    });
    App.qsa('[data-rm-detail]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentId = btn.getAttribute('data-rm-detail');
        view = 'detail';
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  async function toggleRoute(id) {
    const database = db();
    const route = database.roadmaps.find(r => r.id === id);
    if (!route) return;
    const target = route.status === 'active' ? 'disabled' : 'active';
    const ok = await App.confirmDialog({
      title: target === 'active' ? '启用路线' : '禁用路线',
      message: target === 'active'
        ? '启用后，学员端将展示该学习路线。确认启用吗？'
        : '禁用后，学员端将不再展示该学习路线。确认禁用吗？',
      confirmText: target === 'active' ? '启用路线' : '禁用路线',
      icon: 'alert',
      danger: target === 'disabled',
    });
    if (!ok) return;
    route.status = target;
    route.updatedAt = App.formatDate(new Date());
    App.saveDB(database);
    App.addLog(target === 'active' ? '启用学习路线' : '禁用学习路线', '路线「' + route.name + '」', 'disable');
    render();
    App.toast('路线已' + (target === 'active' ? '启用' : '禁用'), 'success');
  }

  async function deleteRoute(id) {
    const database = db();
    const route = database.roadmaps.find(r => r.id === id);
    if (!route) return;
    const ok = await App.confirmDialog({
      title: '删除学习路线',
      message: '确认删除路线「' + route.name + '」吗？',
      hint: '删除为逻辑删除，课程库中的课程不会被删除。',
      confirmText: '删除路线',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    database.roadmaps = database.roadmaps.filter(r => r.id !== id);
    App.saveDB(database);
    App.addLog('删除学习路线', '路线「' + route.name + '」', 'delete');
    render();
    App.toast('学习路线已删除', 'success');
  }

  function renderDetail() {
    const database = db();
    const route = database.roadmaps.find(r => r.id === currentId);
    if (!route) { view = 'list'; return renderList(); }
    const courses = routeCourses(route);
    const host = App.qs('#roadmapMain');
    host.innerHTML =
      '<a class="back-link" id="backToRoutes" href="#" style="margin-bottom:14px;display:inline-flex">' + window.icon('arrowLeft', 15) + ' 返回路线列表</a>' +
      '<div class="route-detail-head">' +
        '<span class="rm-icon" style="background:' + subjectMeta(route.subjectId).tint + '">' + (route.icon || '🗺️') + '</span>' +
        '<div class="grow"><h2>' + App.escapeHTML(route.name) + ' - 课程管理</h2>' +
          '<p>' + App.escapeHTML(route.desc || '') + '</p>' +
          '<div class="route-detail-meta">' +
            '<span>关联学科：<b>' + App.escapeHTML(subjectName(route.subjectId)) + '</b></span>' +
            '<span>状态：<b>' + (route.status === 'active' ? '启用中' : '已禁用') + '</b></span>' +
            '<span>适合学历：<b>' + App.escapeHTML(route.education || '本科及以上') + '</b></span>' +
            '<span>课程数：<b>' + courses.length + '</b></span>' +
            '<span>总时长：<b>' + App.formatMinutes(totalMinutes(route)) + '</b></span>' +
          '</div></div>' +
        '<button class="btn btn-primary btn-sm" id="addFromLibraryBtn">' + window.icon('plus', 14) + ' 从课程库添加</button>' +
      '</div>' +
      '<div class="admin-card"><div class="admin-card-head"><div><h3>课程列表</h3><p>课程顺序即学员的学习顺序</p></div>' +
        '<span class="badge badge-outline">' + courses.length + ' 门</span></div>' +
        '<div class="table-wrap"><table class="data-table"><thead><tr><th style="width:56px">序号</th><th>BV号</th><th>课程名称</th><th>时长</th><th>播放量</th><th style="width:100px">排序</th><th style="width:80px">操作</th></tr></thead><tbody>' +
        (courses.length ? courses.map(function (c, i) {
          return '<tr>' +
            '<td><span class="cell-id">' + App.pad(i + 1) + '</span></td>' +
            '<td><span class="bvid">' + App.escapeHTML(c.bvid || '—') + '</span></td>' +
            '<td><div class="course-title-cell"><span class="course-thumb" style="width:48px;height:29px;font-size:13px;' + coverStyle(c) + '"></span><b>' + App.escapeHTML(c.title) + '</b></div></td>' +
            '<td><span class="duration-cell">' + App.formatMinutes(c.duration) + '</span></td>' +
            '<td><span class="small muted">' + App.compact(c.playCount || 0) + '</span></td>' +
            '<td><div class="row-actions">' +
              '<button class="btn btn-icon btn-sm btn-ghost" data-course-up="' + c.id + '" title="上移" ' + (i === 0 ? 'disabled' : '') + '>' + window.icon('arrowUp', 13) + '</button>' +
              '<button class="btn btn-icon btn-sm btn-ghost" data-course-down="' + c.id + '" title="下移" ' + (i === courses.length - 1 ? 'disabled' : '') + '>' + window.icon('arrowDown', 13) + '</button>' +
            '</div></td>' +
            '<td><button class="btn btn-icon btn-sm btn-ghost" data-course-remove="' + c.id + '" title="移除" style="color:var(--red-strong)">' + window.icon('trash', 13) + '</button></td>' +
          '</tr>';
        }).join('') : '<tr><td colspan="7"><div class="empty"><div class="empty-art">' + window.icon('video', 28) + '</div>' +
          '<div class="empty-title">暂无课程</div><div class="empty-desc">点击右上角「从课程库添加」为路线选择课程。</div></div></td></tr>') +
        '</tbody></table></div></div>';
    window.hydrateIcons(host);
    App.qs('#backToRoutes').addEventListener('click', function (e) {
      e.preventDefault();
      view = 'list';
      render();
    });
    App.qs('#addFromLibraryBtn').addEventListener('click', function () { openAddFromLibrary(route); });
    App.qsa('[data-course-up]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { moveCourse(route, btn.getAttribute('data-course-up'), -1); });
    });
    App.qsa('[data-course-down]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { moveCourse(route, btn.getAttribute('data-course-down'), 1); });
    });
    App.qsa('[data-course-remove]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { removeCourseFromRoute(route, btn.getAttribute('data-course-remove')); });
    });
  }

  function moveCourse(route, courseId, dir) {
    const database = db();
    const item = database.roadmaps.find(r => r.id === route.id);
    if (!item) return;
    const i = item.courseIds.indexOf(courseId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= item.courseIds.length) return;
    const tmp = item.courseIds[i];
    item.courseIds[i] = item.courseIds[j];
    item.courseIds[j] = tmp;
    item.updatedAt = App.formatDate(new Date());
    App.saveDB(database);
    renderDetail();
  }

  async function removeCourseFromRoute(route, courseId) {
    const course = getCourse(courseId);
    const ok = await App.confirmDialog({
      title: '移除课程',
      message: '确认从路线「' + route.name + '」中移除课程「' + (course ? course.title : courseId) + '」吗？课程库中的课程不会被删除。',
      confirmText: '移除课程',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    const database = db();
    const item = database.roadmaps.find(r => r.id === route.id);
    item.courseIds = item.courseIds.filter(id => id !== courseId);
    item.updatedAt = App.formatDate(new Date());
    App.saveDB(database);
    renderDetail();
    App.toast('课程已从路线中移除', 'success');
  }

  function openAddFromLibrary(route) {
    const selected = new Set();
    const database = db();
    const body =
      '<div class="input-wrap"><span data-icon="search" data-icon-size="16"></span>' +
        '<input class="input" id="libSearch" placeholder="搜索课程名称" style="padding-left:38px"></div>' +
      '<div id="libraryList" style="margin-top:14px"></div>';
    App.openModal({
      title: '从课程库添加',
      desc: route.name + ' · 支持多选添加',
      size: 'wide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" id="confirmAddCourses" disabled>完成添加</button>',
      onMount: function (layer, close) {
        function renderList() {
          const keyword = layer.querySelector('#libSearch').value.trim().toLowerCase();
          const current = database.courses.filter(c => c.subjectId === route.subjectId && c.title.toLowerCase().indexOf(keyword) > -1);
          const others = database.courses.filter(c => c.subjectId !== route.subjectId && c.title.toLowerCase().indexOf(keyword) > -1);
          const added = id => (route.courseIds || []).indexOf(id) > -1;
          const item = function (c) {
            const isAdded = added(c.id);
            return '<label class="add-course-item' + (isAdded ? ' added' : '') + '">' +
              (isAdded ? '<span class="badge badge-green">已添加</span>' : '<input type="checkbox" data-pick="' + c.id + '"' + (selected.has(c.id) ? ' checked' : '') + '>') +
              '<span class="course-thumb" style="' + coverStyle(c) + '"></span>' +
              '<div class="grow"><b>' + App.escapeHTML(c.title) + '</b><span>' + App.formatMinutes(c.duration) + ' · ' + App.escapeHTML(subjectName(c.subjectId)) + '</span></div>' +
            '</label>';
          };
          layer.querySelector('#libraryList').innerHTML =
            '<div class="add-course-group"><h4>' + window.icon('folderOpen', 13) + ' 本学科课程</h4>' +
              (current.length ? current.map(item).join('') : '<p class="small muted">本学科暂无可添加的课程</p>') + '</div>' +
            '<div class="add-course-group"><h4>' + window.icon('layers', 13) + ' 其他学科课程（跨学科补充）</h4>' +
              (others.length ? others.map(item).join('') : '<p class="small muted">没有匹配的其他学科课程</p>') + '</div>';
          window.hydrateIcons(layer.querySelector('#libraryList'));
          App.qsa('[data-pick]', layer).forEach(function (cb) {
            cb.addEventListener('change', function () {
              if (cb.checked) selected.add(cb.getAttribute('data-pick'));
              else selected.delete(cb.getAttribute('data-pick'));
              const btn = layer.querySelector('#confirmAddCourses');
              btn.disabled = selected.size === 0;
              btn.textContent = '完成添加（' + selected.size + ' 门）';
            });
          });
        }
        renderList();
        layer.querySelector('#libSearch').addEventListener('input', App.debounce(renderList, 180));
        layer.querySelector('#confirmAddCourses').addEventListener('click', function () {
          if (!selected.size) return;
          const item = db().roadmaps.find(r => r.id === route.id);
          selected.forEach(id => { if (item.courseIds.indexOf(id) === -1) item.courseIds.push(id); });
          item.updatedAt = App.formatDate(new Date());
          App.saveDB(db());
          App.addLog('添加路线课程', '路线「' + route.name + '」', 'edit', '从课程库添加 ' + selected.size + ' 门课程');
          close();
          renderDetail();
          App.toast('已添加 ' + selected.size + ' 门课程', 'success');
        });
      },
    });
  }

  function previewRoute(id) {
    const route = db().roadmaps.find(r => r.id === id);
    if (!route) return;
    const courses = routeCourses(route);
    const body =
      '<div class="callout brand" style="margin-bottom:16px">' + window.icon('eye', 16) + '<span>学员视角预览，仅展示路线内容。</span></div>' +
      '<h2 style="font-size:22px;letter-spacing:-.02em">' + App.escapeHTML(route.name) + '</h2>' +
      '<div class="row gap-8 wrap" style="margin-top:8px"><span class="badge badge-brand">' + App.escapeHTML(subjectName(route.subjectId)) + '</span>' +
        '<span class="badge badge-outline">' + App.escapeHTML(route.education || '本科及以上') + '</span>' +
        '<span class="badge ' + (route.status === 'active' ? 'badge-green' : 'badge-outline') + '">' + (route.status === 'active' ? '启用中' : '已禁用') + '</span></div>' +
      '<p style="font-size:12.5px;color:var(--muted);line-height:1.8;margin-top:12px">' + App.escapeHTML(route.desc || '') + '</p>' +
      '<div class="route-detail-meta" style="margin-top:12px"><span>共 <b>' + courses.length + '</b> 门课程</span><span>总计时长 <b>' + App.formatMinutes(totalMinutes(route)) + '</b></span><span>按列表顺序学习</span></div>' +
      '<div class="course-list" style="margin-top:16px">' + (courses.length ? courses.map(function (c, i) {
        return '<div class="course-row" style="padding:10px"><span class="course-index">' + App.pad(i + 1) + '</span>' +
          '<span class="course-cover" style="width:74px;height:44px;font-size:17px;' + coverStyle(c) + '"></span>' +
          '<div class="course-info"><h3 style="font-size:12.5px">' + App.escapeHTML(c.title) + '</h3>' +
          '<div class="course-meta"><span>' + (c.bvid || '—') + '</span><span>' + App.formatMinutes(c.duration) + '</span><span>' + App.compact(c.playCount || 0) + ' 播放</span></div></div></div>';
      }).join('') : '<div class="empty-panel" style="padding:36px"><div class="empty"><div class="empty-title">课程筹备中，敬请期待</div></div></div>') + '</div>';
    App.openModal({
      title: '路线预览',
      desc: '学员视角',
      size: 'wide',
      body: body,
      footer: '<button class="btn btn-primary" data-close-modal>关闭预览</button>',
    });
  }

  function openRouteModal(route) {
    const isEdit = !!route;
    const subjectId = route ? route.subjectId : (db().subjects[0] ? db().subjects[0].id : '');
    const selectedIds = route ? (route.courseIds || []).slice() : [];
    const body =
      '<div class="form-grid">' +
        '<div class="field span-2"><label class="field-label">路线名称 <span class="required">*</span></label><input class="input" id="routeName" placeholder="例如：AI 应用开发 90 天进阶路线" value="' + App.escapeHTML(route ? route.name : '') + '"><p class="field-error">请输入路线名称</p></div>' +
        '<div class="field"><label class="field-label">关联学科 <span class="required">*</span></label><select class="select" id="routeSubject">' +
          db().subjects.map(s => '<option value="' + s.id + '"' + (s.id === subjectId ? ' selected' : '') + '>' + App.escapeHTML(s.name) + '</option>').join('') +
        '</select><p class="field-error">请选择关联学科</p></div>' +
        '<div class="field"><label class="field-label">路线状态</label><select class="select" id="routeStatus"><option value="active"' + (route && route.status === 'active' ? ' selected' : '') + '>启用</option><option value="disabled"' + (route && route.status === 'disabled' ? ' selected' : '') + '>禁用</option></select></div>' +
        '<div class="field"><label class="field-label">路线图标</label><input class="input" id="routeIcon" placeholder="例如 🚀" maxlength="4" value="' + App.escapeHTML(route ? (route.icon || '') : '🚀') + '"><p class="field-hint">可选，建议使用 Emoji</p></div>' +
        '<div class="field"><label class="field-label">适合学历</label><select class="select" id="routeEducation">' +
          ['不限', '大专及以上', '本科及以上', '硕士及以上'].map(e => '<option value="' + e + '"' + ((route ? (route.education || '本科及以上') : '本科及以上') === e ? ' selected' : '') + '>' + e + '</option>').join('') +
        '</select></div>' +
        '<div class="field span-2"><label class="field-label">路线描述</label><textarea class="textarea" id="routeDesc" placeholder="说明路线适合人群、学习目标与预期收获">' + App.escapeHTML(route ? (route.desc || '') : '') + '</textarea></div>' +
      '</div>' +
      '<div class="route-picker">' +
        '<div class="route-picker-col"><div class="row-between" style="margin-bottom:8px"><b style="font-size:12px">可选课程（本学科）</b><span class="small muted" id="availableCount"></span></div>' +
          '<div id="routeAvailable" class="route-picker-list"></div></div>' +
        '<div class="route-picker-col"><div class="row-between" style="margin-bottom:8px"><b style="font-size:12px">已选课程</b><span class="small muted" id="selectedCount"></span></div>' +
          '<div id="routeSelected" class="route-picker-list"></div></div>' +
      '</div>';
    App.openModal({
      title: isEdit ? '编辑学习路线' : '新建学习路线',
      desc: '勾选课程并调整顺序，保存后即生效',
      size: 'xwide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" data-save-route>' + (isEdit ? '保存修改' : '创建路线') + '</button>',
      onMount: function (layer, close) {
        const subjectSelect = layer.querySelector('#routeSubject');
        function courseLabel(c) {
          const cross = c.subjectId !== subjectSelect.value;
          return '<div class="grow"><b>' + App.escapeHTML(c.title) + '</b><span>' + App.formatMinutes(c.duration) + (cross ? ' · 跨学科' : '') + '</span></div>';
        }
        function renderPickers() {
          const all = db().courses;
          const available = all.filter(c => c.subjectId === subjectSelect.value);
          layer.querySelector('#routeAvailable').innerHTML = available.length ? available.map(function (c) {
            return '<label class="add-course-item"><input type="checkbox" data-avail="' + c.id + '"' + (selectedIds.indexOf(c.id) > -1 ? ' checked' : '') + '>' +
              '<span class="course-thumb" style="' + coverStyle(c) + '"></span>' + courseLabel(c) + '</label>';
          }).join('') : '<p class="small muted" style="padding:8px">该学科暂无可选课程</p>';
          layer.querySelector('#routeSelected').innerHTML = selectedIds.length ? selectedIds.map(function (id, i) {
            const c = all.find(x => x.id === id);
            if (!c) return '';
            return '<div class="route-selected-item">' +
              '<span class="route-order">' + App.pad(i + 1) + '</span>' + courseLabel(c) +
              '<button type="button" class="btn btn-icon btn-sm btn-ghost" data-sel-up="' + c.id + '" title="上移" ' + (i === 0 ? 'disabled' : '') + '>' + window.icon('arrowUp', 12) + '</button>' +
              '<button type="button" class="btn btn-icon btn-sm btn-ghost" data-sel-down="' + c.id + '" title="下移" ' + (i === selectedIds.length - 1 ? 'disabled' : '') + '>' + window.icon('arrowDown', 12) + '</button>' +
              '<button type="button" class="btn btn-icon btn-sm btn-ghost" data-sel-remove="' + c.id + '" title="移除" style="color:var(--red-strong)">' + window.icon('x', 12) + '</button>' +
            '</div>';
          }).join('') : '<p class="small muted" style="padding:8px">尚未选择课程</p>';
          layer.querySelector('#availableCount').textContent = available.length + ' 门';
          layer.querySelector('#selectedCount').textContent = selectedIds.length + ' 门';
          window.hydrateIcons(layer);
          App.qsa('[data-avail]', layer).forEach(function (cb) {
            cb.addEventListener('change', function () {
              const id = cb.getAttribute('data-avail');
              if (cb.checked) { if (selectedIds.indexOf(id) === -1) selectedIds.push(id); }
              else selectedIds.splice(selectedIds.indexOf(id), 1);
              renderPickers();
            });
          });
          App.qsa('[data-sel-up]', layer).forEach(function (btn) {
            btn.addEventListener('click', function () {
              const i = selectedIds.indexOf(btn.getAttribute('data-sel-up'));
              if (i > 0) { selectedIds.splice(i - 1, 0, selectedIds.splice(i, 1)[0]); renderPickers(); }
            });
          });
          App.qsa('[data-sel-down]', layer).forEach(function (btn) {
            btn.addEventListener('click', function () {
              const i = selectedIds.indexOf(btn.getAttribute('data-sel-down'));
              if (i > -1 && i < selectedIds.length - 1) { selectedIds.splice(i + 1, 0, selectedIds.splice(i, 1)[0]); renderPickers(); }
            });
          });
          App.qsa('[data-sel-remove]', layer).forEach(function (btn) {
            btn.addEventListener('click', function () {
              selectedIds.splice(selectedIds.indexOf(btn.getAttribute('data-sel-remove')), 1);
              renderPickers();
            });
          });
        }
        renderPickers();
        subjectSelect.addEventListener('change', renderPickers);
        layer.querySelector('[data-save-route]').addEventListener('click', function () {
          const name = layer.querySelector('#routeName');
          const subject = subjectSelect;
          const okName = App.validateField(name, name.value.trim().length > 0, '请输入路线名称');
          const okSubject = App.validateField(subject, !!subject.value, '请选择关联学科');
          if (!okName || !okSubject) return;
          const database = db();
          const education = layer.querySelector('#routeEducation').value;
          if (isEdit) {
            const item = database.roadmaps.find(r => r.id === route.id);
            item.name = name.value.trim();
            item.subjectId = subject.value;
            item.status = layer.querySelector('#routeStatus').value;
            item.icon = layer.querySelector('#routeIcon').value.trim() || '🚀';
            item.education = education;
            item.audience = item.audience || education;
            item.desc = layer.querySelector('#routeDesc').value.trim();
            item.courseIds = selectedIds.slice();
            item.updatedAt = App.formatDate(new Date());
            App.toast('学习路线已更新', 'success');
          } else {
            database.roadmaps.unshift({
              id: 'route-' + Date.now(),
              name: name.value.trim(),
              subjectId: subject.value,
              status: layer.querySelector('#routeStatus').value,
              icon: layer.querySelector('#routeIcon').value.trim() || '🚀',
              education: education,
              audience: education,
              desc: layer.querySelector('#routeDesc').value.trim(),
              courseIds: selectedIds.slice(),
              updatedAt: App.formatDate(new Date()),
            });
            App.toast('学习路线已创建', 'success');
          }
          App.saveDB(database);
          App.addLog(isEdit ? '编辑学习路线' : '新增学习路线', '路线「' + name.value.trim() + '」', isEdit ? 'edit' : 'create', (isEdit ? '编辑' : '创建') + '路线并关联 ' + selectedIds.length + ' 门课程');
          close();
          view = 'list';
          render();
        });
      },
    });
  }

  function init() {
    if (!App.getAdmin()) return;
    render();
    App.qs('#addRoadmapBtn').addEventListener('click', function () { openRouteModal(null); });
    if (new URLSearchParams(location.search).get('new') === '1') {
      setTimeout(function () { openRouteModal(null); }, 200);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
