import type { DSLNode } from "../schema/types";

export default function Renderer({ node }: { node: DSLNode }) {
  switch (node.type) {
    case "text":
      return <p style={{ margin: 0 }}>{node.content}</p>;

    case "button":
      return (
        <button
          type="button"
          onClick={() => {
            if (node.action) {
              console.log("DSL action:", node.action);
            }
          }}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
            cursor: "pointer",
            font: "inherit",
          }}
        >
          {node.label}
        </button>
      );

    case "card":
      return (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {node.children.map((child, index) => (
            <Renderer key={index} node={child} />
          ))}
        </div>
      );

    case "container":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: node.direction ?? "column",
            gap: node.gap ?? 8,
            alignItems: node.direction === "row" ? "center" : undefined,
            flexWrap: node.direction === "row" ? "wrap" : undefined,
          }}
        >
          {node.children.map((child, index) => (
            <Renderer key={index} node={child} />
          ))}
        </div>
      );

    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}
