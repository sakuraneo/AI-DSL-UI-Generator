import { useId } from "react";
import type { DSLNode, InputNode } from "../schema/types";

function InputField({ node }: { node: InputNode }) {
  const id = useId();
  const t = node.inputType ?? "text";
  const input = (
    <input
      id={id}
      className="dsl-input"
      type={t}
      placeholder={node.placeholder}
      readOnly
      aria-readonly="true"
    />
  );

  if (node.label) {
    return (
      <div className="dsl-input-field">
        <label htmlFor={id} className="dsl-input-label">
          {node.label}
        </label>
        {input}
      </div>
    );
  }

  return (
    <input
      id={id}
      className="dsl-input"
      type={t}
      placeholder={node.placeholder}
      readOnly
      aria-readonly="true"
      aria-label={node.placeholder ?? "输入框"}
    />
  );
}

export default function Renderer({ node }: { node: DSLNode }) {
  switch (node.type) {
    case "text":
      return <p className="dsl-text">{node.content}</p>;

    case "button":
      return (
        <button
          type="button"
          className="dsl-btn"
          onClick={() => {
            if (node.action) {
              console.log("DSL action:", node.action);
            }
          }}
          aria-label={
            node.action
              ? `${node.label}，操作 ${node.action}`
              : undefined
          }
          title={node.action ? `action: ${node.action}` : undefined}
        >
          {node.label}
        </button>
      );

    case "image":
      return (
        <img
          className="dsl-img"
          src={node.src}
          alt={node.alt}
          loading="lazy"
          decoding="async"
        />
      );

    case "input":
      return <InputField node={node} />;

    case "card":
      return (
        <section className="dsl-card" aria-label="卡片内容">
          {node.children.map((child, index) => (
            <Renderer key={index} node={child} />
          ))}
        </section>
      );

    case "container":
      return (
        <div
          className="dsl-container"
          style={{
            flexDirection: node.direction ?? "column",
            gap: node.gap ?? 8,
            alignItems: node.direction === "row" ? "center" : "stretch",
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
