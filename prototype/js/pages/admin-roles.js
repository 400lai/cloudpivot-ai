/* 管理端 · 角色管理 */
(function () {
  'use strict';
  const App = window.App;
  const Data = window.CloudData;

  function db() { return App.getDB(); }

  function userCount(role) {
    return db().users.filter(u => u.roleCode === role.code).length;
  }

  function permLabel(str) {
    const parts = String(str).split(':');
    const group = Data.PERMISSION_GROUPS.find(g => g.code === parts[0]);
    return group ? group.name + '·' + parts[1] : str;
  }

  function tagsHTML(role) {
    if ((role.permissions || []).indexOf('*') > -1) return '<span class="role-perm all">全部权限</span>';
    if (!role.permissions || !role.permissions.length) return '<span class="role-perm none">暂无权限</span>';
    const tags = role.permissions.map(permLabel);
    const shown = tags.slice(0, 8).map(t => '<span class="role-perm">' + App.escapeHTML(t) + '</span>').join('');
    const more = tags.length > 8 ? '<span class="role-perm">+' + (tags.length - 8) + '</span>' : '';
    return shown + more;
  }

  function render() {
    const roles = db().roles;
    const host = App.qs('#roleGrid');
    if (!roles.length) {
      host.innerHTML = '<div class="admin-card" style="grid-column:1/-1"><div class="empty"><div class="empty-art">' + window.icon('shieldCheck', 28) + '</div>' +
        '<div class="empty-title">暂无角色数据</div><div class="empty-desc">点击右上角「新增角色」创建第一个角色。</div></div></div>';
      return;
    }
    host.innerHTML = '<div class="role-grid" style="grid-column:1/-1;display:grid">' + roles.map(function (role) {
      const count = userCount(role);
      return '<div class="role-card" data-role-card="' + role.id + '">' +
        '<div class="role-card-head"><span class="role-ic">' + window.icon(role.builtin ? 'shieldCheck' : 'shield', 20) + '</span>' +
          (role.builtin ? '<span class="badge badge-outline">预置</span>' : '<span class="badge badge-brand">自定义</span>') +
        '</div>' +
        '<h3>' + App.escapeHTML(role.name) + '</h3>' +
        '<span class="role-code">' + App.escapeHTML(role.code) + '</span>' +
        '<p>' + App.escapeHTML(role.desc || '暂无角色描述') + '</p>' +
        '<div class="role-meta"><span>' + window.icon('users', 12) + ' ' + count + ' 个用户</span><span>' + ((role.permissions || []).indexOf('*') > -1 ? '25' : (role.permissions || []).length) + ' 项权限</span></div>' +
        '<div class="role-perms">' + tagsHTML(role) + '</div>' +
        '<div class="role-card-foot">' +
          '<button class="btn btn-sm btn-soft" data-role-perm="' + role.id + '">' + window.icon('key', 13) + ' 编辑权限</button>' +
          '<button class="btn btn-sm btn-ghost" data-role-del="' + role.id + '" style="color:' + (count > 0 ? 'var(--muted-2)' : 'var(--red-strong)') + '">' + window.icon('trash', 13) + ' 删除</button>' +
        '</div>' +
      '</div>';
    }).join('') + '</div>';
    window.hydrateIcons(host);
    App.qsa('[data-role-card]', host).forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        const role = db().roles.find(r => r.id === card.getAttribute('data-role-card'));
        if (role) openPermissionModal(role);
      });
    });
    App.qsa('[data-role-perm]', host).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const role = db().roles.find(r => r.id === btn.getAttribute('data-role-perm'));
        if (role) openPermissionModal(role);
      });
    });
    App.qsa('[data-role-del]', host).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        deleteRole(btn.getAttribute('data-role-del'));
      });
    });
  }

  function openAddRole() {
    const body =
      '<div class="form-grid">' +
        '<div class="field"><label class="field-label">角色名称 <span class="required">*</span></label><input class="input" id="newRoleName" placeholder="例如：内容编辑"><p class="field-error">请输入角色名称</p></div>' +
        '<div class="field"><label class="field-label">角色编码 <span class="required">*</span></label><input class="input" id="newRoleCode" placeholder="例如：content_editor"><p class="field-hint">需唯一，建议使用小写字母与下划线</p><p class="field-error">请输入角色编码</p></div>' +
        '<div class="field span-2"><label class="field-label">角色描述</label><textarea class="textarea" id="newRoleDesc" placeholder="选填，说明该角色的职责范围"></textarea></div>' +
      '</div>' +
      '<div class="callout brand mt-16">' + window.icon('info', 16) + '<span>创建角色后，可在角色卡片中编辑权限；权限保存为全量覆盖。</span></div>';
    App.openModal({
      title: '新增角色',
      desc: '创建自定义后台角色',
      size: 'wide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" data-save-role>创建角色</button>',
      onMount: function (layer, close) {
        layer.querySelector('[data-save-role]').addEventListener('click', function () {
          const name = layer.querySelector('#newRoleName');
          const code = layer.querySelector('#newRoleCode');
          const desc = layer.querySelector('#newRoleDesc');
          const okName = App.validateField(name, name.value.trim().length > 0, '请输入角色名称');
          const codeVal = code.value.trim().toLowerCase();
          const exists = db().roles.some(r => r.code.toLowerCase() === codeVal);
          const okCode = App.validateField(code, codeVal.length > 0 && !exists, exists ? '角色编码已存在，请更换' : '请输入角色编码');
          if (!okName || !okCode) return;
          const database = db();
          database.roles.push({
            id: 'role-' + Date.now(),
            name: name.value.trim(),
            code: codeVal,
            desc: desc.value.trim(),
            builtin: false,
            permissions: [],
          });
          App.saveDB(database);
          App.addLog('新增角色', '角色「' + name.value.trim() + '」', 'create');
          close();
          render();
          App.toast('角色已创建', 'success');
        });
      },
    });
  }

  function openPermissionModal(role) {
    const allChecked = (role.permissions || []).indexOf('*') > -1;
    const tree = Data.PERMISSION_GROUPS.map(function (group) {
      return '<div class="perm-group">' +
        '<div class="perm-group-head"><label class="checkbox"><input type="checkbox" data-group-check="' + group.code + '"><span class="box"></span><span><b>' + group.name + '</b></span></label>' +
        '<span class="small muted">' + group.perms.length + ' 项</span></div>' +
        '<div class="perm-grid">' + group.perms.map(function (perm) {
          const value = group.code + ':' + perm;
          const checked = allChecked || (role.permissions || []).indexOf(value) > -1;
          return '<label class="checkbox"><input type="checkbox" data-perm="' + value + '"' + (checked ? ' checked' : '') + '><span class="box"></span><span>' + perm + '</span></label>';
        }).join('') + '</div>' +
      '</div>';
    }).join('');
    const body =
      '<div class="row-between" style="margin-bottom:12px"><span class="small muted">勾选该角色拥有的权限点，保存时将全量覆盖。</span>' +
        '<div class="row gap-6"><button class="btn-link" data-check-all type="button">全选</button><span class="muted-2">/</span><button class="btn-link" data-check-none type="button">清空</button></div></div>' +
      tree +
      '<div class="permission-note">' + window.icon('info', 13) + ' 权限控制菜单与操作按钮的可见性。无权限的操作入口不会展示。保存后立即生效（原型演示）。</div>';
    App.openModal({
      title: '编辑权限 - ' + role.name,
      desc: '共 ' + Data.PERMISSION_GROUPS.reduce((n, g) => n + g.perms.length, 0) + ' 个权限点，按 6 个分组展示',
      size: 'xwide',
      body: body,
      footer:
        '<button class="btn btn-outline" data-close-modal>取消</button>' +
        '<button class="btn btn-primary" data-save-perm>保存权限</button>',
      onMount: function (layer, close) {
        function syncGroup(groupCode) {
          const groupEl = layer.querySelector('[data-group-check="' + groupCode + '"]');
          if (!groupEl) return;
          const items = App.qsa('[data-perm]', groupEl.closest('.perm-group'));
          const checked = items.filter(x => x.checked).length;
          groupEl.checked = checked === items.length;
          groupEl.indeterminate = checked > 0 && checked < items.length;
        }
        App.qsa('[data-group-check]', layer).forEach(function (master) {
          const groupEl = master.closest('.perm-group');
          const items = App.qsa('[data-perm]', groupEl);
          const checkedCount = items.filter(x => x.checked).length;
          master.checked = checkedCount === items.length;
          master.indeterminate = checkedCount > 0 && checkedCount < items.length;
          master.addEventListener('change', function () {
            items.forEach(x => { x.checked = master.checked; });
            master.indeterminate = false;
          });
          items.forEach(function (item) {
            item.addEventListener('change', function () { syncGroup(master.getAttribute('data-group-check')); });
          });
        });
        layer.querySelector('[data-check-all]').addEventListener('click', function () {
          App.qsa('[data-perm], [data-group-check]', layer).forEach(x => { x.checked = true; x.indeterminate = false; });
        });
        layer.querySelector('[data-check-none]').addEventListener('click', function () {
          App.qsa('[data-perm], [data-group-check]', layer).forEach(x => { x.checked = false; x.indeterminate = false; });
        });
        layer.querySelector('[data-save-perm]').addEventListener('click', function () {
          const checked = App.qsa('[data-perm]', layer).filter(x => x.checked).map(x => x.getAttribute('data-perm'));
          const total = Data.PERMISSION_GROUPS.reduce((n, g) => n + g.perms.length, 0);
          const database = db();
          const item = database.roles.find(r => r.id === role.id);
          item.permissions = checked.length === total ? ['*'] : checked;
          App.saveDB(database);
          App.addLog('编辑角色权限', '角色「' + role.name + '」', 'edit', '更新权限点 ' + checked.length + ' 项');
          close();
          render();
          App.toast('权限已保存', 'success');
        });
      },
    });
  }

  async function deleteRole(id) {
    const database = db();
    const role = database.roles.find(r => r.id === id);
    if (!role) return;
    const count = userCount(role);
    if (role.builtin) { App.toast('预置角色不可删除', 'warning'); return; }
    if (count > 0) {
      App.toast('该角色下有 ' + count + ' 个用户，无法删除。请先调整用户角色。', 'warning');
      return;
    }
    const ok = await App.confirmDialog({
      title: '删除角色',
      message: '确认删除角色「' + role.name + '」吗？该角色下暂无用户。',
      confirmText: '删除角色',
      danger: true,
      icon: 'trash',
    });
    if (!ok) return;
    database.roles = database.roles.filter(r => r.id !== id);
    App.saveDB(database);
    App.addLog('删除角色', '角色「' + role.name + '」', 'delete');
    render();
    App.toast('角色已删除', 'success');
  }

  function init() {
    if (!App.getAdmin()) return;
    render();
    App.qs('#addRoleBtn').addEventListener('click', openAddRole);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
