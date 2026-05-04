// DSL 节点类型
export type DSLNode =
  | TextNode
  | ButtonNode
  | ImageNode
  | InputNode
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
}

export interface ImageNode extends BaseNode {
  type: "image";
  src: string;
  /** 替代文本，供读屏与图片失败时显示 */
  alt: string;
}

export interface InputNode extends BaseNode {
  type: "input";
  /** 与控件关联的可见标签 */
  label?: string;
  placeholder?: string;
  /** 对应原生 input 的 type，避免与节点 type 重名 */
  inputType?: "text" | "number" | "email" | "password";
}

export interface CardNode extends BaseNode {
  type: "card";
  children: DSLNode[];
}

export interface ContainerNode extends BaseNode {
  type: "container";
  direction?: "row" | "column";
  gap?: number;
  children: DSLNode[];
}
