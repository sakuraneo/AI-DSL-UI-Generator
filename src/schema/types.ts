// DSL 节点类型
export type DSLNode =
  | TextNode
  | ButtonNode
  | CardNode;

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
}

export interface CardNode extends BaseNode {
  type: "card";
  children: DSLNode[];
}