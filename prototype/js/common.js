/* ============================================================
   云枢智学 · 公共脚本
   - 图标库（icons）
   - 模拟数据（CloudData）
   - 工具函数 / 弹窗 / Toast / 数据仓库
   ============================================================ */

/* 云枢智学 · 内联 SVG 图标库（无外部依赖） */
(function () {
  const P = {
    home: '<path d="M3 10.6 12 3l9 7.6"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    route: '<circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="5.5" r="2.5"/><path d="M8 18.5h5a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h7"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    bookOpen: '<path d="M12 6.5C10 4.5 7 4 3 5v14c4-1 7-.5 9 1.5 2-2 5-2.5 9-1.5V5c-4-1-7-.5-9 1.5Z"/><path d="M12 6.5v14.5"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5M8 22h8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chart: '<path d="M3 21V3"/><path d="M3 21h18"/><path d="m7 15 4-5 3 3 5-7"/>',
    barChart: '<path d="M3 21V3M3 21h18"/><rect x="6" y="12" width="3" height="6" rx="1"/><rect x="11" y="8" width="3" height="10" rx="1"/><rect x="16" y="5" width="3" height="13" rx="1"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
    log: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M9.9 4.24A9.9 9.9 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/><path d="M6.61 6.61A18.5 18.5 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.39-1.61"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="m2 2 20 20"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowUp: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    arrowDown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    arrowUpRight: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M9 2h6"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    play: '<path d="m7 4 13 8-13 8Z"/>',
    pause: '<path d="M9 4v16M15 4v16"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
    volumeOff: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    star: '<path d="m12 2.5 2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.6 6.2 20.5l1.1-6.5L2.5 9.4l6.6-1Z"/>',
    award: '<circle cx="12" cy="8" r="5.5"/><path d="m8.5 12.5-1 9L12 19l4.5 2.5-1-9"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r=".8"/><circle cx="3.5" cy="12" r=".8"/><circle cx="3.5" cy="18" r=".8"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5Z"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    sparkles: '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="m19 15.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    trendingUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M21 7v6h-6"/>',
    trendingDown: '<path d="m3 7 6 6 4-4 8 8"/><path d="M21 17v-6h-6"/>',
    alert: '<path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    alertCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    xCircle: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m16 10 6-3v10l-6-3"/>',
    code: '<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>',
    clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2"/><path d="M9 10h6M9 14h6M9 18h4"/>',
    folderOpen: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1"/><path d="M3 9h18l-2 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    zap: '<path d="M13 2 3 14h8l-1 8 10-12h-8Z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 8.8-8.8M16 7l3 3M19 4l1.5 1.5"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
    maximize: '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19.5" r=".8"/>',
    wifiOff: '<path d="m2 2 20 20"/><path d="M8.5 16a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19.5" r=".8"/><path d="M5 12.5a10 10 0 0 1 5-2.7"/><path d="M14 9.8a10 10 0 0 1 5 2.7"/>',
    graduation: '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/><path d="M22 9v6"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
    flag: '<path d="M4 22V3"/><path d="M4 4h13l-2 4 2 4H4"/>',
    heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2Z"/>',
    package: '<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/>',
    tag: '<path d="M20.6 13.4 12 22l-9-9 8.6-8.6a2 2 0 0 1 1.4-.6H20a2 2 0 0 1 2 2v6.2a2 2 0 0 1-.6 1.4Z"/><circle cx="17" cy="7" r="1.2"/>',
    camera: '<path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="3.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.8 2.1c-.8.5-1.3 1-1.3 2.1"/><path d="M12 17h.01"/>',
    shuffle: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="M4 4l5 5"/>',
    sort: '<path d="M8 6h13M8 12h9M8 18h5"/><path d="M4 5v14"/><path d="m2 17 2 2 2-2"/>',
    dot: '<circle cx="12" cy="12" r="3"/>',
    minus: '<path d="M5 12h14"/>',
  };

  function icon(name, size, cls) {
    const body = P[name] || P.dot;
    const s = size || 18;
    return '<svg class="icon ' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      const name = el.getAttribute('data-icon');
      const size = Number(el.getAttribute('data-icon-size')) || 18;
      el.removeAttribute('data-icon');
      if (!el.querySelector('svg')) {
        el.insertAdjacentHTML('afterbegin', icon(name, size));
      }
    });
  }

  window.icon = icon;
  window.hydrateIcons = hydrateIcons;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hydrateIcons(document); });
  } else {
    hydrateIcons(document);
  }
})();


/* ---------------- 模拟数据 ---------------- */
/* 云枢智学 · Mock 数据
   所有页面共用，纯前端演示数据；后台可编辑数据由 common.js 的 DB 持久化。 */
(function () {
  'use strict';

  const DIRECTION_META = [
    { id: 'agent', name: 'AI应用与智能体开发', icon: '🤖', color: '#6366F1', tint: '#EEF0FF', short: '智能体应用' },
    { id: 'llm', name: 'AI大模型开发', icon: '🧠', color: '#8B5CF6', tint: '#F3EFFF', short: '大模型研发' },
    { id: 'embodied', name: 'AI具身智能机器人开发', icon: '🦾', color: '#06B6D4', tint: '#ECFEFF', short: '具身智能' },
    { id: 'embedded', name: 'AI嵌入式_机器人开发', icon: '🔌', color: '#F59E0B', tint: '#FFFBEB', short: '嵌入式' },
    { id: 'testing', name: 'AI测试', icon: '🧪', color: '#10B981', tint: '#ECFDF5', short: 'AI 测试' },
    { id: 'ops', name: 'AI运维', icon: '🛠️', color: '#3B82F6', tint: '#EFF6FF', short: 'AI 运维' },
    { id: 'visual', name: 'AI视觉设计', icon: '🎨', color: '#EC4899', tint: '#FDF2F8', short: '视觉设计' },
    { id: 'video', name: 'AI视频与短剧创作', icon: '🎬', color: '#F97316', tint: '#FFF7ED', short: '视频创作' },
  ];

  const TYPE_LABEL = { single: '单选题', multiple: '多选题', boolean: '判断题', short: '简答题' };
  const DIFF_LABEL = { easy: '简单', medium: '中等', hard: '困难' };

  const Q = (id, subjectId, stageId, type, difficulty, stem, opts, answer, explanation, tags, attempts, correctRate, keyPoints) => ({
    id, subjectId, stageId, type, difficulty, stem,
    options: type === 'boolean'
      ? [{ key: 'A', text: '正确' }, { key: 'B', text: '错误' }]
      : (opts || []).map((text, i) => ({ key: String.fromCharCode(65 + i), text })),
    answer: Array.isArray(answer) ? answer : [answer],
    explanation: explanation || '',
    tags: tags || [],
    attempts: attempts || 0,
    correctRate: correctRate || 0,
    keyPoints: keyPoints || [],
    answerText: type === 'short' ? answer : '',
  });

  /* ---------------- 题目 ---------------- */
  const AGENT_LLM = [
    Q('q-agent-01', 'agent', 'agent-llm', 'single', 'easy',
      '在 Transformer 架构中，自注意力机制（Self-Attention）的核心作用是？',
      ['捕获序列内部任意位置之间的依赖关系', '增加模型的参数规模', '替代位置编码', '降低模型训练难度'],
      'A',
      '自注意力通过 Query、Key、Value 的点积计算，让序列中每个位置都能直接关注其他位置，从而建模长距离依赖。',
      ['Transformer', '注意力机制'], 1286, 82),
    Q('q-agent-02', 'agent', 'agent-llm', 'multiple', 'medium',
      '以下哪些做法可以缓解大模型的“幻觉”问题？',
      ['使用 RAG 检索增强生成', '要求模型给出推理过程并进行结果校验', '调高 temperature 让输出更丰富', '在提示词中限定回答范围与拒答条件'],
      ['A', 'B', 'D'],
      'RAG 提供可核对的外部事实，思维链与结果校验能暴露推理漏洞，限定范围可减少模型编造。调高 temperature 只会增加随机性，通常加剧幻觉。',
      ['幻觉', 'RAG', '提示词'], 964, 68),
    Q('q-agent-03', 'agent', 'agent-llm', 'boolean', 'easy',
      '在大模型调用中，temperature 参数越高，模型输出通常越随机。',
      null, 'A',
      'temperature 控制采样分布的平滑程度，数值越高，低概率词被选中的机会越大，输出更随机、更发散。',
      ['参数调优'], 1520, 91),
    Q('q-agent-04', 'agent', 'agent-llm', 'short', 'medium',
      '请简述 RAG（检索增强生成）的基本流程。',
      null,
      '先将文档切分并向量化存入向量库；用户提问时对问题做向量化检索，召回相关片段；将召回内容与问题一起组装为提示词，交给大模型生成答案；最后可加入引用与校验环节。',
      'RAG 的关键是“先检索、再生成”，通过外部知识增强模型回答的准确性与可追溯性。',
      ['RAG', '向量检索'], 738, 74,
      ['文档切分与向量化入库', '问题向量化并召回 Top-K 片段', '拼接上下文与提示词', '生成答案并标注引用']),
    Q('q-agent-05', 'agent', 'agent-llm', 'single', 'medium',
      'LoRA（Low-Rank Adaptation）微调的主要优势是？',
      ['只训练少量低秩参数，显著降低显存与训练成本', '必须全量更新模型参数', '只能用于视觉模型', '完全不需要训练数据'],
      'A',
      'LoRA 在权重矩阵旁插入低秩分解矩阵，只训练这部分参数，因此训练成本低、易切换，并可合并回原模型。',
      ['LoRA', '模型微调'], 1102, 79),
    Q('q-agent-06', 'agent', 'agent-llm', 'multiple', 'medium',
      '一个典型的 AI Agent 通常包含哪些核心组件？',
      ['规划（Planning）', '记忆（Memory）', '工具调用（Tool Use）', '仅依赖固定规则'],
      ['A', 'B', 'C'],
      '规划负责拆解任务，记忆保存上下文与经验，工具调用让 Agent 能与外部系统交互。固定规则属于传统程序逻辑，不是 Agent 的核心组件。',
      ['Agent', '架构设计'], 880, 84),
    Q('q-agent-07', 'agent', 'agent-llm', 'boolean', 'medium',
      'Prompt 越长，模型回答效果一定越好。',
      null, 'B',
      '过长的提示词会引入噪声、占用上下文窗口并增加成本，效果取决于信息相关性与结构，而非长度本身。',
      ['Prompt 工程'], 1340, 57),
    Q('q-agent-08', 'agent', 'agent-llm', 'short', 'hard',
      '请说明你会如何设计一个 AI 客服智能体的工具调用流程。',
      null,
      '先明确工具清单与调用权限，对工具做参数校验与超时控制；由模型输出结构化的工具调用意图，服务端执行后返回结果并写入上下文；对失败场景设计重试、降级与人工转接；全过程记录日志与调用链，便于审计与优化。',
      '可靠的工具调用需要同时考虑权限、幂等、超时、降级与可观测性，不能只依赖模型自行判断。',
      ['Agent', '工具调用', '系统设计'], 512, 61,
      ['工具注册与权限边界', '结构化调用与参数校验', '超时、重试与降级', '人工转接与审计日志']),
  ];

  const AGENT_PROMPT = [
    Q('q-agent-09', 'agent', 'agent-prompt', 'single', 'easy',
      'Few-shot Prompting 指的是？',
      ['在提示词中给出少量示例，引导模型按示例完成任务', '把模型温度调到最低', '对模型进行全量微调', '只给模型一个关键词'],
      'A',
      'Few-shot 通过在提示词中加入若干输入输出示例，让模型在不更新参数的情况下学习任务模式。',
      ['Prompt 工程'], 860, 88),
    Q('q-agent-10', 'agent', 'agent-prompt', 'single', 'medium',
      '思维链（Chain-of-Thought）提示最适合下列哪种任务？',
      ['需要多步推理的数学应用题', '简单的关键词抽取', '固定格式的文本翻译', '图片分类'],
      'A',
      '思维链通过引导模型展示中间推理步骤，适合数学、逻辑、多步规划等复杂任务；简单任务使用反而增加成本。',
      ['Prompt 工程', '思维链'], 704, 76),
    Q('q-agent-11', 'agent', 'agent-prompt', 'multiple', 'medium',
      '一份结构化的提示词通常应包含哪些要素？',
      ['角色与目标', '输入与上下文', '输出格式约束', '与任务无关的闲聊'],
      ['A', 'B', 'C'],
      '清晰的提示词应说明角色、任务目标、输入信息与输出格式，必要时加入示例和边界条件。无关内容会增加噪声。',
      ['Prompt 工程'], 932, 83),
    Q('q-agent-12', 'agent', 'agent-prompt', 'short', 'medium',
      '如何降低提示词注入（Prompt Injection）带来的风险？',
      null,
      '将系统指令与用户输入严格分层，不要把用户内容直接拼接进高优先级指令；对输入做敏感指令过滤；工具调用前校验参数与权限；对输出做结构化校验；高风险操作引入人工确认。',
      '提示词注入无法仅靠提示词解决，需要结合输入隔离、权限控制与输出校验等工程手段。',
      ['Prompt 工程', '安全'], 438, 59,
      ['系统指令与用户输入隔离', '输入过滤与权限校验', '结构化输出校验', '高风险操作人工确认']),
  ];

  const AGENT_BUILD = [
    Q('q-agent-13', 'agent', 'agent-build', 'single', 'medium',
      'ReAct 模式的核心思想是？',
      ['让模型交替进行推理（Reasoning）与行动（Acting）', '只做一次性推理', '把所有工具都调用一遍', '完全禁用外部工具'],
      'A',
      'ReAct 让模型在“思考—行动—观察”的循环中逐步推进任务，根据工具返回结果调整后续推理。',
      ['Agent', 'ReAct'], 612, 81),
    Q('q-agent-14', 'agent', 'agent-build', 'multiple', 'hard',
      '多智能体协作中常见的模式包括？',
      ['主从编排（Orchestrator-Worker）', '角色分工与辩论', '共享黑板协作', '完全随机地并发执行'],
      ['A', 'B', 'C'],
      '主从编排由协调者分派任务，角色分工让不同 Agent 承担专长，共享黑板通过公共状态协同。随机并发缺少协调，通常不可取。',
      ['多智能体', '架构设计'], 366, 64),
    Q('q-agent-15', 'agent', 'agent-build', 'short', 'hard',
      '请说明你会如何设计 Agent 的记忆机制。',
      null,
      '区分短期记忆与长期记忆：短期记忆保存当前会话上下文，长期记忆沉淀用户偏好与历史经验；对记忆做结构化存储与摘要压缩，设置重要性与过期策略；检索时按相关性与时效性召回，并提供记忆写入、更新与删除能力。',
      '记忆设计的关键是“存得下、找得到、用得上、可治理”，同时要避免把无关信息带入上下文。',
      ['Agent', '记忆机制'], 298, 55,
      ['短期会话记忆', '长期记忆与摘要压缩', '按相关性与时效召回', '写入、更新与删除治理']),
  ];

  const LLM_TRANS = [
    Q('q-llm-01', 'llm', 'llm-transformer', 'single', 'medium',
      'KV Cache 在自回归推理中的主要作用是？',
      ['缓存历史 Token 的 Key/Value，避免重复计算', '减少模型参数量', '替代注意力机制', '提高训练数据质量'],
      'A',
      '自回归生成时每一步只新增一个 Token，缓存历史 K/V 可避免对已生成内容重复做注意力计算，显著降低推理延迟。',
      ['KV Cache', '推理优化'], 842, 72),
    Q('q-llm-02', 'llm', 'llm-transformer', 'boolean', 'easy',
      '位置编码的作用是向模型注入序列中 Token 的顺序信息。',
      null, 'A',
      '自注意力本身对位置不敏感，位置编码（正弦式或可学习式）用于让模型感知 Token 的先后顺序。',
      ['位置编码'], 926, 87),
    Q('q-llm-03', 'llm', 'llm-transformer', 'short', 'hard',
      '请解释 Transformer 中多头注意力（Multi-Head Attention）的意义。',
      null,
      '多头注意力将 Query、Key、Value 投影到多个子空间，并行计算多组注意力，使模型能在不同表示子空间中关注不同的语义关系；最后拼接各头输出并做线性变换，提升表达能力与稳定性。',
      '多头机制让模型同时从多个角度建模依赖关系，而不是只学习单一注意力模式。',
      ['多头注意力', 'Transformer'], 534, 69,
      ['多个子空间并行注意力', '捕捉不同语义关系', '拼接后线性变换', '提升表达能力']),
  ];

  const LLM_FINETUNE = [
    Q('q-llm-04', 'llm', 'llm-finetune', 'multiple', 'medium',
      '关于全量微调与 PEFT（参数高效微调），下列说法正确的是？',
      ['全量微调需要更新全部参数，成本更高', 'LoRA 属于常见的 PEFT 方法', 'PEFT 通常需要更少的显存', 'PEFT 完全无法达到全量微调的效果'],
      ['A', 'B', 'C'],
      'PEFT 只训练少量附加参数，显存与存储成本更低，许多场景下效果可接近全量微调；“完全无法达到”过于绝对。',
      ['模型微调', 'PEFT'], 688, 78),
    Q('q-llm-05', 'llm', 'llm-finetune', 'short', 'medium',
      '什么场景下你会优先选择 LoRA 而不是全量微调？',
      null,
      '当显存与训练预算有限、需要快速迭代多个任务版本、基座模型较大或需要保留原始能力时，优先选择 LoRA；当数据量充足、任务与基座差异极大且追求极致效果时，再考虑全量微调。',
      '方法选择应综合数据规模、算力预算、迭代速度与效果要求，而不是一味追求全量更新。',
      ['LoRA', '模型微调'], 476, 73,
      ['显存与预算有限', '多任务快速迭代', '保留基座能力', '数据与任务差异评估']),
  ];

  const EMBODIED_KINEMATICS = [
    Q('q-embodied-01', 'embodied', 'embodied-kinematics', 'single', 'medium',
      '机器人逆运动学（IK）主要解决什么问题？',
      ['已知末端位姿，求解各关节角度', '已知关节角度，求末端位姿', '计算机器人质量', '规划电池电量'],
      'A',
      '正运动学由关节角求末端位姿，逆运动学则根据期望末端位姿反解关节角，是轨迹规划与控制的基础。',
      ['运动学', '机器人'], 522, 76),
    Q('q-embodied-02', 'embodied', 'embodied-kinematics', 'short', 'medium',
      '请简述 ROS2 中节点之间常用的通信方式及适用场景。',
      null,
      '话题（Topic）适合持续的数据流，如传感器数据；服务（Service）适合请求-响应式的一次性调用；动作（Action）适合带反馈和可取消的长任务；参数（Parameter）用于配置管理。',
      '选择通信方式时应考虑数据频率、是否需要反馈、是否可取消以及耦合程度。',
      ['ROS2', '通信机制'], 384, 71,
      ['Topic 持续数据流', 'Service 请求响应', 'Action 长任务与反馈', 'Parameter 配置管理']),
  ];

  const EMBODIED_PERCEPTION = [
    Q('q-embodied-03', 'embodied', 'embodied-perception', 'multiple', 'medium',
      '具身智能机器人常用的环境感知传感器包括？',
      ['激光雷达 LiDAR', '深度相机', 'IMU 惯性测量单元', '打印机'],
      ['A', 'B', 'C'],
      'LiDAR、深度相机与 IMU 分别提供几何、视觉与姿态信息，常通过多传感器融合提升感知鲁棒性。',
      ['传感器', '多传感器融合'], 446, 89),
    Q('q-embodied-04', 'embodied', 'embodied-perception', 'short', 'hard',
      '如何提升机器人在动态环境中的决策鲁棒性？',
      null,
      '提高感知频率与多传感器冗余，建立环境动态预测；在规划层引入滚动时域与安全边界，保留可恢复的备选策略；通过仿真与真实场景的域随机化训练策略；线上持续监控异常并支持人工接管。',
      '动态环境下的鲁棒性来自“感知冗余 + 预测 + 安全约束 + 可恢复机制”的组合。',
      ['决策规划', '鲁棒性'], 268, 58,
      ['感知冗余与动态预测', '滚动规划与安全边界', '域随机化训练', '异常监控与人工接管']),
  ];

  const EMBEDDED_BASICS = [
    Q('q-embedded-01', 'embedded', 'embedded-basics', 'single', 'easy',
      '与裸机程序相比，RTOS 的主要优势是？',
      ['提供任务调度、同步与资源管理机制', '一定能让程序运行更快', '不需要考虑内存', '只能运行在 PC 上'],
      'A',
      'RTOS 提供多任务调度、信号量、队列等机制，便于构建复杂的实时系统；是否更快取决于具体场景。',
      ['RTOS', '嵌入式'], 632, 84),
    Q('q-embedded-02', 'embedded', 'embedded-basics', 'short', 'medium',
      '编写中断服务程序（ISR）时有哪些注意事项？',
      null,
      'ISR 应尽量短小，避免阻塞与浮点运算；不要在 ISR 中调用不可重入函数；通过标志位或队列把耗时处理交给任务；注意临界区保护与中断优先级；共享数据需使用原子操作或同步机制。',
      'ISR 的核心原则是“快进快出”，把复杂逻辑推迟到任务上下文处理。',
      ['中断', 'RTOS'], 508, 67,
      ['保持短小、避免阻塞', '不调用不可重入函数', '耗时逻辑移交任务', '临界区与优先级管理']),
  ];

  const EMBEDDED_EDGE = [
    Q('q-embedded-03', 'embedded', 'embedded-edge', 'multiple', 'medium',
      '边缘 AI 部署中常用的模型优化手段包括？',
      ['模型量化', '剪枝', '知识蒸馏', '无限增加模型层数'],
      ['A', 'B', 'C'],
      '量化降低数值精度，剪枝移除冗余连接，蒸馏用大模型指导小模型；盲目加深模型只会增加计算量。',
      ['边缘 AI', '模型优化'], 584, 86),
    Q('q-embedded-04', 'embedded', 'embedded-edge', 'short', 'medium',
      '模型量化对精度和推理速度分别有什么影响？',
      null,
      '量化将浮点权重/激活转为低比特整数，可减少模型体积与内存带宽、提升推理速度；但会引入量化误差，精度可能下降，需要通过校准、混合精度或量化感知训练来平衡。',
      '量化的收益是体积与速度，风险是精度损失，工程上要结合硬件支持与任务容忍度评估。',
      ['量化', '边缘 AI'], 392, 75,
      ['降低体积与内存带宽', '提升推理速度', '引入量化误差', '校准与量化感知训练']),
  ];

  const TESTING_BASICS = [
    Q('q-testing-01', 'testing', 'testing-basics', 'single', 'easy',
      '与传统软件测试相比，AI 系统测试最显著的差异是？',
      ['输出具有概率性与非确定性，难以用固定断言判定', '完全不需要测试', '只需要测试界面', '测试用例越少越好'],
      'A',
      'AI 系统输出受模型与数据影响，同一输入可能得到不同结果，因此需要评测集、指标与人工评估结合。',
      ['AI 测试'], 714, 81),
    Q('q-testing-02', 'testing', 'testing-basics', 'multiple', 'medium',
      '评估大模型输出质量的常用方法包括？',
      ['人工评分', '基于规则的自动断言', 'LLM-as-a-Judge', '只看响应时间'],
      ['A', 'B', 'C'],
      '人工评分适合主观质量，规则断言适合格式与事实校验，模型评审可扩展评测规模；响应时间属于性能指标，不能代表质量。',
      ['模型评测', 'AI 测试'], 638, 77),
  ];

  const TESTING_EVAL = [
    Q('q-testing-03', 'testing', 'testing-eval', 'short', 'medium',
      '如何为一个 RAG 系统设计评测集？',
      null,
      '从真实用户问题与业务文档中采样，覆盖单跳、多跳、无答案与对抗性问题；为每题标注标准答案与依据文档；分层设置难度与主题；定期补充线上新问题，并同时评估检索召回与生成质量。',
      'RAG 评测要同时看“检索是否召回正确依据”和“生成是否忠实于依据”，并覆盖拒答场景。',
      ['RAG', '评测集'], 352, 66,
      ['真实问题与文档采样', '覆盖多跳/无答案/对抗问题', '标注答案与依据', '检索与生成分开评估']),
    Q('q-testing-04', 'testing', 'testing-eval', 'single', 'medium',
      '关于离线评测与在线评测，下列说法正确的是？',
      ['离线评测可快速回归，在线评测更接近真实业务效果', '两者完全等价', '在线评测不需要埋点', '离线评测可以替代所有线上监控'],
      'A',
      '离线评测成本低、可重复，适合迭代回归；在线评测通过真实流量与业务指标验证效果，两者应配合使用。',
      ['模型评测', 'A/B 测试'], 426, 80),
  ];

  const OPS_INFRA = [
    Q('q-ops-01', 'ops', 'ops-infra', 'single', 'medium',
      '大模型推理时出现 GPU 显存不足，优先排查的方向是？',
      ['批量大小、序列长度与 KV Cache 占用', '显示器分辨率', '键盘布局', '浏览器缓存'],
      'A',
      '显存主要被模型权重、激活值、KV Cache 与批处理占用；增大 batch 或上下文长度会显著提高峰值显存。',
      ['GPU', '推理优化'], 592, 78),
    Q('q-ops-02', 'ops', 'ops-infra', 'multiple', 'medium',
      '衡量 AI 推理服务性能时常用的指标包括？',
      ['首 Token 延迟（TTFT）', '每秒输出 Token 数（TPS）', 'P99 响应延迟', '页面背景色'],
      ['A', 'B', 'C'],
      'TTFT 反映交互响应速度，TPS 反映吞吐，P99 延迟反映长尾体验；颜色与性能无关。',
      ['推理服务', '监控指标'], 488, 82),
  ];

  const OPS_MLOPS = [
    Q('q-ops-03', 'ops', 'ops-mlops', 'short', 'medium',
      'MLOps 的核心环节有哪些？',
      null,
      '包括数据准备与版本管理、实验跟踪、模型训练与评测、模型注册与打包、部署发布、线上监控与漂移检测，以及基于反馈的持续迭代；同时需要权限、审计与成本治理。',
      'MLOps 不只是部署，而是覆盖“数据—训练—评测—发布—监控—迭代”的全生命周期。',
      ['MLOps'], 376, 70,
      ['数据与实验管理', '训练评测与模型注册', '部署发布', '监控漂移与持续迭代']),
    Q('q-ops-04', 'ops', 'ops-mlops', 'single', 'medium',
      '模型漂移（Model Drift）最直接的发现方式是？',
      ['持续监控输入分布与业务指标的变化', '每周重启一次服务器', '增加显示器数量', '关闭日志采集'],
      'A',
      '数据漂移会先反映在输入特征分布上，概念漂移则会反映在业务指标上，持续监控才能及时发现。',
      ['模型漂移', '监控'], 402, 79),
  ];

  const VISUAL_CREATIVE = [
    Q('q-visual-01', 'visual', 'visual-creative', 'single', 'easy',
      '在 AIGC 视觉设计中，ControlNet 的主要作用是？',
      ['对生成图像的构图、姿态或边缘等结构进行精确控制', '提升显卡帧率', '自动撰写文案', '压缩图片体积'],
      'A',
      'ControlNet 通过额外条件（如边缘、深度、姿态）约束扩散模型生成，提升结构可控性。',
      ['AIGC', 'ControlNet'], 542, 83),
    Q('q-visual-02', 'visual', 'visual-creative', 'short', 'medium',
      '如何保持系列视觉作品中的风格一致性？',
      null,
      '建立统一的提示词模板与负面词库，固定模型、采样器与关键参数；使用风格参考图、LoRA 或 IP-Adapter 约束风格；沉淀品牌色板、字体与构图规范；批量生成后统一做色彩与版式校正。',
      '一致性来自“可复用的风格资产 + 稳定的生成参数 + 后期统一校正”。',
      ['风格一致性', 'AIGC'], 318, 68,
      ['统一提示词与参数', '参考图/LoRA 约束', '品牌规范沉淀', '后期统一校正']),
  ];

  const VISUAL_BUSINESS = [
    Q('q-visual-03', 'visual', 'visual-business', 'multiple', 'medium',
      '商业视觉方案交付前通常需要检查哪些内容？',
      ['品牌色与字体是否符合规范', '不同尺寸下的版式适配', '图片版权与素材授权', '只看第一眼是否好看'],
      ['A', 'B', 'C'],
      '商业交付需要兼顾品牌规范、多端适配与版权合规，不能只凭主观审美判断。',
      ['商业设计', '品牌规范'], 362, 84),
    Q('q-visual-04', 'visual', 'visual-business', 'short', 'medium',
      '请描述一次从客户 brief 到视觉交付的完整流程。',
      null,
      '先澄清目标受众、使用场景与品牌规范，拆解关键信息；据此产出情绪板与 2-3 个方向草案；与客户评审后收敛方向，细化主视觉与延展物料；最后做多尺寸适配、版权核查与交付规范说明。',
      '成熟流程的关键是前期对齐目标、中期快速验证方向、后期规范交付。',
      ['设计流程', '项目管理'], 274, 72,
      ['澄清 brief 与规范', '情绪板与方向草案', '评审收敛', '延展适配与交付']),
  ];

  const VIDEO_GENERATION = [
    Q('q-video-01', 'video', 'video-generation', 'single', 'medium',
      '在 AI 视频生成中，首尾帧控制的主要作用是？',
      ['约束镜头起点与终点的画面，提升叙事连贯性', '增加视频码率', '自动生成字幕', '降低显卡温度'],
      'A',
      '指定首帧与尾帧可以让模型在两个确定画面之间过渡，便于控制镜头运动与剧情衔接。',
      ['视频生成', '首尾帧'], 476, 76),
    Q('q-video-02', 'video', 'video-generation', 'short', 'medium',
      '提升 AI 生成视频中角色与场景一致性的方法有哪些？',
      null,
      '建立角色参考图与固定描述模板，使用角色一致性模型或 LoRA；保持场景提示词、光线与色调一致；分镜拆分后在后期统一调色；必要时用首尾帧与运镜控制衔接。',
      '一致性需要在“角色资产、提示词模板、镜头衔接、后期校正”四个层面共同保证。',
      ['一致性', '视频生成'], 342, 65,
      ['角色参考图与固定描述', '一致性模型/LoRA', '统一场景与光影', '后期调色与镜头衔接']),
  ];

  const VIDEO_DRAMA = [
    Q('q-video-03', 'video', 'video-drama', 'multiple', 'medium',
      'AI 短剧的分镜脚本通常需要包含哪些要素？',
      ['镜号与景别', '画面描述与台词', '时长与转场方式', '服务器型号'],
      ['A', 'B', 'C'],
      '分镜脚本用于指导画面生成与剪辑，需明确镜号、景别、画面内容、台词、时长与转场；服务器型号与创作无关。',
      ['分镜脚本', '短剧创作'], 298, 81),
    Q('q-video-04', 'video', 'video-drama', 'short', 'hard',
      '请简述如何用 AI 工作流完成一支 1 分钟短剧。',
      null,
      '先完成故事大纲与分镜脚本，确定角色与场景设定；用文生图/图生视频生成关键镜头，配合首尾帧与运镜控制；用语音合成生成对白与旁白，统一音色；剪辑阶段完成节奏、字幕、转场与调色；最后做一致性与版权检查。',
      'AI 短剧的核心是把创作拆成可控制的环节，并在剪辑阶段统一节奏与风格。',
      ['AI 短剧', '工作流'], 226, 58,
      ['大纲与分镜', '角色场景设定', '生成关键镜头', '配音剪辑与统一调色']),
  ];

  const SUBJECTS = [
    {
      ...DIRECTION_META[0],
      desc: '从大模型基础到智能体编排，掌握 AI 应用落地的完整链路，适合想成为 AI 应用工程师的你。',
      stages: [
        { id: 'agent-llm', name: '大模型基础', icon: '🧠', desc: 'Transformer、RAG、微调与 Agent 基础概念', questions: AGENT_LLM },
        { id: 'agent-prompt', name: 'Prompt 工程', icon: '✍️', desc: '提示词结构、思维链与安全防护', questions: AGENT_PROMPT },
        { id: 'agent-build', name: '智能体开发实战', icon: '🛠️', desc: 'ReAct、多智能体协作与记忆机制', questions: AGENT_BUILD },
      ],
      courseIds: ['c1', 'c2', 'c3'],
      quizCount: 15,
    },
    {
      ...DIRECTION_META[1],
      desc: '深入 Transformer、推理优化与模型微调，构建可落地的大模型工程能力。',
      stages: [
        { id: 'llm-transformer', name: 'Transformer 原理', icon: '⚡', desc: '注意力机制、位置编码与推理优化', questions: LLM_TRANS },
        { id: 'llm-finetune', name: '模型微调', icon: '🎛️', desc: '全量微调、LoRA 与参数高效微调', questions: LLM_FINETUNE },
      ],
      courseIds: ['c4', 'c5'],
      quizCount: 5,
    },
    {
      ...DIRECTION_META[2],
      desc: '融合机器人运动学、感知与决策，探索具身智能在真实世界中的应用。',
      stages: [
        { id: 'embodied-kinematics', name: '机器人运动学', icon: '🦿', desc: '正逆运动学与 ROS2 通信', questions: EMBODIED_KINEMATICS },
        { id: 'embodied-perception', name: '感知与决策', icon: '👁️', desc: '多传感器融合与动态环境决策', questions: EMBODIED_PERCEPTION },
      ],
      courseIds: ['c6', 'c7'],
      quizCount: 4,
    },
    {
      ...DIRECTION_META[3],
      desc: '在资源受限设备上部署 AI，打通嵌入式系统、实时控制与边缘推理。',
      stages: [
        { id: 'embedded-basics', name: '嵌入式系统基础', icon: '🔧', desc: 'RTOS、中断与底层开发', questions: EMBEDDED_BASICS },
        { id: 'embedded-edge', name: '边缘AI部署', icon: '📟', desc: '量化、剪枝与端侧推理', questions: EMBEDDED_EDGE },
      ],
      courseIds: ['c8', 'c9'],
      quizCount: 4,
    },
    {
      ...DIRECTION_META[4],
      desc: '面向 AI 系统的质量保障，覆盖评测体系、自动化测试与线上效果监控。',
      stages: [
        { id: 'testing-basics', name: 'AI测试基础', icon: '🧫', desc: 'AI 测试思维与常用方法', questions: TESTING_BASICS },
        { id: 'testing-eval', name: '模型评测', icon: '📊', desc: '评测集设计与离线/在线评测', questions: TESTING_EVAL },
      ],
      courseIds: ['c10'],
      quizCount: 4,
    },
    {
      ...DIRECTION_META[5],
      desc: '保障 AI 服务稳定运行，掌握 GPU 基础设施、推理服务与 MLOps 实践。',
      stages: [
        { id: 'ops-infra', name: 'AI基础设施', icon: '🖥️', desc: 'GPU、推理服务与性能监控', questions: OPS_INFRA },
        { id: 'ops-mlops', name: 'MLOps', icon: '♻️', desc: '模型生命周期与漂移监控', questions: OPS_MLOPS },
      ],
      courseIds: ['c11'],
      quizCount: 4,
    },
    {
      ...DIRECTION_META[6],
      desc: '用 AIGC 工具重塑视觉创意流程，从风格探索到商业项目交付。',
      stages: [
        { id: 'visual-creative', name: 'AI视觉创意', icon: '🖌️', desc: 'ControlNet、风格一致性与创意生成', questions: VISUAL_CREATIVE },
        { id: 'visual-business', name: '商业设计实战', icon: '💼', desc: '品牌规范、交付流程与版权合规', questions: VISUAL_BUSINESS },
      ],
      courseIds: ['c12'],
      quizCount: 4,
    },
    {
      ...DIRECTION_META[7],
      desc: '从分镜到成片，掌握 AI 视频生成与短剧创作的完整工作流。',
      stages: [
        { id: 'video-generation', name: 'AI视频生成', icon: '📹', desc: '首尾帧、一致性与运镜控制', questions: VIDEO_GENERATION },
        { id: 'video-drama', name: '短剧创作实战', icon: '🎭', desc: '分镜脚本与 AI 工作流', questions: VIDEO_DRAMA },
        { id: 'video-delivery', name: '商业化与交付', icon: '🚚', desc: '内容筹备中', questions: [] },
      ],
      courseIds: ['c13'],
      quizCount: 4,
    },
  ];

  const ALL_QUESTIONS = SUBJECTS.flatMap(s => s.stages.flatMap(st => st.questions));

  /* ---------------- 课程 ---------------- */
  const COURSE_SEED = [
    { id: 'c1', cover: '../assets/images/covers/c1.svg', title: 'LangChain 从入门到实战：构建你的第一个 Agent', subjectId: 'agent', duration: 380, bvid: 'BV1Qx4y1M7vA', playCount: 128000, source: 'B站', coverFrom: '#6366F1', coverTo: '#8B5CF6', emoji: '🦜', addedAt: '2025-09-12' },
    { id: 'c2', cover: '../assets/images/covers/c2.svg', title: 'RAG 检索增强生成全解析：原理、工程与评测', subjectId: 'agent', duration: 245, bvid: 'BV1Kp4y1N7bC', playCount: 96000, source: 'B站', coverFrom: '#0EA5E9', coverTo: '#6366F1', emoji: '📚', addedAt: '2025-09-20' },
    { id: 'c3', cover: '../assets/images/covers/c3.svg', title: '多智能体系统设计：从角色分工到协作编排', subjectId: 'agent', duration: 330, bvid: 'BV1Tq4y1P7dE', playCount: 61000, source: 'B站', coverFrom: '#7C3AED', coverTo: '#EC4899', emoji: '🤝', addedAt: '2025-10-02' },
    { id: 'c4', cover: '../assets/images/covers/c4.svg', title: 'Transformer 详解：注意力、位置编码与 KV Cache', subjectId: 'llm', duration: 490, bvid: 'BV1Lr4y1R7fG', playCount: 152000, source: 'B站', coverFrom: '#8B5CF6', coverTo: '#4F46E5', emoji: '🧠', addedAt: '2025-08-28' },
    { id: 'c5', cover: '../assets/images/covers/c5.svg', title: '大模型微调实战：LoRA 与 QLoRA 全流程', subjectId: 'llm', duration: 405, bvid: 'BV1Ms4y1T7hJ', playCount: 87000, source: 'B站', coverFrom: '#4F46E5', coverTo: '#06B6D4', emoji: '🎛️', addedAt: '2025-09-08' },
    { id: 'c6', cover: '../assets/images/covers/c6.svg', title: '机器人运动学与 ROS2 入门', subjectId: 'embodied', duration: 440, bvid: 'BV1Nt4y1V7kL', playCount: 58000, source: 'B站', coverFrom: '#06B6D4', coverTo: '#0EA5E9', emoji: '🦾', addedAt: '2025-09-15' },
    { id: 'c7', cover: '../assets/images/covers/c7.svg', title: '具身智能：感知、规划与决策', subjectId: 'embodied', duration: 315, bvid: 'BV1Pv4y1X7mN', playCount: 43000, source: 'B站', coverFrom: '#0891B2', coverTo: '#6366F1', emoji: '👁️', addedAt: '2025-10-06' },
    { id: 'c8', cover: '../assets/images/covers/c8.svg', title: '嵌入式 C 语言与 RTOS 实战', subjectId: 'embedded', duration: 540, bvid: 'BV1Rw4y1Z7pQ', playCount: 76000, source: 'B站', coverFrom: '#F59E0B', coverTo: '#EF4444', emoji: '🔧', addedAt: '2025-08-18' },
    { id: 'c9', cover: '../assets/images/covers/c9.svg', title: '边缘 AI 部署实战：量化、剪枝与端侧推理', subjectId: 'embedded', duration: 280, bvid: 'BV1Sx4y1B7rS', playCount: 39000, source: 'B站', coverFrom: '#D97706', coverTo: '#F59E0B', emoji: '📟', addedAt: '2025-10-10' },
    { id: 'c10', cover: '../assets/images/covers/c10.svg', title: 'AI 测试方法与工具链：从评测集到自动化', subjectId: 'testing', duration: 230, bvid: 'BV1Uy4y1D7tU', playCount: 51000, source: 'B站', coverFrom: '#10B981', coverTo: '#06B6D4', emoji: '🧪', addedAt: '2025-09-25' },
    { id: 'c11', cover: '../assets/images/covers/c11.svg', title: 'MLOps 从 0 到 1：模型上线与可观测性', subjectId: 'ops', duration: 305, bvid: 'BV1Wz4y1F7vW', playCount: 47000, source: 'B站', coverFrom: '#3B82F6', coverTo: '#8B5CF6', emoji: '♻️', addedAt: '2025-09-30' },
    { id: 'c12', cover: '../assets/images/covers/c12.svg', title: 'AIGC 视觉设计实战：风格、控制与商业交付', subjectId: 'visual', duration: 265, bvid: 'BV1Xa4y1H7xY', playCount: 68000, source: 'B站', coverFrom: '#EC4899', coverTo: '#8B5CF6', emoji: '🎨', addedAt: '2025-10-12' },
    { id: 'c13', cover: '../assets/images/covers/c13.svg', title: 'AI 短视频创作全流程：分镜、生成与剪辑', subjectId: 'video', duration: 210, bvid: 'BV1Yb4y1J7zA', playCount: 83000, source: 'B站', coverFrom: '#F97316', coverTo: '#EC4899', emoji: '🎬', addedAt: '2025-10-18' },
    { id: 'c14', cover: '../assets/images/covers/c14.svg', title: '大模型应用安全与合规指南', subjectId: 'other', duration: 185, bvid: 'BV1Zc4y1K7bB', playCount: 26000, source: '其他', coverFrom: '#64748B', coverTo: '#334155', emoji: '🛡️', addedAt: '2025-10-22' },
  ];

  /* ---------------- 学习路线 ---------------- */
  const ROADMAP_SEED = [
    { id: 'r1', name: 'AI 应用开发 90 天进阶路线', subjectId: 'agent', icon: '🚀', status: 'active', audience: '有 Python 基础、希望转型 AI 应用开发的同学', desc: '从大模型基础到 Agent 工程化落地，按课程顺序完成三次实战项目，建立完整的 AI 应用开发能力。', courseIds: ['c1', 'c2', 'c3'], updatedAt: '2025-10-20' },
    { id: 'r2', name: '大模型工程师成长路线', subjectId: 'llm', icon: '🧠', status: 'active', audience: '具备深度学习基础、想深入大模型底层的同学', desc: '先打牢 Transformer 与推理优化基础，再进入 LoRA 微调实战，形成从原理到落地的完整认知。', courseIds: ['c4', 'c5'], updatedAt: '2025-10-16' },
    { id: 'r3', name: 'AI 测试工程师入门路线', subjectId: 'testing', icon: '🧪', status: 'active', audience: '测试工程师、质量保障从业者', desc: '理解 AI 系统的非确定性特征，掌握评测集设计、自动化测试与线上效果监控方法。', courseIds: ['c10'], updatedAt: '2025-10-08' },
    { id: 'r4', name: 'AI 短剧创作实战路线', subjectId: 'video', icon: '🎬', status: 'disabled', audience: '内容创作者、短视频编导与设计从业者', desc: '从分镜脚本到 AI 生成与剪辑，完整体验一支 1 分钟短剧的工业化创作流程。', courseIds: ['c13'], updatedAt: '2025-10-21' },
  ];

  /* ---------------- 错题本 ---------------- */
  const MISTAKE_SEED = [
    { questionId: 'q-agent-02', wrongCount: 4, corrected: 1, mastered: false, lastWrong: '2026-11-09 21:32', userAnswer: ['A', 'C'] },
    { questionId: 'q-agent-05', wrongCount: 3, corrected: 0, mastered: false, lastWrong: '2026-11-09 20:58', userAnswer: ['B'] },
    { questionId: 'q-embodied-01', wrongCount: 3, corrected: 2, mastered: false, lastWrong: '2026-11-08 19:12', userAnswer: ['B'] },
    { questionId: 'q-llm-01', wrongCount: 2, corrected: 1, mastered: false, lastWrong: '2026-11-07 22:05', userAnswer: ['C'] },
    { questionId: 'q-testing-01', wrongCount: 2, corrected: 0, mastered: false, lastWrong: '2026-11-06 18:40', userAnswer: ['B'] },
    { questionId: 'q-ops-01', wrongCount: 1, corrected: 0, mastered: false, lastWrong: '2026-11-05 21:18', userAnswer: ['D'] },
    { questionId: 'q-visual-01', wrongCount: 1, corrected: 3, mastered: true, lastWrong: '2026-11-03 16:22', userAnswer: ['B'] },
    { questionId: 'q-agent-01', wrongCount: 1, corrected: 3, mastered: true, lastWrong: '2026-11-02 20:10', userAnswer: ['C'] },
  ];

  /* ---------------- AI 面试题 ---------------- */
  const INTERVIEW_SETS = {
    agent: [
      '请介绍一个你实际做过的 AI Agent 项目，并说明它解决了什么业务问题。',
      '如果让你设计一个支持工具调用的客服 Agent，你会如何规划工具与权限边界？',
      'RAG 与微调分别适合什么场景？请结合项目说明你的选择。',
      'Agent 出现工具调用失败时，你会如何设计重试与降级策略？',
      '如何评估一个智能体系统的效果？你会关注哪些指标？',
      '多智能体协作有哪些常见模式？各自的优缺点是什么？',
    ],
    llm: [
      '请解释 Transformer 中自注意力的计算过程，以及它的复杂度来源。',
      '你在项目中如何选择全量微调、LoRA 或 Prompt Engineering？',
      '大模型推理显存占用主要来自哪些部分？有哪些优化手段？',
      '如何设计一套模型效果评测方案？离线与在线指标如何配合？',
      '遇到模型输出不稳定时，你会如何定位和缓解？',
      '请介绍一次你处理长上下文或 RAG 召回质量问题的经历。',
    ],
    embodied: [
      '请解释机器人正运动学与逆运动学的区别及典型应用。',
      '在 ROS2 中，你会如何设计一个感知到控制的完整数据链路？',
      '多传感器融合有哪些常见方案？如何做时间同步？',
      '动态环境中，机器人规划失败时你会如何恢复？',
      '如何评估一个具身智能策略在真实场景中的鲁棒性？',
      '请介绍一个你参与过的机器人项目及你的核心贡献。',
    ],
    embedded: [
      '在资源受限的嵌入式设备上部署 AI 模型，你会做哪些优化？',
      '请说明 RTOS 中任务优先级与中断处理的注意事项。',
      '边缘 AI 的模型量化会带来哪些收益与风险？',
      '如何设计一个稳定的 OTA 升级流程？',
      '遇到设备偶发死机，你会如何排查？',
      '请介绍一次你在嵌入式项目中解决性能瓶颈的经历。',
    ],
    testing: [
      '与传统软件测试相比，AI 系统测试有哪些本质差异？',
      '如何为一个 RAG 应用设计评测集与评分标准？',
      '大模型输出的非确定性会给自动化测试带来什么挑战？',
      '你会如何设计 AI 功能的回归测试策略？',
      '请介绍你熟悉的 AI 测试工具链及其适用场景。',
      '线上出现模型效果下降时，你会如何定位问题？',
    ],
    ops: [
      '如何设计一套可观测的 AI 推理服务监控体系？',
      'GPU 利用率低但请求延迟高，你会如何排查？',
      '请说明 MLOps 的核心环节以及你会如何落地。',
      '模型上线后出现数据漂移，你会如何发现并处理？',
      '如何设计大模型服务的灰度发布与回滚方案？',
      '请介绍一次你处理线上 AI 服务故障的经历。',
    ],
    visual: [
      '请介绍你的 AIGC 视觉设计工作流，以及常用的工具组合。',
      '如何用提示词与参考图控制画面风格的一致性？',
      '商业项目中，如何平衡创意表达与品牌规范？',
      '请说明 ControlNet 在视觉设计中的典型用法。',
      '你如何评估一组视觉方案的效果并推动决策？',
      '请介绍一个你主导的视觉设计项目及成果。',
    ],
    video: [
      '请介绍你使用 AI 工具制作视频的完整工作流。',
      '如何提升 AI 生成视频中角色与场景的一致性？',
      '短剧分镜脚本需要包含哪些关键信息？',
      '如何控制 AI 视频的节奏与情绪表达？',
      '遇到生成结果不符合预期时，你会如何迭代提示词与素材？',
      '请介绍一个你完成的 AI 短剧或视频项目。',
    ],
  };

  const GENERIC_INTERVIEW = [
    '请做一个简短的自我介绍，重点说明与你应聘方向相关的经历。',
    '你最近在学习什么新技术？为什么选择它？',
    '请描述一个你遇到过的技术难题，以及你的解决过程。',
    '在团队协作中，你如何处理与他人的技术分歧？',
    '面对紧迫的交付周期，你会如何安排优先级？',
    '你如何保证自己交付内容的质量？',
    '请谈谈你未来一年的职业规划。',
    '你如何看待 AI 对所在行业的影响？',
    '你还有什么问题想反问面试官？',
  ];

  const INTERVIEW_HISTORY_SEED = [
    { id: 'ih-1', direction: 'agent', directionName: 'AI应用与智能体开发', difficulty: 'medium', score: 86, date: '2026-11-08 20:14', duration: 1580, count: 10 },
    { id: 'ih-2', direction: 'agent', directionName: 'AI应用与智能体开发', difficulty: 'medium', score: 78, date: '2026-10-30 19:40', duration: 1320, count: 8 },
    { id: 'ih-3', direction: 'llm', directionName: 'AI大模型开发', difficulty: 'hard', score: 72, date: '2026-10-22 21:05', duration: 1860, count: 10 },
    { id: 'ih-4', direction: 'testing', directionName: 'AI测试', difficulty: 'easy', score: 91, date: '2026-10-15 18:20', duration: 980, count: 5 },
    { id: 'ih-5', direction: 'agent', directionName: 'AI应用与智能体开发', difficulty: 'hard', score: 64, date: '2026-10-03 20:50', duration: 2100, count: 10 },
    { id: 'ih-6', direction: 'video', directionName: 'AI视频与短剧创作', difficulty: 'medium', score: 83, date: '2026-09-26 15:30', duration: 1240, count: 8 },
  ];

  /* ---------------- 首页数据 ---------------- */
  const HOME = {
    stats: [
      { label: '精选面试题', value: 12860, suffix: '+' },
      { label: '注册学员', value: 28640, suffix: '+' },
      { label: 'AI 面试次数', value: 96320, suffix: '+' },
      { label: '学员好评率', value: 98.6, suffix: '%', decimals: 1 },
    ],
    quickStart: [
      { title: '规划学习路线', desc: '按学科路线系统化学习', icon: 'route', color: 'amber', href: 'routes.html' },
      { title: '随机练习 10 题', desc: '从题库随机抽取，快速热身', icon: 'shuffle', color: 'brand', href: 'practice.html?stage=agent-llm&mode=random&count=10' },
      { title: '继续上次学习', desc: '接着上次的进度继续刷题', icon: 'play', color: 'green', href: 'practice.html?resume=1' },
      { title: '开始 AI 面试', desc: '模拟真实面试，检验学习成果', icon: 'mic', color: 'purple', href: 'ai-config.html' },
    ],
    features: [
      { title: '学习路线', desc: '精选 B 站课程，按顺序学习，构建完整知识体系。', icon: 'route', href: 'routes.html' },
      { title: '海量题库', desc: '覆盖 8 大 AI 方向，单选、多选、判断、简答全题型练习。', icon: 'book', href: 'questions.html' },
      { title: '刷题练习', desc: '顺序或随机模式，AI 批改简答，错题自动沉淀。', icon: 'edit', href: 'practice.html' },
      { title: 'AI 模拟面试', desc: '智能出题、实时评分、生成能力报告，还原真实面试节奏。', icon: 'mic', href: 'ai-config.html' },
    ],
    learning: { streak: 12, accuracy: 82, total: 468 },
    practice7days: [
      { label: '周一', value: 12 }, { label: '周二', value: 20 }, { label: '周三', value: 8 },
      { label: '周四', value: 26 }, { label: '周五', value: 18 }, { label: '周六', value: 32 }, { label: '今日', value: 24, today: true },
    ],
    hotSubjects: ['agent', 'llm', 'testing', 'embodied', 'video', 'ops'],
  };

  /* ---------------- 管理端数据 ---------------- */
  const ADMIN_STUDENTS = [
    { id: 'stu-1', name: '林小满', phone: '138****6621', email: 'linxiaoman@example.com', avatarColor: '#6366F1', joined: '2025-08-12', studyDays: 96, courseCount: 6, practiceCount: 468, accuracy: 82, interviewCount: 12, status: 'active', lastLogin: '2026-11-11 09:42' },
    { id: 'stu-2', name: '周予安', phone: '139****2043', email: 'zhouyuan@example.com', avatarColor: '#8B5CF6', joined: '2025-09-03', studyDays: 74, courseCount: 4, practiceCount: 326, accuracy: 76, interviewCount: 8, status: 'active', lastLogin: '2026-11-10 21:18' },
    { id: 'stu-3', name: '陈一诺', phone: '137****8892', email: 'chenyinuo@example.com', avatarColor: '#06B6D4', joined: '2025-09-18', studyDays: 58, courseCount: 3, practiceCount: 215, accuracy: 69, interviewCount: 5, status: 'disabled', lastLogin: '2026-10-28 14:02' },
    { id: 'stu-4', name: '许知远', phone: '136****1176', email: 'xuzhiyuan@example.com', avatarColor: '#10B981', joined: '2025-10-01', studyDays: 41, courseCount: 5, practiceCount: 302, accuracy: 88, interviewCount: 9, status: 'active', lastLogin: '2026-11-11 08:36' },
    { id: 'stu-5', name: '唐可心', phone: '135****4509', email: 'tangke@example.com', avatarColor: '#F59E0B', joined: '2025-10-19', studyDays: 23, courseCount: 2, practiceCount: 128, accuracy: 64, interviewCount: 3, status: 'active', lastLogin: '2026-11-09 19:55' },
    { id: 'stu-6', name: '魏子昂', phone: '188****7325', email: 'weiziang@example.com', avatarColor: '#EC4899', joined: '2025-11-02', studyDays: 9, courseCount: 1, practiceCount: 42, accuracy: 58, interviewCount: 1, status: 'active', lastLogin: '2026-11-08 22:10' },
    { id: 'stu-7', name: '苏念', phone: '189****3021', email: 'sunian@example.com', avatarColor: '#3B82F6', joined: '2025-11-05', studyDays: 6, courseCount: 1, practiceCount: 31, accuracy: 61, interviewCount: 0, status: 'disabled', lastLogin: '2026-11-06 10:22' },
    { id: 'stu-8', name: '顾清和', phone: '186****9410', email: 'guqinghe@example.com', avatarColor: '#F97316', joined: '2025-11-08', studyDays: 3, courseCount: 0, practiceCount: 12, accuracy: 50, interviewCount: 0, status: 'active', lastLogin: '2026-11-10 17:45' },
  ];

  const ADMIN_USERS = [
    { id: 'au-1', name: '陈屿', account: 'admin', phone: '138****0001', email: 'admin@cloudpivot.ai', role: '超级管理员', roleCode: 'super_admin', status: 'active', builtin: true, lastLogin: '2026-11-11 09:08', createdAt: '2025-01-01' },
    { id: 'au-2', name: '王敏', account: 'wangmin', phone: '139****2214', email: 'wangmin@cloudpivot.ai', role: '内容审核', roleCode: 'content_reviewer', status: 'active', builtin: false, lastLogin: '2026-11-10 17:32', createdAt: '2025-06-18' },
    { id: 'au-3', name: '李哲', account: 'lizhe', phone: '137****5568', email: 'lizhe@cloudpivot.ai', role: '运营人员', roleCode: 'operator', status: 'active', builtin: false, lastLogin: '2026-11-11 08:50', createdAt: '2025-06-18' },
    { id: 'au-4', name: '赵雨桐', account: 'zhaoyt', phone: '136****7730', email: 'zhaoyt@cloudpivot.ai', role: '运营人员', roleCode: 'operator', status: 'active', builtin: false, lastLogin: '2026-11-09 20:12', createdAt: '2025-07-02' },
    { id: 'au-5', name: '孙澄', account: 'suncheng', phone: '135****8841', email: 'suncheng@cloudpivot.ai', role: '内容审核', roleCode: 'content_reviewer', status: 'disabled', builtin: false, lastLogin: '2026-10-30 11:26', createdAt: '2025-08-10' },
    { id: 'au-6', name: '临时运营', account: 'temp_ops', phone: '188****6620', email: 'temp@cloudpivot.ai', role: '运营人员', roleCode: 'operator', status: 'disabled', builtin: false, lastLogin: '2026-09-18 15:04', createdAt: '2025-09-18' },
  ];

  const PERMISSION_GROUPS = [
    { name: '题库管理', code: 'question', perms: ['查看', '新增', '编辑', '删除', '导入', '导出', '审核'] },
    { name: '面试题库管理', code: 'interview', perms: ['查看', '上传', '编辑', '删除', '检索测试'] },
    { name: '用户管理', code: 'user', perms: ['查看', '新增', '编辑', '禁用'] },
    { name: '学习路线', code: 'roadmap', perms: ['查看', '新增', '编辑', '删除'] },
    { name: '学员管理', code: 'student', perms: ['查看', '编辑', '删除'] },
    { name: '系统管理', code: 'system', perms: ['日志查看', '系统设置'] },
  ];

  const ADMIN_ROLES = [
    { id: 'role-1', name: '超级管理员', code: 'super_admin', desc: '系统内置唯一账号，拥有全部权限', builtin: true, permissions: ['*'] },
    { id: 'role-2', name: '内容审核', code: 'content_reviewer', desc: '只把关不生产：查看全部内容并审核题目，无增删改权限', builtin: true, permissions: ['question:查看', 'question:审核', 'interview:查看', 'interview:检索测试', 'roadmap:查看', 'student:查看', 'user:查看'] },
    { id: 'role-3', name: '运营人员', code: 'operator', desc: '除系统管理外的全部操作，含内容维护与学员管理，不具备审核权限', builtin: true, permissions: ['question:查看', 'question:新增', 'question:编辑', 'question:删除', 'question:导入', 'question:导出', 'interview:查看', 'interview:上传', 'interview:编辑', 'interview:删除', 'interview:检索测试', 'user:查看', 'user:新增', 'user:编辑', 'user:禁用', 'roadmap:查看', 'roadmap:新增', 'roadmap:编辑', 'roadmap:删除', 'student:查看', 'student:编辑', 'student:删除'] },
  ];

  const KNOWLEDGE_BASES = ['AI 应用开发知识库', '大模型原理知识库', '机器人技术知识库', '测试与质量知识库'];
  const TOPICS = ['大模型基础', 'RAG', 'Agent 设计', 'Prompt 工程', '模型微调', '系统设计', '性能优化', '项目管理', '多模态应用'];

  const INTERVIEW_BANK_SEED = [
    { id: 'iq-1', question: '什么是 RAG？它解决了大模型的哪些问题？', sourceType: 'knowledge', knowledgeBase: 'AI 应用开发知识库', docTitle: 'RAG 工程实践指南.md', number: 12, topic: 'RAG', difficulty: 'easy', tags: ['RAG', '检索增强'], createdAt: '2025-10-12' },
    { id: 'iq-2', question: '如何评估一个 Agent 系统的效果？', sourceType: 'knowledge', knowledgeBase: 'AI 应用开发知识库', docTitle: 'Agent 设计手册.md', number: 8, topic: 'Agent 设计', difficulty: 'medium', tags: ['Agent', '评测'], createdAt: '2025-10-12' },
    { id: 'iq-3', question: 'LoRA 与全量微调的差异及适用场景。', sourceType: 'knowledge', knowledgeBase: '大模型原理知识库', docTitle: '参数高效微调.md', number: 23, topic: '模型微调', difficulty: 'medium', tags: ['LoRA'], createdAt: '2025-10-14' },
    { id: 'iq-4', question: '请解释 Transformer 中多头注意力的作用。', sourceType: 'knowledge', knowledgeBase: '大模型原理知识库', docTitle: 'Transformer 深入解析.md', number: 5, topic: '大模型基础', difficulty: 'medium', tags: ['Transformer'], createdAt: '2025-10-14' },
    { id: 'iq-5', question: '如何设计一个稳定的 OTA 升级流程？', sourceType: 'manual', knowledgeBase: '机器人技术知识库', docTitle: '', number: 0, topic: '系统设计', difficulty: 'hard', tags: ['OTA', '嵌入式'], createdAt: '2025-10-19' },
    { id: 'iq-6', question: '机器人多传感器融合时如何做时间同步？', sourceType: 'knowledge', knowledgeBase: '机器人技术知识库', docTitle: '多传感器融合.md', number: 17, topic: '系统设计', difficulty: 'hard', tags: ['传感器融合'], createdAt: '2025-10-19' },
    { id: 'iq-7', question: '大模型输出非确定性给自动化测试带来哪些挑战？', sourceType: 'knowledge', knowledgeBase: '测试与质量知识库', docTitle: 'AI 测试方法.md', number: 9, topic: '项目管理', difficulty: 'medium', tags: ['AI 测试'], createdAt: '2025-10-20' },
    { id: 'iq-8', question: '线上模型效果下降，你会如何定位问题？', sourceType: 'knowledge', knowledgeBase: '测试与质量知识库', docTitle: '线上效果监控.md', number: 4, topic: '性能优化', difficulty: 'medium', tags: ['监控'], createdAt: '2025-10-20' },
    { id: 'iq-9', question: '请说明 Prompt 注入的常见方式与防护思路。', sourceType: 'markdown', knowledgeBase: 'AI 应用开发知识库', docTitle: 'prompt-security.md', number: 0, topic: 'Prompt 工程', difficulty: 'hard', tags: ['安全', 'Prompt'], createdAt: '2025-10-24' },
    { id: 'iq-10', question: '多智能体协作有哪些典型模式？', sourceType: 'knowledge', knowledgeBase: 'AI 应用开发知识库', docTitle: '多智能体系统.md', number: 3, topic: 'Agent 设计', difficulty: 'hard', tags: ['多智能体'], createdAt: '2025-10-24' },
    { id: 'iq-11', question: '如何设计一套模型效果评测方案？', sourceType: 'knowledge', knowledgeBase: '大模型原理知识库', docTitle: '模型评测体系.md', number: 11, topic: '大模型基础', difficulty: 'medium', tags: ['评测'], createdAt: '2025-10-26' },
    { id: 'iq-12', question: '请谈谈你对具身智能应用落地场景的理解。', sourceType: 'manual', knowledgeBase: 'AI 应用开发知识库', docTitle: '', number: 0, topic: '具身智能应用', difficulty: 'medium', tags: ['具身智能'], createdAt: '2025-10-28' },
    { id: 'iq-13', question: 'KV Cache 的原理与显存优化方式。', sourceType: 'knowledge', knowledgeBase: '大模型原理知识库', docTitle: '推理优化实践.md', number: 19, topic: '性能优化', difficulty: 'hard', tags: ['KV Cache'], createdAt: '2025-10-29' },
    { id: 'iq-14', question: '一个 AI 项目从需求到上线，你会如何管理风险？', sourceType: 'manual', knowledgeBase: '测试与质量知识库', docTitle: '', number: 0, topic: '项目管理', difficulty: 'easy', tags: ['项目管理'], createdAt: '2025-11-01' },
    { id: 'iq-15', question: '请介绍一种你熟悉的向量检索优化方法。', sourceType: 'markdown', knowledgeBase: 'AI 应用开发知识库', docTitle: 'vector-search.md', number: 0, topic: 'RAG', difficulty: 'hard', tags: ['向量检索'], createdAt: '2025-11-03' },
    { id: 'iq-16', question: '如何看待大模型在垂直行业的落地边界？', sourceType: 'manual', knowledgeBase: 'AI 应用开发知识库', docTitle: '', number: 0, topic: '', difficulty: 'medium', tags: ['行业应用'], createdAt: '2025-11-05' },
  ];

  const LOG_SEED = [
    { id: 'lg-1', user: '陈屿', action: '登录系统', target: '管理后台', ip: '192.168.1.16', time: '2026-11-11 09:08:12', type: 'login', detail: '超级管理员通过账号密码登录管理后台' },
    { id: 'lg-2', user: '李哲', action: '上架题目', target: '题目 #Q1024', ip: '192.168.1.23', time: '2026-11-11 08:56:40', type: 'edit', detail: '将题目「什么是 RAG？」从待审核调整为已上架' },
    { id: 'lg-3', user: '王敏', action: '审核通过', target: '题目 #Q1021', ip: '192.168.1.31', time: '2026-11-10 18:22:05', type: 'edit', detail: '审核通过题目「LoRA 的主要优势是什么？」' },
    { id: 'lg-4', user: '李哲', action: '新增课程', target: '课程「大模型应用安全与合规指南」', ip: '192.168.1.23', time: '2026-11-10 17:45:31', type: 'create', detail: '在 B 站课程库新增课程，来源：其他' },
    { id: 'lg-5', user: '赵雨桐', action: '禁用学员', target: '学员「陈一诺」', ip: '192.168.1.48', time: '2026-11-10 16:10:18', type: 'disable', detail: '因账号异常操作，临时禁用学员账号' },
    { id: 'lg-6', user: '陈屿', action: '修改系统设置', target: '基本信息设置', ip: '192.168.1.16', time: '2026-11-10 11:32:50', type: 'edit', detail: '更新平台名称为「云枢智学」' },
    { id: 'lg-7', user: '王敏', action: '审核不通过', target: '题目 #Q1018', ip: '192.168.1.31', time: '2026-11-09 20:08:14', type: 'edit', detail: '审核不通过，原因：选项表述不严谨' },
    { id: 'lg-8', user: '李哲', action: '新增学习路线', target: '路线「AI 短剧创作实战路线」', ip: '192.168.1.23', time: '2026-11-09 15:40:02', type: 'create', detail: '创建路线并关联 1 门课程' },
    { id: 'lg-9', user: '赵雨桐', action: '重置密码', target: '用户「孙澄」', ip: '192.168.1.48', time: '2026-11-08 17:22:36', type: 'edit', detail: '将用户密码重置为系统默认密码' },
    { id: 'lg-10', user: '陈屿', action: '新增用户', target: '用户「temp_ops」', ip: '192.168.1.16', time: '2026-11-08 10:15:22', type: 'create', detail: '新增运营人员账号，状态：已启用' },
    { id: 'lg-11', user: '李哲', action: '删除题目', target: '题目 #Q1009', ip: '192.168.1.23', time: '2026-11-07 19:05:48', type: 'delete', detail: '删除重复录制的题目（逻辑删除）' },
    { id: 'lg-12', user: '王敏', action: '导出题库', target: '题库管理', ip: '192.168.1.31', time: '2026-11-07 14:28:11', type: 'other', detail: '导出当前筛选条件下的题目 Excel' },
    { id: 'lg-13', user: '赵雨桐', action: '启用学员', target: '学员「许知远」', ip: '192.168.1.48', time: '2026-11-06 09:52:30', type: 'disable', detail: '恢复学员账号使用权限' },
    { id: 'lg-14', user: '陈屿', action: '删除课程', target: '课程「过时的 Prompt 教程」', ip: '192.168.1.16', time: '2026-11-05 16:44:17', type: 'delete', detail: '删除课程并解除路线关联（逻辑删除）' },
    { id: 'lg-15', user: '李哲', action: '导入面试题', target: '面试题库管理', ip: '192.168.1.23', time: '2026-11-05 11:20:09', type: 'create', detail: '从 Markdown 文件导入 26 道面试题' },
  ];

  const ADMIN_SEED = {
    students: ADMIN_STUDENTS,
    users: ADMIN_USERS,
    roles: ADMIN_ROLES,
    interviewBank: INTERVIEW_BANK_SEED,
    logs: LOG_SEED,
    settings: {
      platformName: '云枢智学',
      description: 'AI 赋能的智能面试训练平台，让每一次练习都更接近 Offer。',
      logo: '',
      defaultAvatar: '',
    },
  };

  /* ---------------- 工具方法 ---------------- */
  function getQuestion(id) {
    return ALL_QUESTIONS.find(q => q.id === id) || null;
  }

  function getSubject(id) {
    return SUBJECTS.find(s => s.id === id) || null;
  }

  function getStage(subjectId, stageId) {
    const subject = getSubject(subjectId);
    return subject ? subject.stages.find(st => st.id === stageId) || null : null;
  }

  function getStageById(stageId) {
    for (const s of SUBJECTS) {
      const st = s.stages.find(x => x.id === stageId);
      if (st) return { subject: s, stage: st };
    }
    return null;
  }

  function getCourse(id) {
    return COURSE_SEED.find(c => c.id === id) || null;
  }

  function courseCover(course) {
    if (!course) return '../assets/images/covers/default.svg';
    if (course.coverUrl) return course.coverUrl;
    if (course.cover) return course.cover;
    const seed = COURSE_SEED.find(c => c.id === course.id);
    return seed && seed.cover ? seed.cover : '../assets/images/covers/default.svg';
  }

  function getCoursesByIds(ids) {
    return (ids || []).map(getCourse).filter(Boolean);
  }

  function getRoadmapBySubject(subjectId) {
    return ROADMAP_SEED.find(r => r.subjectId === subjectId) || null;
  }

  function subjectQuestionCount(subjectId) {
    const s = getSubject(subjectId);
    return s ? s.stages.reduce((sum, st) => sum + st.questions.length, 0) : 0;
  }

  function stageQuestionCount(stage) {
    return stage && stage.questions ? stage.questions.length : 0;
  }

  function buildInterviewQuestions(directionId, difficulty, count) {
    const tailored = (INTERVIEW_SETS[directionId] || []).slice();
    const generic = GENERIC_INTERVIEW.slice();
    const list = [];
    let ti = 0, gi = 0;
    while (list.length < count) {
      if (ti < tailored.length) list.push(tailored[ti++]);
      else if (gi < generic.length) list.push(generic[gi++]);
      else list.push(tailored[(list.length) % tailored.length]);
    }
    return list.map((text, i) => ({
      id: 'iqs-' + i,
      no: i + 1,
      text,
      difficulty,
      score: null,
    }));
  }

  function buildAdminQuestions() {
    const statusPool = ['online', 'online', 'online', 'pending', 'online', 'offline', 'online', 'rejected', 'draft', 'online'];
    return ALL_QUESTIONS.map((q, i) => ({
      id: 'Q' + (1001 + i),
      sourceId: q.id,
      stem: q.stem,
      subjectId: q.subjectId,
      stageId: q.stageId,
      type: q.type,
      difficulty: q.difficulty,
      status: statusPool[i % statusPool.length],
      createdAt: '2025-10-' + String(1 + (i % 28)).padStart(2, '0') + ' 10:' + String(10 + (i % 40)).padStart(2, '0'),
      attempts: q.attempts,
      correctRate: q.correctRate,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      tags: q.tags,
    }));
  }

  window.CloudData = {
    DIRECTION_META,
    TYPE_LABEL,
    DIFF_LABEL,
    SUBJECTS,
    ALL_QUESTIONS,
    COURSES: COURSE_SEED,
    ROADMAPS: ROADMAP_SEED,
    MISTAKES_SEED: MISTAKE_SEED,
    INTERVIEW_SETS,
    GENERIC_INTERVIEW,
    INTERVIEW_HISTORY_SEED,
    HOME,
    ADMIN_SEED,
    PERMISSION_GROUPS,
    KNOWLEDGE_BASES,
    TOPICS,
    ADMIN_QUESTIONS: buildAdminQuestions(),
    ADMIN_DEMO_USER: { name: '陈屿', account: 'admin', role: '超级管理员', avatarColor: '#6366F1' },
    DEMO_STUDENT: {
      id: 'stu-demo', name: '林小满', phone: '13800136621', email: 'linxiaoman@example.com',
      gender: '保密', avatar: '', role: '学员', joined: '2025-08-12', avatarColor: '#6366F1',
    },
    helpers: {
      getQuestion, getSubject, getStage, getStageById, getCourse, getCoursesByIds, courseCover,
      getRoadmapBySubject, subjectQuestionCount, stageQuestionCount,
      buildInterviewQuestions,
    },
  };
})();


/* ---------------- 工具 / 组件 / 数据仓库 ---------------- */
/* 云枢智学 · 公共脚本：存储 / 弹窗 / Toast / 表单 / 图表提示 / 数据仓库 */
(function () {
  'use strict';

  const KEYS = {
    user: 'cp_user',
    admin: 'cp_admin',
    guide: 'cp_guide_done',
    practice: 'cp_practice_v1',
    interviewConfig: 'cp_interview_config',
    interviewSession: 'cp_interview_session_v1',
    interviewResult: 'cp_interview_result',
    interviewHistory: 'cp_interview_history_v1',
    mistakes: 'cp_mistakes_v1',
    adminDB: 'cp_admin_db_v2',
  };

  /* ---------------- 基础工具 ---------------- */
  const qs = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function debounce(fn, wait) {
    let timer;
    return function () {
      const args = arguments, ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, wait || 250);
    };
  }

  const pad = n => String(n).padStart(2, '0');

  function formatNumber(n) {
    const num = Number(n) || 0;
    return num.toLocaleString('zh-CN');
  }

  function compact(n) {
    const num = Number(n) || 0;
    if (num >= 100000000) return (num / 100000000).toFixed(1).replace(/\.0$/, '') + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万';
    return formatNumber(num);
  }

  function formatSeconds(total) {
    const s = Math.max(0, Math.floor(Number(total) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? h + ':' + pad(m) + ':' + pad(sec) : pad(m) + ':' + pad(sec);
  }

  function formatClock(total) {
    const s = Math.max(0, Math.floor(Number(total) || 0));
    return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  }

  function formatMinutes(min) {
    const m = Number(min) || 0;
    const h = Math.floor(m / 60);
    const rest = m % 60;
    if (!h) return rest + ' 分钟';
    return h + ' 小时' + (rest ? ' ' + rest + ' 分' : '');
  }

  function formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function formatDateTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return formatDate(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function initials(name) {
    const str = String(name || '学员').trim();
    return str.slice(-2);
  }

  function hashColor(str) {
    const palette = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#F97316'];
    let h = 0;
    for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
  }

  function avatarHTML(name, color, cls, imgSrc) {
    let src = imgSrc;
    if (!src) {
      try {
        const settings = getDB().settings || {};
        src = settings.defaultAvatar || '';
      } catch (e) { src = ''; }
    }
    if (src) {
      return '<span class="avatar ' + (cls || '') + '"><img src="' + src + '" alt="' + escapeHTML(name || '用户头像') + '"></span>';
    }
    const c = color || hashColor(name);
    return '<span class="avatar ' + (cls || '') + '" style="background:linear-gradient(135deg,' + c + ',' + c + 'cc)">' + escapeHTML(initials(name)) + '</span>';
  }

  function safeStorage() {
    let memory = {};
    let ok = true;
    try {
      const t = '__cp_test__';
      localStorage.setItem(t, '1');
      localStorage.removeItem(t);
    } catch (e) { ok = false; }
    return {
      get(key, fallback) {
        try {
          const raw = ok ? localStorage.getItem(key) : memory[key];
          if (raw == null) return fallback;
          return JSON.parse(raw);
        } catch (e) { return fallback; }
      },
      set(key, value) {
        const raw = JSON.stringify(value);
        try { if (ok) localStorage.setItem(key, raw); else memory[key] = raw; } catch (e) { memory[key] = raw; }
      },
      remove(key) {
        try { if (ok) localStorage.removeItem(key); else delete memory[key]; } catch (e) { delete memory[key]; }
      }
    };
  }
  const storage = safeStorage();

  /* ---------------- 用户 / 会话 ---------------- */
  function getUser() {
    const stored = storage.get(KEYS.user, undefined);
    if (stored === undefined) {
      const demo = Object.assign({}, window.CloudData.DEMO_STUDENT);
      storage.set(KEYS.user, demo);
      return demo;
    }
    return stored;
  }
  function setUser(user) { storage.set(KEYS.user, user); }
  function logoutUser() { storage.set(KEYS.user, null); }

  function getAdmin() { return storage.get(KEYS.admin, null); }
  function setAdmin(admin) { storage.set(KEYS.admin, admin); }
  function logoutAdmin() { storage.set(KEYS.admin, null); }

  function requireAuth() {
    const user = getUser();
    if (!user) {
      const next = encodeURIComponent(location.pathname.split('/').pop() + location.search);
      location.replace('login.html?next=' + next);
      return null;
    }
    return user;
  }

  function requireAdmin() {
    const admin = getAdmin();
    if (!admin) {
      location.replace('login.html?next=' + encodeURIComponent(location.pathname.split('/').pop()));
      return null;
    }
    return admin;
  }

  /* ---------------- Toast ---------------- */
  function toast(message, type, duration) {
    let root = qs('#toastRoot');
    if (!root) {
      root = document.createElement('div');
      root.id = 'toastRoot';
      document.body.appendChild(root);
    }
    const t = type || 'success';
    const icons = { success: 'checkCircle', error: 'xCircle', warning: 'alertCircle', info: 'info' };
    const item = document.createElement('div');
    item.className = 'toast ' + t;
    item.setAttribute('role', 'status');
    item.innerHTML = '<span class="toast-icon">' + window.icon(icons[t] || 'info', 14) + '</span>' +
      '<span class="toast-msg">' + escapeHTML(message) + '</span>' +
      '<button class="toast-close" aria-label="关闭提示">' + window.icon('x', 13) + '</button>';
    root.appendChild(item);
    const close = () => {
      item.classList.add('leaving');
      setTimeout(function () { item.remove(); }, 220);
    };
    item.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, duration || 3200);
  }

  /* ---------------- Modal ---------------- */
  let layerSeq = 0;
  function syncBodyLock() {
    if (qs('.modal-layer.open, .drawer-layer.open')) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
  }

  function openModal(opts) {
    const options = opts || {};
    const layer = document.createElement('div');
    layer.className = 'modal-layer open';
    layer.style.zIndex = 1000 + (layerSeq++);
    const size = options.size || '';
    layer.innerHTML =
      '<div class="modal-card ' + size + '" role="dialog" aria-modal="true" aria-labelledby="modalTitle-' + layerSeq + '">' +
        '<div class="modal-head">' +
          '<div><h2 class="modal-title" id="modalTitle-' + layerSeq + '">' + escapeHTML(options.title || '') + '</h2>' +
          (options.desc ? '<p class="modal-desc">' + escapeHTML(options.desc) + '</p>' : '') + '</div>' +
          '<button class="modal-close" aria-label="关闭">' + window.icon('x', 18) + '</button>' +
        '</div>' +
        '<div class="modal-body">' + (options.body || '') + '</div>' +
        (options.footer ? '<div class="modal-foot">' + options.footer + '</div>' : '') +
      '</div>';
    document.body.appendChild(layer);
    if (window.hydrateIcons) window.hydrateIcons(layer);
    syncBodyLock();

    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      layer.remove();
      layerSeq = Math.max(0, layerSeq - 1);
      syncBodyLock();
      document.removeEventListener('keydown', escHandler);
      if (options.onClose) options.onClose();
    }
    function escHandler(e) {
      if (e.key === 'Escape' && layer === qsa('.modal-layer.open').pop()) close();
    }
    layer.querySelector('.modal-close').addEventListener('click', close);
    if (options.closeOnBackdrop !== false) {
      layer.addEventListener('mousedown', function (e) { if (e.target === layer) close(); });
    }
    qsa('[data-close-modal]', layer).forEach(btn => btn.addEventListener('click', close));
    document.addEventListener('keydown', escHandler);

    // 焦点管理
    const focusable = layer.querySelector('input, select, textarea, button:not(.modal-close), [tabindex]');
    setTimeout(function () { if (focusable) focusable.focus({ preventScroll: true }); }, 40);

    // 焦点陷阱
    layer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const items = qsa('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', layer).filter(el => !el.disabled && el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    if (options.onMount) options.onMount(layer, close);
    return { layer: layer, close: close };
  }

  function confirmDialog(opts) {
    const o = opts || {};
    return new Promise(function (resolve) {
      const iconName = o.icon || 'alert';
      const iconTone = o.danger ? 'danger' : (o.tone || 'warn');
      const body =
        '<div class="confirm-icon ' + iconTone + '">' + window.icon(iconName, 22) + '</div>' +
        '<div style="font-size:14px;color:var(--ink-2);line-height:1.7">' + (o.message || '') + '</div>' +
        (o.list && o.list.length ? '<ul class="confirm-list">' + o.list.map(x => '<li>' + escapeHTML(x) + '</li>').join('') + '</ul>' : '') +
        (o.hint ? '<p class="small muted mt-12">' + escapeHTML(o.hint) + '</p>' : '');
      let settled = false;
      const modal = openModal({
        title: o.title || '请确认',
        body: body,
        footer:
          '<button class="btn btn-outline" data-cancel>' + escapeHTML(o.cancelText || '取消') + '</button>' +
          '<button class="btn ' + (o.danger ? 'btn-danger' : 'btn-primary') + '" data-confirm>' + escapeHTML(o.confirmText || '确认') + '</button>',
        onMount: function (layer, close) {
          layer.querySelector('[data-cancel]').addEventListener('click', function () { if (!settled) { settled = true; resolve(false); } close(); });
          layer.querySelector('[data-confirm]').addEventListener('click', function () { if (!settled) { settled = true; resolve(true); } close(); });
        },
        onClose: function () { if (!settled) { settled = true; resolve(false); } }
      });
      return modal;
    });
  }

  function openDrawer(opts) {
    const o = opts || {};
    const layer = document.createElement('div');
    layer.className = 'drawer-layer open';
    layer.innerHTML =
      '<div class="drawer-card" role="dialog" aria-modal="true">' +
        '<div class="drawer-head"><div><h2 class="modal-title">' + escapeHTML(o.title || '') + '</h2>' +
          (o.desc ? '<p class="modal-desc">' + escapeHTML(o.desc) + '</p>' : '') +
        '</div><button class="modal-close" aria-label="关闭">' + window.icon('x', 18) + '</button></div>' +
        '<div class="drawer-body">' + (o.body || '') + '</div>' +
      '</div>';
    document.body.appendChild(layer);
    if (window.hydrateIcons) window.hydrateIcons(layer);
    syncBodyLock();
    const close = function () {
      layer.remove();
      syncBodyLock();
      document.removeEventListener('keydown', onKey);
      if (o.onClose) o.onClose();
    };
    const onKey = function (e) { if (e.key === 'Escape') close(); };
    layer.querySelector('.modal-close').addEventListener('click', close);
    layer.addEventListener('mousedown', function (e) { if (e.target === layer) close(); });
    document.addEventListener('keydown', onKey);
    if (o.onMount) o.onMount(layer, close);
    return { layer: layer, close: close };
  }

  /* ---------------- 下拉菜单 ---------------- */
  function initDropdowns() {
    document.addEventListener('click', function (e) {
      const toggle = e.target.closest('[data-dropdown-toggle]');
      if (toggle) {
        e.preventDefault();
        const dropdown = toggle.closest('.dropdown');
        const willOpen = !dropdown.classList.contains('open');
        qsa('.dropdown.open').forEach(d => d.classList.remove('open'));
        if (willOpen) dropdown.classList.add('open');
        return;
      }
      if (!e.target.closest('.dropdown-menu')) qsa('.dropdown.open').forEach(d => d.classList.remove('open'));
    });
  }

  /* ---------------- 密码显示 / 倒计时 / 强度 ---------------- */
  function initPasswordToggles() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-toggle-password]');
      if (!btn) return;
      const input = qs(btn.getAttribute('data-toggle-password'));
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = window.icon(show ? 'eyeOff' : 'eye', 16);
      btn.setAttribute('aria-label', show ? '隐藏密码' : '显示密码');
    });
  }

  function startCountdown(btn, seconds, onEnd) {
    const total = seconds || 60;
    let left = total;
    btn.disabled = true;
    btn.textContent = left + 's 后重发';
    const timer = setInterval(function () {
      left -= 1;
      if (left <= 0) {
        clearInterval(timer);
        btn.disabled = false;
        btn.textContent = '获取验证码';
        if (onEnd) onEnd();
      } else {
        btn.textContent = left + 's 后重发';
      }
    }, 1000);
    return timer;
  }

  function passwordStrength(pw) {
    let score = 0;
    if (!pw) return { level: 0, label: '', score: 0 };
    if (pw.length >= 6) score += 1;
    if (pw.length >= 10) score += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
    if (/\d/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    if (score <= 2) return { level: 1, label: '弱', score: score };
    if (score <= 3) return { level: 2, label: '中', score: score };
    return { level: 3, label: '强', score: score };
  }

  function validateField(input, ok, message) {
    const field = input.closest('.field');
    if (!field) return ok;
    field.classList.toggle('invalid', !ok);
    const err = field.querySelector('.field-error');
    if (err && message) err.textContent = message;
    return ok;
  }

  /* ---------------- 数字动画 ---------------- */
  function animateCounter(el, target, opts) {
    const o = opts || {};
    const duration = o.duration || 1200;
    const decimals = o.decimals || 0;
    const start = performance.now();
    const from = 0;
    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = from + (target - from) * eased;
      el.textContent = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('zh-CN');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- 图表提示 ---------------- */
  function initChartTooltips() {
    let tip = qs('#chartTip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'chartTip';
      tip.className = 'chart-tooltip';
      document.body.appendChild(tip);
    }
    function show(target) {
      const text = target.getAttribute('data-tip');
      if (!text) return;
      tip.textContent = text;
      const rect = target.getBoundingClientRect();
      tip.classList.add('show');
      const tipRect = tip.getBoundingClientRect();
      let x = rect.left + rect.width / 2 - tipRect.width / 2;
      let y = rect.top - tipRect.height - 10;
      if (x < 8) x = 8;
      if (x + tipRect.width > window.innerWidth - 8) x = window.innerWidth - tipRect.width - 8;
      if (y < 8) y = rect.bottom + 10;
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
    }
    function hide() { tip.classList.remove('show'); }
    document.addEventListener('pointerover', function (e) {
      const t = e.target.closest('[data-tip]');
      if (t) show(t);
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest('[data-tip]')) hide();
    });
    document.addEventListener('focusin', function (e) {
      const t = e.target.closest('[data-tip]');
      if (t) show(t);
    });
    document.addEventListener('focusout', function (e) {
      if (e.target.closest('[data-tip]')) hide();
    });
    window.addEventListener('scroll', hide, { passive: true });
  }

  /* ---------------- 复制 / 下载 ---------------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
    return Promise.resolve();
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /* ---------------- 语音播报 ---------------- */
  let speechEnabled = true;
  function setSpeechEnabled(v) { speechEnabled = !!v; if (!v) stopSpeaking(); }
  function isSpeechEnabled() { return speechEnabled; }
  function speak(text, onEnd) {
    if (!speechEnabled || !('speechSynthesis' in window)) { if (onEnd) onEnd(); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'zh-CN';
      u.rate = 1.02;
      u.pitch = 1;
      u.onend = function () { if (onEnd) onEnd(); };
      window.speechSynthesis.speak(u);
    } catch (e) { if (onEnd) onEnd(); }
  }
  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  /* ---------------- 数据仓库（管理端可编辑数据） ---------------- */
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function seedDB() {
    const base = clone(window.CloudData.ADMIN_SEED);
    return {
      version: 2,
      subjects: clone(window.CloudData.SUBJECTS),
      courses: clone(window.CloudData.COURSES),
      roadmaps: clone(window.CloudData.ROADMAPS),
      questions: clone(window.CloudData.ADMIN_QUESTIONS),
      students: base.students,
      users: base.users,
      roles: base.roles,
      interviewBank: base.interviewBank,
      logs: base.logs,
      settings: base.settings,
    };
  }

  function getDB() {
    let db = storage.get(KEYS.adminDB, null);
    if (!db || db.version !== 2 || !Array.isArray(db.subjects)) {
      db = seedDB();
      storage.set(KEYS.adminDB, db);
    }
    return db;
  }
  function saveDB(db) { storage.set(KEYS.adminDB, db); }

  function addLog(action, target, type, detail) {
    const admin = getAdmin() || window.CloudData.ADMIN_DEMO_USER;
    const db = getDB();
    db.logs.unshift({
      id: 'lg-' + Date.now(),
      user: admin.name || '管理员',
      action: action,
      target: target,
      ip: '192.168.1.16',
      time: formatDateTime(new Date()),
      type: type || 'other',
      detail: detail || action + '：' + target,
    });
    saveDB(db);
  }

  /* ---------------- 错题本 ---------------- */
  function getMistakes() {
    const stored = storage.get(KEYS.mistakes, null);
    if (!stored) {
      const seed = clone(window.CloudData.MISTAKES_SEED);
      storage.set(KEYS.mistakes, seed);
      return seed;
    }
    return stored;
  }
  function saveMistakes(list) { storage.set(KEYS.mistakes, list); }

  /* ---------------- 练习 / 面试进度 ---------------- */
  function getPractice() { return storage.get(KEYS.practice, null); }
  function setPractice(v) { storage.set(KEYS.practice, v); }
  function clearPractice() { storage.remove(KEYS.practice); }

  function getInterviewConfig() { return storage.get(KEYS.interviewConfig, null); }
  function setInterviewConfig(v) { storage.set(KEYS.interviewConfig, v); }
  function getInterviewSession() { return storage.get(KEYS.interviewSession, null); }
  function setInterviewSession(v) { storage.set(KEYS.interviewSession, v); }
  function clearInterviewSession() { storage.remove(KEYS.interviewSession); }
  function getInterviewResult() { return storage.get(KEYS.interviewResult, null); }
  function setInterviewResult(v) { storage.set(KEYS.interviewResult, v); }
  function getInterviewHistory() {
    const custom = storage.get(KEYS.interviewHistory, null);
    const seed = clone(window.CloudData.INTERVIEW_HISTORY_SEED);
    return (custom || []).concat(seed);
  }
  function addInterviewHistory(item) {
    const custom = storage.get(KEYS.interviewHistory, []) || [];
    custom.unshift(item);
    storage.set(KEYS.interviewHistory, custom);
  }

  /* ---------------- 重置全部演示数据 ---------------- */
  function resetAllDemoData() {
    Object.keys(KEYS).forEach(k => storage.remove(KEYS[k]));
    ['cp_sidebar_collapsed', 'cp_voice_enabled', 'cp_interview_quota'].forEach(k => storage.remove(k));
    toast('演示数据已重置，页面即将刷新', 'success');
    setTimeout(function () { location.reload(); }, 800);
  }

  /* ---------------- 平台品牌同步 ---------------- */
  function applyPlatformBranding() {
    try {
      const settings = getDB().settings || {};
      const name = settings.platformName;
      if (name && name !== '云枢智学') {
        qsa('.brand-name').forEach(function (el) {
          if (el.textContent.indexOf('云枢智学') > -1) el.textContent = name;
        });
        document.title = document.title.replace('云枢智学', name);
      }
      if (settings.logo) {
        qsa('.brand-mark').forEach(function (el) {
          el.innerHTML = '<img src="' + settings.logo + '" alt="' + escapeHTML(name || '云枢智学') + '">';
          el.style.background = 'transparent';
          el.style.boxShadow = 'none';
        });
      }
    } catch (e) {}
  }

  /* ---------------- 初始化 ---------------- */
  function initCommon() {
    initDropdowns();
    initPasswordToggles();
    initChartTooltips();
    if (!qs('#toastRoot')) {
      const root = document.createElement('div');
      root.id = 'toastRoot';
      document.body.appendChild(root);
    }
    // 年份
    qsa('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
    applyPlatformBranding();
  }

  const App = {
    KEYS, qs, qsa, escapeHTML, debounce, pad, formatNumber, compact,
    formatSeconds, formatClock, formatMinutes, formatDate, formatDateTime,
    initials, hashColor, avatarHTML, storage,
    getUser, setUser, logoutUser, getAdmin, setAdmin, logoutAdmin,
    requireAuth, requireAdmin,
    toast, openModal, confirmDialog, openDrawer,
    initDropdowns, initPasswordToggles, startCountdown, passwordStrength, validateField,
    animateCounter, initChartTooltips, copyText, downloadFile,
    speak, stopSpeaking, setSpeechEnabled, isSpeechEnabled,
    applyPlatformBranding,
    getDB, saveDB, seedDB, addLog,
    getMistakes, saveMistakes,
    getPractice, setPractice, clearPractice,
    getInterviewConfig, setInterviewConfig,
    getInterviewSession, setInterviewSession, clearInterviewSession,
    getInterviewResult, setInterviewResult,
    getInterviewHistory, addInterviewHistory,
    resetAllDemoData,
    initCommon,
  };

  window.App = App;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommon);
  } else {
    initCommon();
  }
})();
