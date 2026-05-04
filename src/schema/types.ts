// DSL 节点类型
export type DSLNode =
  | TextNode
  | ButtonNode
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
