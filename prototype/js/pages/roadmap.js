/* 学习路线 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;

  let selected = null;

  function getData() {
    const db = App.getDB();
    return { roadmaps: db.roadmaps, courses: db.courses };
  }

  function getRoute(subjectId, roadmaps) {
    return roadmaps.find(r => r.subjectId === subjectId && r.status === 'active') || null;
  }

  function initSelected() {
    const params = new URLSearchParams(location.search);
    const s = params.get('subject');
    if (s && Data.SUBJECTS.some(x => x.id === s)) selected = s;
  }

  function syncURL() {
    const params = new URLSearchParams();
    if (selected) params.set('subject', selected);
    history.replaceState(null, '', 'routes.html' + (params.toString() ? '?' + params.toString() : ''));
  }

  function renderSubjects() {
    const { roadmaps, courses } = getData();
    const host = App.qs('#roadmapSubjects');
    host.innerHTML = Data.SUBJECTS.map(function (s) {
      const route = getRoute(s.id, roadmaps);
      const count = route ? route.courseIds.filter(id => courses.some(c => c.id === id)).length : s.courseIds.length;
      return '<button class="roadmap-subject' + (selected === s.id ? ' active' : '') + '" data-rm-subject="' + s.id + '">' +
        '<span class="s-icon" style="background:' + s.tint + '">' + s.icon + '</span>' +
        '<span><b>' + s.name + '</b><span>' + count + ' 门课程' + (route ? '' : ' · 敬请期待') + '</span></span>' +
      '</button>';
    }).join('');
    App.qsa('[data-rm-subject]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        selected = btn.getAttribute('data-rm-subject');
        syncURL();
        renderSubjects();
        renderContent();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function emptyState(title, desc, icon) {
    return '<div class="empty-panel"><div class="empty">' +
      '<div class="empty-art">' + window.icon(icon || 'compass', 30) + '</div>' +
      '<div class="empty-title">' + title + '</div>' +
      '<div class="empty-desc">' + desc + '</div>' +
    '</div></div>';
  }

  function renderContent() {
    const host = App.qs('#roadmapContent');
    if (!selected) {
      host.innerHTML = emptyState('请选择一个学科方向', '选择上方的学科卡片，查看对应的系统学习路线。', 'compass');
      window.hydrateIcons(host);
      return;
    }
    const subject = Data.SUBJECTS.find(s => s.id === selected);
    const { roadmaps, courses } = getData();
    const route = getRoute(selected, roadmaps);
    if (!route) {
      host.innerHTML = emptyState('该学科暂无学习路线', '「' + subject.name + '」的学习路线正在规划中，先去题库练习相关题目吧。', 'route');
      window.hydrateIcons(host);
      return;
    }
    const routeCourses = (route.courseIds || []).map(id => courses.find(c => c.id === id)).filter(Boolean);
    if (!routeCourses.length) {
      host.innerHTML = emptyState('课程筹备中，敬请期待', '路线已建立，课程内容正在补充中。', 'video');
      window.hydrateIcons(host);
      return;
    }
    const totalMinutes = routeCourses.reduce((n, c) => n + (Number(c.duration) || 0), 0);
    const html =
      '<div class="roadmap-hero">' +
        '<h1>' + App.escapeHTML(route.name) + '</h1>' +
        '<span class="audience">' + window.icon('graduation', 13) + ' 适合人群：' + App.escapeHTML(route.audience || route.education || '不限') + '</span>' +
        '<p>' + App.escapeHTML(route.desc) + '</p>' +
        '<div class="roadmap-stats">' +
          '<div class="roadmap-stat">' + window.icon('bookOpen', 18) + '<div><b>' + routeCourses.length + ' 门</b>共课程数</div></div>' +
          '<div class="roadmap-stat">' + window.icon('clock', 18) + '<div><b>' + App.formatMinutes(totalMinutes) + '</b>总计时长</div></div>' +
          '<div class="roadmap-stat">' + window.icon('list', 18) + '<div><b>按序学习</b>课程顺序即学习顺序</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="course-list">' + routeCourses.map(function (c, i) {
        const href = c.link || (c.bvid ? 'https://www.bilibili.com/video/' + encodeURIComponent(c.bvid) : '');
        const cover = Data.helpers.courseCover(c);
        return '<div class="course-row">' +
          '<span class="course-index">' + App.pad(i + 1) + '</span>' +
          '<span class="course-cover">' +
            '<img src="' + App.escapeHTML(cover) + '" alt="' + App.escapeHTML(c.title) + ' 封面">' +
            '<span class="play-badge">' + window.icon('play', 10) + '</span>' +
          '</span>' +
          '<div class="course-info">' +
            '<h3>' + App.escapeHTML(c.title) + '</h3>' +
            '<div class="course-meta">' +
              '<span>' + window.icon('clock', 12) + ' ' + App.formatMinutes(c.duration) + '</span>' +
              '<span class="badge badge-outline" style="height:19px;font-size:10px">' + App.escapeHTML(c.source || '其他') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="course-action">' + (href
            ? '<a class="btn btn-outline btn-sm" href="' + href + '" target="_blank" rel="noopener">去 B 站学习 ' + window.icon('external', 13) + '</a>'
            : '<button class="btn btn-outline btn-sm" disabled title="课程链接待补充">链接待补充</button>') + '</div>' +
        '</div>';
      }).join('') + '</div>';
    host.innerHTML = html;
    window.hydrateIcons(host);
  }

  function init() {
    initSelected();
    renderSubjects();
    renderContent();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
