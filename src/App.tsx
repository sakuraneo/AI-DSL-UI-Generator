import { useCallback, useState } from "react";
import Renderer from "./components/Renderer";
import { exampleDSL } from "./schema/dslSchema";
import type { DSLNode } from "./schema/types";
import { generateDSLFromPrompt } from "./lib/generateDSL";

/** 仅当输入框被清空时可见；有 value 时浏览器不显示 placeholder */
const PROMPT_PLACEHOLDER =
  "例如：做一个显示BTC今日价格的图表卡片，包含标题为“BTC今日价格走势”，和一个跳转到欧易官网btc模块的按钮，并在下方显示今日BTC最高价和最低价 等 action";

export default function App() {
  const [dsl, setDsl] = useState<DSLNode>(exampleDSL);
  const [prompt, setPrompt] = useState(
    "做一个咖啡订单卡片：标题「今日特调」，下面一行显示价格 32 元和一个「下单」按钮，action 用 order.coffee"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const tree = await generateDSLFromPrompt(prompt);
      setDsl(tree);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const onReset = useCallback(() => {
    setDsl(exampleDSL);
    setError(null);
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif", maxWidth: 720 }}>
      <h2 style={{ marginTop: 0 }}>AI DSL UI Generator</h2>

      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        用自然语言描述界面
      </label>
      <p style={{ marginBottom: 6, fontSize: 13, color: "#555" }}>{PROMPT_PLACEHOLDER}</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 10,
          fontSize: 14,
          borderRadius: 8,
          border: "1px solid #ccc",
          resize: "vertical",
        }}
      />

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={loading}
          onClick={() => void onGenerate()}
          style={{
            padding: "8px 16px",
            fontWeight: 600,
            borderRadius: 8,
            border: "1px solid #333",
            background: loading ? "#ddd" : "#111",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "生成中…" : "生成 DSL 并预览"}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            color: "#333",
          }}
        >
          恢复示例
        </button>
      </div>

      {import.meta.env.DEV && (
        <p style={{ marginTop: 12, fontSize: 13, color: "#555" }}>
          开发模式：在项目根目录配置 <code>DEEPSEEK_API_KEY</code>（见{" "}
          <code>.env.example</code>），保存后执行 <code>pnpm run dev</code>{" "}
          重启开发服务器。
        </p>
      )}

      {error && (
        <div
          role="alert"
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 8,
            background: "#fff4f4",
            border: "1px solid #f0b4b4",
            color: "#8b1a1a",
            fontSize: 14,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </div>
      )}

      <h3 style={{ marginTop: 24, marginBottom: 8 }}>预览</h3>
      <div
        style={{ marginTop: 8, textAlign: "start" }}
        role="region"
        aria-label="DSL 预览"
      >
        <Renderer node={dsl} />
      </div>
    </div>
  );
}
