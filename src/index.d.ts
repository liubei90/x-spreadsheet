export interface ExtendToolbarOption {
  tip?: string;
  el?: HTMLElement;
  icon?: string;
  onClick?: (data: object, sheet: object) => void;
}
export interface Options {
  mode?: "edit" | "read";
  showToolbar?: boolean;
  toolbars?: (
    | "undo"
    | "redo"
    | "print"
    | "paintformat"
    | "clearformat"
    | "format"
    | "font-name"
    | "font-size"
    | "font-bold"
    | "font-italic"
    | "underline"
    | "strike"
    | "color"
    | "bgcolor"
    | "border"
    | "merge"
    | "align"
    | "valign"
    | "textwrap"
    | "freeze"
    | "autofilter"
    | "formula"
  )[];
  showGrid?: boolean;
  showContextmenu?: boolean;
  showBottomBar?: boolean;
  /** 是否展示滚动条 */
  showScrollbar?: boolean;
  extendToolbar?: {
    left?: ExtendToolbarOption[];
    right?: ExtendToolbarOption[];
  };
  autoFocus?: boolean;
  view?: {
    /** 视口自动适配内容 */
    fit?: "content";
    height: () => number;
    width: () => number;
  };
  row?: {
    len?: number;
    height?: number;
    /** 列号行的高度，为 0 时不展示文本 */
    indexHeight?: number;
  };
  /** 是否展示列号文本 */
  showRowIndexText?: boolean;
  col?: {
    len?: number;
    width?: number;
    /** 行号列的宽度，为 0 时不展示文本 */
    indexWidth?: number;
    minWidth?: number;
  };
  /** 是否展示行号文本 */
  showColIndexText?: boolean;
  /** 右键菜单展示内容，可以传入自定义菜单 */
  contentMenus?: (
    | "copy"
    | "cut"
    | "paste"
    | "paste-value"
    | "paste-format"
    | "divider"
    | "insert-row"
    | "insert-column"
    | "delete-row"
    | "delete-column"
    | "delete-cell-text"
    | "hide"
    | "validation"
    | "cell-printable"
    | "cell-non-printable"
    | "cell-editable"
    | "cell-non-editable"
    | string
  )[];
  /** 自定义菜单点击事件，type 为传入的自定义菜单 */
  onCustomerMenuClick?: (
    type: string,
    data: Record<string, any>,
    sheet: Sheet
  ) => void;
  style?: {
    bgcolor: string;
    align: "left" | "center" | "right";
    valign: "top" | "middle" | "bottom";
    textwrap: boolean;
    strike: boolean;
    underline: boolean;
    color: string;
    font: {
      name: "Helvetica";
      size: number;
      bold: boolean;
      italic: false;
    };
  };
}

export type CELL_SELECTED = "cell-selected";
export type CELLS_SELECTED = "cells-selected";
export type CELL_EDITED = "cell-edited";

export type CellMerge = [number, number];

export interface SpreadsheetEventHandler {
  (
    envt: CELL_SELECTED,
    callback: (cell: Cell, rowIndex: number, colIndex: number) => void
  ): void;
  (
    envt: CELLS_SELECTED,
    callback: (
      cell: Cell,
      parameters: { sri: number; sci: number; eri: number; eci: number }
    ) => void
  ): void;
  (
    evnt: CELL_EDITED,
    callback: (text: string, rowIndex: number, colIndex: number) => void
  ): void;
}

export interface ColProperties {
  width?: number;
}

/**
 * Data for representing a cell
 */
export interface CellData {
  text: string;
  style?: number;
  merge?: CellMerge;
}
/**
 * Data for representing a row
 */
export interface RowData {
  cells: {
    [key: number]: CellData;
  };
}

/**
 * Data for representing a sheet
 */
export interface SheetData {
  name?: string;
  freeze?: string;
  styles?: CellStyle[];
  merges?: string[];
  cols?: {
    len?: number;
    [key: number]: ColProperties;
  };
  rows?: {
    [key: number]: RowData;
  };
}

/**
 * Data for representing a spreadsheet
 */
export interface SpreadsheetData {
  [index: number]: SheetData;
}

export interface CellStyle {
  align?: "left" | "center" | "right";
  valign?: "top" | "middle" | "bottom";
  font?: {
    bold?: boolean;
  };
  bgcolor?: string;
  textwrap?: boolean;
  color?: string;
  border?: {
    top?: string[];
    right?: string[];
    bottom?: string[];
    left?: string[];
  };
}
export interface Editor {}
export interface Element {}

export interface DataProxy {
  getSelectedCell(): Cell | null;
  getSelectedCellIndex(): { ri: number; ci: number } | null;
  setSelectedCellAttr(property: string, value: any): void;
  setCellText(ri: number, ci: number, text: string | undefined, state: 'input' | 'finished'): void;
}

export interface Row {}
export interface Table {}
export interface Cell {}
export interface Sheet {
  data: DataProxy;

  isHideSelector(): boolean;
}

export default class Spreadsheet {
  sheet: Sheet;
  data: DataProxy;
  constructor(container: string | HTMLElement, opts?: Options);
  on: SpreadsheetEventHandler;
  /**
   * retrieve cell
   * @param rowIndex {number} row index
   * @param colIndex {number} column index
   * @param sheetIndex {number} sheet iindex
   */
  cell(rowIndex: number, colIndex: number, sheetIndex: number): Cell;
  /**
   * retrieve cell style
   * @param rowIndex
   * @param colIndex
   * @param sheetIndex
   */
  cellStyle(rowIndex: number, colIndex: number, sheetIndex: number): CellStyle;
  /**
   * get/set cell text
   * @param rowIndex
   * @param colIndex
   * @param text
   * @param sheetIndex
   */
  cellText(
    rowIndex: number,
    colIndex: number,
    text: string,
    sheetIndex?: number
  ): this;
  /**
   * remove current sheet
   */
  deleteSheet(): void;

  /**s
   * load data
   * @param json
   */
  loadData(json: Record<string, any> | Record<string, any>[]): this;
  /**
   * get data
   */
  getData(): Record<string, any>[];
  /**
   * bind handler to change event, including data change and user actions
   * @param callback
   */
  change(callback: (json: Record<string, any>) => void): this;
  /** 移除指定 sheet */
  removeSheet(index: number): this;
  /** 新增 sheet */
  addSheet(name: string, active = true): this;
  /** 激活 sheet */
  activeSheet: (index: number) => this;
  /** 获取当前 sheet 索引 */
  getActiveSheetIndex: () => number;
  /** 设置 sheet 的名称 */
  updateSheetName: (i: number, name: string) => this;
  /** 重绘 */
  reRender(): this;
  /**
   * set locale
   * @param lang
   * @param message
   */
  static locale(lang: string, message: object): void;
}

declare global {
  interface Window {
    y_spreadsheet(container: string | HTMLElement, opts?: Options): Spreadsheet;
  }
}
