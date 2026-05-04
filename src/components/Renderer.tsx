import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DSLNode, InputNode, LinkNode } from "../schema/types";
import type { TradingViewChartTheme } from "../lib/tradingViewChart";
import {
  resolveTradingViewSymbol,
  tradingViewDailyChartEmbedUrl,
} from "../lib/tradingViewChart";
import { useTheme } from "../theme/useTheme";

export type RendererProps = {
  node: DSLNode;
  /** 仅根节点传入：拖拽调整卡片大小后写回 DSL（仅当根为 card 时 App 内会生效） */
  onRootCardPixelSize?: (width: number, height: number) => void;
};

function CardShell({
  node,
  onPixelSize,
  children,
}: {
  node: Extract<DSLNode, { type: "card" }>;
  onPixelSize?: (width: number, height: number) => void;
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lastEmitted = useRef<{ w: number; h: number } | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    lastEmitted.current = null;
  }, [node.width, node.height]);

  useEffect(() => {
    if (!onPixelSize || !sectionRef.current) return;
    const el = sectionRef.current;

    const flush = () => {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (w < 80 || h < 80) return;

      if (!lastEmitted.current) {
        lastEmitted.current = { w, h };
        return;
      }
      if (lastEmitted.current.w === w && lastEmitted.current.h === h) return;
      lastEmitted.current = { w, h };

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onPixelSize(w, h);
      }, 200);
    };

    const ro = new ResizeObserver(flush);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [onPixelSize]);

  const style: CSSProperties = {};
  if (node.width != null && node.width >= 80) style.width = node.width;
  if (node.height != null && node.height >= 80) style.height = node.height;

  return (
    <section
      ref={sectionRef}
      className="dsl-card dsl-card--resizable"
      style={style}
      aria-label="卡片内容"
    >
      {children}
    </section>
  );
}

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

function DslLink({ node }: { node: LinkNode }) {
  return (
    <a
      className="dsl-link"
      href={node.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {node.label}
    </a>
  );
}

function ChartFrame({ symbol }: { symbol: string }) {
  const tv = resolveTradingViewSymbol(symbol);
  const { effectiveScheme } = useTheme();
  const chartTheme: TradingViewChartTheme = effectiveScheme;
  const src = tradingViewDailyChartEmbedUrl(tv, chartTheme);
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

export default function Renderer({
  node,
  onRootCardPixelSize,
}: RendererProps) {
  switch (node.type) {
    case "text":
      return <p className="dsl-text">{node.content}</p>;

    case "link":
      return <DslLink node={node} />;

    case "divider":
      return <hr className="dsl-divider" />;

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
        <CardShell node={node} onPixelSize={onRootCardPixelSize}>
          {node.children.map((child, index) => (
            <Renderer key={index} node={child} />
          ))}
        </CardShell>
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
