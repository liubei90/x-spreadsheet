/* global window, document */
import { h } from "./component/element";
import DataProxy from "./core/data_proxy";
import Sheet from "./component/sheet";
import Bottombar from "./component/bottombar";
import { cssPrefix } from "./config";
import { locale } from "./locale/locale";

class Spreadsheet {
  constructor(selectors, options = {}) {
    let targetEl = selectors;
    this.options = { showBottomBar: true, ...options };
    this.sheetIndex = 1;
    this.datas = [];
    if (typeof selectors === "string") {
      targetEl = document.querySelector(selectors);
    }
    this.bottombar = this.options.showBottomBar
      ? new Bottombar(
          () => {
            if (this.options.mode === "read") return;
            const d = this.addSheet();
            this.sheet.resetData(d);
          },
          (index) => {
            const d = this.datas[index];
            this.sheet.resetData(d);
          },
          () => {
            this.deleteSheet();
          },
          (index, value) => {
            this.datas[index].name = value;
            this.sheet.trigger("change");
          }
        )
      : null;
    const rootEl = h("div", `${cssPrefix}`).on("contextmenu", (evt) =>
      evt.preventDefault()
    );
    // create canvas element
    targetEl.appendChild(rootEl.el);
    const d = this.addSheet();
    this.sheet = new Sheet(rootEl, d);
    if (this.bottombar !== null) {
      rootEl.child(this.bottombar.el);
    }
  }

  get data() {
    return this.sheet.data;
  }

  addSheet(name, active = false) {
    const n = name || `sheet${this.sheetIndex}`;
    const d = new DataProxy(n, this.options);
    d.change = (...args) => {
      this.sheet.trigger("change", ...args);
    };
    this.datas.push(d);
    // console.log('d:', n, d, this.datas);
    if (this.bottombar !== null) {
      this.bottombar.addItem(n, active, this.options);
    }
    this.sheetIndex += 1;
    return d;
  }

  deleteSheet() {
    if (this.bottombar === null) return;

    const [oldIndex, nindex] = this.bottombar.deleteItem();
    if (oldIndex >= 0) {
      this.datas.splice(oldIndex, 1);
      if (nindex >= 0) this.sheet.resetData(this.datas[nindex]);
      this.sheet.trigger("change");
    }
  }

  removeSheet(index) {
    if (index >= 0 && this.datas[index]) {
      const activeIndex = this.getActiveSheetIndex();
      this.datas.splice(index, 1);

      if (activeIndex === index) {
        const nindex = index - 1;
        if (nindex >= 0) {
          this.sheet.resetData(this.datas[nindex]);
        } else {
          this.sheet.resetData(this.datas[index + 1]);
        }
      }

      this.sheet.trigger("change");
    }
  }

  activeSheet(index) {
    const d = this.datas[index];

    if (d) {
      this.sheet.resetData(d);
    }
  }

  getActiveSheetIndex() {
    const d = this.sheet.data;

    return this.datas.indexOf(d);
  }

  updateSheetName(index, value) {
    console.log("updateSheetName", index, value);

    if (this.datas[index]) {
      this.datas[index].name = value;
      this.sheet.trigger("change");
    }
  }

  loadData(data) {
    const ds = Array.isArray(data) ? data : [data];
    if (this.bottombar !== null) {
      this.bottombar.clear();
    }
    this.datas = [];
    if (ds.length > 0) {
      for (let i = 0; i < ds.length; i += 1) {
        const it = ds[i];
        const nd = this.addSheet(it.name, i === 0);
        nd.setData(it);
        if (i === 0) {
          this.sheet.resetData(nd);
        }
      }
    }
    return this;
  }

  getData() {
    return this.datas.map((it) => it.getData());
  }

  cellText(ri, ci, text, sheetIndex = 0) {
    this.datas[sheetIndex].setCellText(ri, ci, text, "finished");
    return this;
  }

  cell(ri, ci, sheetIndex = 0) {
    return this.datas[sheetIndex].getCell(ri, ci);
  }

  cellStyle(ri, ci, sheetIndex = 0) {
    return this.datas[sheetIndex].getCellStyle(ri, ci);
  }

  reRender() {
    this.sheet.table.render();
    return this;
  }

  on(eventName, func) {
    this.sheet.on(eventName, func);
    return this;
  }

  validate() {
    const { validations } = this.data;
    return validations.errors.size <= 0;
  }

  change(cb) {
    this.sheet.on("change", cb);
    return this;
  }

  static locale(lang, message) {
    locale(lang, message);
  }
}

const spreadsheet = (el, options = {}) => new Spreadsheet(el, options);

if (window) {
  window.y_spreadsheet = spreadsheet;
  window.y_spreadsheet.locale = (lang, message) => locale(lang, message);
}

export default Spreadsheet;
export { spreadsheet };
