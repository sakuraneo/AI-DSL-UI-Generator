import { useEffect, useId, useState } from "react";
import type { DSLNode, InputNode } from "../schema/types";
import type { TradingViewChartTheme } from "../lib/tradingViewChart";
import {
  resolveTradingViewSymbol,
  resolveTradingViewTheme,
  tradingViewDailyChartEmbedUrl,
} from "../lib/tradingViewChart";

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

function ChartFrame({ symbol }: { symbol: string }) {
  const tv = resolveTradingViewSymbol(symbol);
  const [theme, setTheme] = useState<TradingViewChartTheme>(() =>
    resolveTradingViewTheme()
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setTheme(resolveTradingViewTheme());
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const src = tradingViewDailyChartEmbedUrl(tv, theme);
  return (
    <div className="dsl-chart-wrap">
      <iframe
        className="dsl-chart-frame"
        src={src}
        title={`${symbol.trim().toUpperCase()} 日线图（TradingView）`}
      />
    </div>
  );
}

export default function Renderer({ node }: { node: DSLNode }) {
  switch (node.type) {
    case "text":
      return <p className="dsl-text">{node.content}</p>;

    case "button": {
      if (node.href) {
        return (
          <a
            className="dsl-btn dsl-btn--link"
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (node.action) {
                console.log("DSL action:", node.action);
              }
            }}
          >
            {node.label}
          </a>
        );
      }
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
    }

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

    case "chart":
      return <ChartFrame symbol={node.symbol} />;

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
