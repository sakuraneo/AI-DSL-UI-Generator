// DSL 节点类型
export type DSLNode =
  | TextNode
  | ButtonNode
  | LinkNode
  | ImageNode
  | ChartNode
  | InputNode
  | DividerNode
  | CardNode
  | ContainerNode;

export interface BaseNode {
  type: string;
}

export interface TextNode extends BaseNode {
  type: "text";
  content: string;
}

export interface ButtonNode extends BaseNode {
  type: "button";
  label: string;
  /** 可选：动作标识或表达式，由宿主（或后续 AI 管线）解释执行 */
  action?: string;
  /** 若填写合法 http(s) URL，渲染为外链按钮并在新标签打开（常用于官网） */
  href?: string;
}

/** 行内文本链接（区别于块状 button） */
export interface LinkNode extends BaseNode {
  type: "link";
  href: string;
  label: string;
}

export interface ImageNode extends BaseNode {
  type: "image";
  src: string;
  /** 替代文本，供读屏与图片失败时显示 */
  alt: string;
}

/** 嵌入式日线图（TradingView widget），symbol 如 BTC、ETH */
export interface ChartNode extends BaseNode {
  type: "chart";
  symbol: string;
}

export interface InputNode extends BaseNode {
  type: "input";
  /** 与控件关联的可见标签 */
  label?: string;
  placeholder?: string;
  /** 对应原生 input 的 type，避免与节点 type 重名 */
  inputType?: "text" | "number" | "email" | "password";
}

/** 横向分隔线 */
export interface DividerNode extends BaseNode {
  type: "divider";
}

export interface CardNode extends BaseNode {
  type: "card";
  /** 预览卡片宽度（像素），可拖拽右下角改变；不写则由内容撑开 */
  width?: number;
  /** 预览卡片高度（像素） */
  height?: number;
  children: DSLNode[];
}

export interface ContainerNode extends BaseNode {
  type: "container";
  direction?: "row" | "column";
  gap?: number;
  children: DSLNode[];
}
