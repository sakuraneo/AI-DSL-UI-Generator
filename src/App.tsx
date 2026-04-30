import React from "react";

/**
 * 1. DSL 类型（先简单，后面可以扩展成 AST）
 */
type DSLNode =
  | {
      type: "text";
      props: {
        value: string;
      };
    }
  | {
      type: "button";
      props: {
        label: string;
        onClick?: string;
      };
    };

/**
 * 2. DSL Renderer（核心）
 * 这里就是 AI-DSL-UI-Generator 的灵魂
 */
function renderDSL(node: DSLNode): React.ReactNode {
  switch (node.type) {
    case "text":
      return <span>{node.props.value}</span>;

    case "button":
      return (
        <button
          onClick={() => {
            if (node.props.onClick) {
              // 先用最简单方式模拟执行
              console.log("DSL Action:", node.props.onClick);
            }
          }}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
            cursor: "pointer",
            marginLeft: 8,
          }}
        >
          {node.props.label}
        </button>
      );

    default:
      return null;
  }
}

/**
 * 3. 示例 DSL（后面会被 AI 替换）
 */
const dslTree: DSLNode[] = [
  {
    type: "text",
    props: {
      value: "Hello DSL → ",
    },
  },
  {
    type: "button",
    props: {
      label: "Click me",
      onClick: "alert('hello from DSL')",
    },
  },
];

/**
 * 4. App 入口
 */
export default function App() {
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>AI DSL UI Generator</h2>

      <div style={{ marginTop: 12 }}>
        {dslTree.map((node, idx) => (
          <React.Fragment key={idx}>{renderDSL(node)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}