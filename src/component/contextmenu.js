import { h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';
import { cssPrefix } from '../config';
import { tf } from '../locale/locale';

const menuItems = [
  { key: 'copy', title: tf('contextmenu.copy'), label: 'Ctrl+C' },
  { key: 'cut', title: tf('contextmenu.cut'), label: 'Ctrl+X' },
  { key: 'paste', title: tf('contextmenu.paste'), label: 'Ctrl+V' },
  {
    key: 'paste-value',
    title: tf('contextmenu.pasteValue'),
    label: 'Ctrl+Shift+V',
  },
  {
    key: 'paste-format',
    title: tf('contextmenu.pasteFormat'),
    label: 'Ctrl+Alt+V',
  },
  { key: 'divider' },
  { key: 'insert-row', title: tf('contextmenu.insertRow') },
  { key: 'insert-column', title: tf('contextmenu.insertColumn') },
  { key: 'divider' },
  { key: 'delete-row', title: tf('contextmenu.deleteRow') },
  { key: 'delete-column', title: tf('contextmenu.deleteColumn') },
  { key: 'delete-cell-text', title: tf('contextmenu.deleteCellText') },
  { key: 'hide', title: tf('contextmenu.hide') },
  { key: 'divider' },
  { key: 'validation', title: tf('contextmenu.validation') },
  { key: 'divider' },
  { key: 'cell-printable', title: tf('contextmenu.cellprintable') },
  { key: 'cell-non-printable', title: tf('contextmenu.cellnonprintable') },
  { key: 'divider' },
  { key: 'cell-editable', title: tf('contextmenu.celleditable') },
  { key: 'cell-non-editable', title: tf('contextmenu.cellnoneditable') },
];

function buildMenuItem(item, customerKey) {
  if (item.key === 'divider') {
    return h('div', `${cssPrefix}-item divider`);
  }
  const el = h('div', `${cssPrefix}-item`)
    .on('click', () => {
      this.itemClick(item.key, customerKey);
      this.hide();
    })
    .children(item.title(), h('div', 'label').child(item.label || ''));

  console.log('el', el);

  if (item.key) {
    el.data.key = item.key;
  }

  return el;
}
function buildMenu(contentMenus) {
  const menusMap = menuItems.reduce((res, cur) => {
    res[cur.key] = cur;
    return res;
  }, {});
  if (Array.isArray(contentMenus)) {
    return contentMenus
      .map((menu) => {
        if (typeof menu === 'string') {
          if (menusMap[menu]) {
            return buildMenuItem.call(this, menusMap[menu]);
          }
          return buildMenuItem.call(this, { key: menu, title: () => menu }, true);
        } if (typeof menu === 'object' && menu.key) {
          return buildMenuItem.call(this, {
            key: menu.key,
            title:
              typeof menu.title === 'function' ? menu.title : () => menu.title,
          }, true);
        }

        return undefined;
      })
      .filter(Boolean);
  }
  return menuItems.map((it) => buildMenuItem.call(this, it));
}

export default class ContextMenu {
  constructor(viewFn, isHide = false, contentMenus) {
    this.menuItems = buildMenu.call(this, contentMenus);
    this.el = h('div', `${cssPrefix}-contextmenu`)
      .children(...this.menuItems)
      .hide();
    this.viewFn = viewFn;
    this.itemClick = () => {};
    this.isHide = isHide;
    this.setMode('range');
  }

  // row-col: the whole rows or the whole cols
  // range: select range
  setMode(mode) {
    const hideEl = this.menuItems.find((item) => item.data.key === 'hide');
    if (hideEl) {
      if (mode === 'row-col') {
        hideEl.show();
      } else {
        hideEl.hide();
      }
    }
  }

  hide() {
    const { el } = this;
    el.hide();
    unbindClickoutside(el);
  }

  setPosition(x, y) {
    if (this.isHide) return;
    const { el } = this;
    const { width } = el.show().offset();
    const view = this.viewFn();
    const vhf = view.height / 2;
    let left = x;
    if (view.width - x <= width) {
      left -= width;
    }
    el.css('left', `${left}px`);
    if (y > vhf) {
      el.css('bottom', `${view.height - y}px`)
        .css('max-height', `${y}px`)
        .css('top', 'auto');
    } else {
      el.css('top', `${y}px`)
        .css('max-height', `${view.height - y}px`)
        .css('bottom', 'auto');
    }
    bindClickoutside(el);
  }
}
