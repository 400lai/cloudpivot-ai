/* 首页 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;
  const H = Data.HOME;

  function renderHeroStats() {
    const host = App.qs('#heroStats');
    if (!host) return;
    host.innerHTML = H.stats.map(function (s, i) {
      return '<div class="hero-stat"><div class="num"><span data-count="' + s.value + '" data-decimals="' + (s.decimals || 0) + '">0</span><em>' + s.suffix + '</em></div><div class="lbl">' + s.label + '</div></div>';
    }).join('');
    setTimeout(function () {
      App.qsa('[data-count]', host).forEach(function (el) {
        const target = Number(el.getAttribute('data-count'));
        const decimals = Number(el.getAttribute('data-decimals'));
        App.animateCounter(el, target, { duration: 1500, decimals: decimals });
      });
    }, 260);
  }

  function renderQuick() {
    const host = App.qs('#quickGrid');
    if (!host) return;
    host.innerHTML = H.quickStart.map(function (q) {
      const colorMap = { brand: 'brand', purple: 'purple', green: 'green', amber: 'amber' };
      return '<a class="quick-card" href="' + q.href + '">' +
        '<span class="icon-tile ' + (colorMap[q.color] || 'brand') + '">' + window.icon(q.icon, 21) + '</span>' +
        '<div><h3>' + q.title + '</h3><p>' + q.desc + '</p></div>' +
        '<span class="quick-arrow">' + window.icon('arrowRight', 16) + '</span>' +
      '</a>';
    }).join('');
    // 无练习进度时，「继续上次学习」引导到题库
    if (!App.getPractice()) {
      const resume = host.querySelector('a[href*="resume=1"]');
      if (resume) resume.setAttribute('href', 'questions.html');
    }
  }

  function renderFeatures() {
    const host = App.qs('#featureGrid');
    if (!host) return;
    const tints = ['brand', 'purple', 'green', 'cyan'];
    host.innerHTML = H.features.map(function (f, i) {
      return '<a class="feature-card" href="' + f.href + '">' +
        '<span class="icon-tile ' + tints[i % tints.length] + '">' + window.icon(f.icon, 20) + '</span>' +
        '<h3>' + f.title + '</h3><p>' + f.desc + '</p>' +
        '<span class="feature-link">开始使用 ' + window.icon('arrowRight', 13) + '</span>' +
      '</a>';
    }).join('');
  }

  function renderChart() {
    const host = App.qs('#practiceChart');
    if (!host) return;
    const max = Math.max.apply(null, H.practice7days.map(d => d.value));
    host.innerHTML = H.practice7days.map(function (d) {
      const h = Math.round((d.value / max) * 100);
      return '<div class="bar-col' + (d.today ? ' today' : '') + '" tabindex="0" role="img" aria-label="' + d.label + '练习 ' + d.value + ' 题" data-tip="' + d.label + ' · ' + d.value + ' 题">' +
        (d.today ? '<span class="bar-value">' + d.value + '</span>' : '') +
        '<div class="bar-area"><span class="bar" style="height:' + h + '%"></span></div>' +
        '<span class="bar-label">' + d.label + '</span>' +
      '</div>';
    }).join('');
    const tbody = App.qs('#practiceChartTable tbody');
    if (tbody) {
      tbody.innerHTML = H.practice7days.map(d => '<tr><td>' + d.label + '</td><td>' + d.value + ' 题</td></tr>').join('');
    }
  }

  function renderHotSubjects() {
    const host = App.qs('#hotSubjectGrid');
    if (!host) return;
    host.innerHTML = H.hotSubjects.map(function (subjectId) {
      const subject = Data.helpers.getSubject(subjectId);
      if (!subject) return '';
      const questionCount = subject.stages.reduce((n, stage) => n + stage.questions.length, 0);
      return '<a class="stage-card" href="questions.html?subject=' + subject.id + '">' +
        '<span class="stage-icon" style="background:' + subject.tint + '">' + subject.icon + '</span>' +
        '<div><h4>' + subject.name + '</h4><div class="meta"><span>' + subject.stages.length + ' 个阶段</span><span class="dot-sep"></span><span>共 ' + questionCount + ' 道题</span></div></div>' +
        '<span class="stage-go">' + window.icon('arrowRight', 17) + '</span>' +
      '</a>';
    }).join('');
  }

  function initOnboarding() {
    if (App.storage.get(App.KEYS.guide, false)) return;
    const steps = [
      { icon: 'compass', title: '选择技术方向', desc: '8 大 AI 技术方向，从智能体应用到大模型开发，找到最适合你的成长路径。', tint: 'brand' },
      { icon: 'edit', title: '开始刷题练习', desc: '顺序或随机模式，覆盖单选、多选、判断与简答。AI 批改简答，答错自动进入错题本。', tint: 'green' },
      { icon: 'mic', title: 'AI 面试检验', desc: '模拟真实面试，逐题作答、实时评分，结束后生成能力报告，针对性补强。', tint: 'purple' },
    ];
    let index = 0;
    const body =
      '<div class="modal-desc" style="margin-bottom:16px">三步开启你的 AI 学习之旅</div>' +
      '<div class="row gap-6" id="guideDots" style="margin-bottom:20px"></div>' +
      '<div id="guideStep"></div>';
    const modal = App.openModal({
      title: '欢迎来到云枢智学',
      size: '',
      body: body,
      footer:
        '<button class="btn btn-ghost" data-skip>跳过引导</button>' +
        '<button class="btn btn-primary" data-next>下一步 <span data-icon="arrowRight" data-icon-size="15"></span></button>',
      onMount: function (layer, close) {
        function render() {
          const s = steps[index];
          layer.querySelector('#guideDots').innerHTML = steps.map(function (_, i) {
            return '<span style="height:4px;border-radius:99px;flex:1;background:' + (i === index ? 'var(--brand-500)' : i < index ? 'var(--brand-200)' : 'var(--line)') + '"></span>';
          }).join('');
          layer.querySelector('#guideStep').innerHTML =
            '<div class="icon-tile ' + s.tint + '" style="width:60px;height:60px;border-radius:18px;margin-bottom:16px">' + window.icon(s.icon, 27) + '</div>' +
            '<h3 style="font-size:19px">' + s.title + '</h3>' +
            '<p style="font-size:12.5px;color:var(--muted);line-height:1.8;margin-top:8px">' + s.desc + '</p>';
          const next = layer.querySelector('[data-next]');
          next.innerHTML = index === steps.length - 1
            ? '开始学习 <span data-icon="arrowRight" data-icon-size="15"></span>'
            : '下一步 <span data-icon="arrowRight" data-icon-size="15"></span>';
          window.hydrateIcons(next);
        }
        function finish(go) {
          App.storage.set(App.KEYS.guide, true);
          close();
          if (go) location.href = 'questions.html';
        }
        render();
        layer.querySelector('[data-next]').addEventListener('click', function () {
          if (index < steps.length - 1) { index += 1; render(); }
          else finish(true);
        });
        layer.querySelector('[data-skip]').addEventListener('click', function () { finish(false); });
      },
    });
    return modal;
  }

  function init() {
    renderHeroStats();
    renderQuick();
    renderFeatures();
    renderChart();
    renderHotSubjects();
    initOnboarding();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
