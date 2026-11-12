/* 管理端 · 系统设置 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;

  let logo = '';
  let defaultAvatar = '';

  function renderPreview(el, value, fallbackIcon) {
    if (value) el.innerHTML = '<img src="' + value + '" alt="预览">';
    else el.innerHTML = window.icon(fallbackIcon, 26);
  }

  function fill(settings) {
    logo = settings.logo || '';
    defaultAvatar = settings.defaultAvatar || '';
    App.qs('#settingName').value = settings.platformName || '';
    App.qs('#settingDesc').value = settings.description || '';
    renderPreview(App.qs('#logoPreview'), logo, 'sparkles');
    renderPreview(App.qs('#avatarPreview'), defaultAvatar, 'user');
  }

  function bindUpload(btnId, inputId, assign, previewId, iconName) {
    App.qs(btnId).addEventListener('click', function () { App.qs(inputId).click(); });
    App.qs(inputId).addEventListener('change', function (e) {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      if (!/image\/(jpeg|png)/.test(file.type)) { App.toast('仅支持 JPG、PNG 格式的图片', 'warning'); return; }
      if (file.size > 2 * 1024 * 1024) { App.toast('图片大小不能超过 2MB', 'warning'); return; }
      const reader = new FileReader();
      reader.onload = function () {
        assign(String(reader.result));
        renderPreview(App.qs(previewId), String(reader.result), iconName);
        App.toast('图片已选择，点击保存设置后生效', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  function refreshBrand(name) {
    document.title = name + ' · 管理后台';
    const brand = App.qs('.sidebar-brand-text b');
    if (brand) brand.textContent = name;
    const mark = App.qs('.sidebar-brand .brand-mark');
    if (mark) {
      if (logo) {
        mark.innerHTML = '<img src="' + logo + '" alt="">';
        mark.style.background = 'transparent';
        mark.style.boxShadow = 'none';
      } else {
        mark.textContent = '云';
        mark.style.background = '';
        mark.style.boxShadow = '';
      }
    }
  }

  async function resetToDefault() {
    const ok = await App.confirmDialog({
      title: '恢复默认值',
      message: '确认将表单内容恢复为默认值吗？点击「保存设置」后才会生效。',
      confirmText: '恢复默认值',
      icon: 'rotate',
      tone: 'brand',
    });
    if (!ok) return;
    fill(Data.ADMIN_SEED.settings);
    App.toast('已恢复默认值，请点击保存设置', 'success');
  }

  async function resetDemo() {
    const ok = await App.confirmDialog({
      title: '重置全部演示数据',
      message: '确认重置所有本地演示数据吗？包括学习进度、错题、面试记录、后台内容修改与登录状态。',
      hint: '此操作不可撤销，页面将自动刷新。',
      confirmText: '重置演示数据',
      danger: true,
      icon: 'alert',
    });
    if (!ok) return;
    App.resetAllDemoData();
  }

  function init() {
    if (!App.getAdmin()) return;
    fill(App.getDB().settings);
    bindUpload('#uploadLogoBtn', '#logoInput', function (v) { logo = v; }, '#logoPreview', 'sparkles');
    bindUpload('#uploadDefaultAvatarBtn', '#defaultAvatarInput', function (v) { defaultAvatar = v; }, '#avatarPreview', 'user');

    App.qs('#saveSettingsBtn').addEventListener('click', function () {
      const name = App.qs('#settingName');
      const okName = App.validateField(name, name.value.trim().length > 0, '平台名称不能为空');
      if (!okName) return;
      const database = App.getDB();
      database.settings = {
        platformName: name.value.trim(),
        description: App.qs('#settingDesc').value.trim(),
        logo: logo,
        defaultAvatar: defaultAvatar,
      };
      App.saveDB(database);
      App.addLog('修改系统设置', '基本信息设置', 'edit', '更新平台名称为「' + name.value.trim() + '」');
      refreshBrand(name.value.trim());
      App.toast('系统设置已保存', 'success');
    });

    App.qs('#resetSettingsBtn').addEventListener('click', resetToDefault);
    App.qs('#resetDemoBtn').addEventListener('click', resetDemo);

    const current = App.getDB().settings.platformName || '云枢智学';
    refreshBrand(current);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
