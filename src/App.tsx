import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { PreviewCanvas } from "./components/PreviewCanvas";
import Renderer from "./components/Renderer";
import { exampleDSL } from "./schema/dslSchema";
import type { DSLNode } from "./schema/types";
import { copyTextToClipboard, downloadDslFile, stringifyDsl } from "./lib/dslJsonIo";
import { generateDSLFromPrompt } from "./lib/generateDSL";
import { parseDSLJSON } from "./lib/parseDSL";
import type { ThemePreference } from "./theme/themePreference";
import { useTheme } from "./theme/useTheme";

function ThemeToolbar() {
  const { preference, setPreference } = useTheme();
  const modes: { id: ThemePreference; label: string }[] = [
    { id: "light", label: "浅色" },
    { id: "dark", label: "深色" },
    { id: "system", label: "跟随系统" },
  ];
  return (
    <div
      role="group"
      aria-label="界面主题"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-h)",
        }}
      >
        主题
      </span>
      {modes.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={preference === id}
          onClick={() => setPreference(id)}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background:
              preference === id ? "var(--accent-bg)" : "transparent",
            color: "var(--text-h)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** 仅当输入框被清空时可见；有 value 时浏览器不显示 placeholder */
const PROMPT_PLACEHOLDER =
  "例如：做一个显示BTC今日价格的图表卡片，包含标题为“BTC今日价格走势”，和一个跳转到欧易官网btc模块的按钮，并在下方显示今日BTC最高价和最低价，设置目标价格，在打开官网的按钮左侧显示当前价格是否高于目标价";

function mergeRootCardPixelSize(
  prev: DSLNode,
  w: number,
  h: number
): DSLNode {
  if (prev.type !== "card") return prev;
  if (prev.width === w && prev.height === h) return prev;
  return { ...prev, width: w, height: h };
}

export default function App() {
  const [dsl, setDsl] = useState<DSLNode>(exampleDSL);
  const [prompt, setPrompt] = useState(
    "例如：做一个显示BTC今日价格的图表卡片，包含标题为“BTC今日价格走势”，和一个跳转到欧易官网btc模块的按钮，并在下方显示今日BTC最高价和最低价，设置目标价格，在打开官网的按钮左侧显示当前价格是否高于目标价"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonDraft, setJsonDraft] = useState("");
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const dslJsonFileRef = useRef<HTMLInputElement>(null);

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

  const onRootCardPixelSize = useCallback((w: number, h: number) => {
    setDsl((prev) => mergeRootCardPixelSize(prev, w, h));
  }, []);

  const onCopyDslJson = useCallback(async () => {
    setCopyHint(null);
    setError(null);
    try {
      await copyTextToClipboard(stringifyDsl(dsl));
      setCopyHint("已复制到剪贴板");
      window.setTimeout(() => setCopyHint(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "复制失败");
    }
  }, [dsl]);

  const onDownloadDslJson = useCallback(() => {
    setError(null);
    downloadDslFile(dsl, "dsl.json");
  }, [dsl]);

  const onFillJsonFromDsl = useCallback(() => {
    setError(null);
    setJsonDraft(stringifyDsl(dsl));
  }, [dsl]);

  const onApplyJsonDraft = useCallback(() => {
    setError(null);
    setCopyHint(null);
    try {
      const tree = parseDSLJSON(jsonDraft);
      setDsl(tree);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [jsonDraft]);

  const onClickPickJsonFile = useCallback(() => {
    dslJsonFileRef.current?.click();
  }, []);

  const onJsonFileSelected = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setError(null);
      setCopyHint(null);
      try {
        const text = await file.text();
        setJsonDraft(text);
        const tree = parseDSLJSON(text);
        setDsl(tree);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    []
  );

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif", maxWidth: 720 }}>
      <h2 style={{ marginTop: 0 }}>AI DSL UI Generator</h2>

      <ThemeToolbar />

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

      <h3 style={{ marginTop: 24, marginBottom: 8 }}>DSL JSON</h3>
      <p style={{ margin: "0 0 8px", fontSize: 13, color: "#555", textAlign: "start" }}>
        导出当前预览对应的 JSON，或粘贴 / <strong>选择本地 .json 文件</strong>
        ，经 Zod 校验后应用到下方预览。
      </p>
      <input
        ref={dslJsonFileRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        tabIndex={-1}
        onChange={(ev) => void onJsonFileSelected(ev)}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => void onCopyDslJson()}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#fff",
            color: "#111",
            cursor: "pointer",
          }}
        >
          复制当前 DSL
        </button>
        <button
          type="button"
          onClick={onDownloadDslJson}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#fff",
            color: "#111",
            cursor: "pointer",
          }}
        >
          下载 dsl.json
        </button>
        <button
          type="button"
          onClick={onFillJsonFromDsl}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#f8f8f8",
            color: "#333",
            cursor: "pointer",
          }}
        >
          用当前 DSL 填入下方
        </button>
        <button
          type="button"
          onClick={onClickPickJsonFile}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #1a3a8f",
            background: "#e8eefc",
            color: "#153885",
            cursor: "pointer",
          }}
        >
          导入本地 JSON 文件
        </button>
      </div>
      {copyHint && (
        <p
          role="status"
          style={{ margin: "0 0 8px", fontSize: 13, color: "#0a0" }}
        >
          {copyHint}
        </p>
      )}
      <label
        style={{ display: "block", fontWeight: 600, marginBottom: 6, textAlign: "start" }}
        htmlFor="dsl-json-import"
      >
        粘贴 JSON
      </label>
      <textarea
        id="dsl-json-import"
        value={jsonDraft}
        onChange={(e) => setJsonDraft(e.target.value)}
        rows={8}
        spellCheck={false}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 10,
          fontSize: 13,
          fontFamily: "ui-monospace, Consolas, monospace",
          borderRadius: 8,
          border: "1px solid #ccc",
          resize: "vertical",
        }}
        placeholder='{"type":"card","children":[...]}'
      />
      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          onClick={onApplyJsonDraft}
          style={{
            padding: "8px 16px",
            fontWeight: 600,
            borderRadius: 8,
            border: "1px solid #1a5f1a",
            background: "#e8f5e9",
            color: "#1b5e20",
            cursor: "pointer",
          }}
        >
          校验并应用到预览
        </button>
      </div>

      <h3 style={{ marginTop: 24, marginBottom: 8 }}>预览</h3>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 13,
          color: "#555",
          textAlign: "start",
        }}
      >
        下方为画布区域：拖动顶部「拖动卡片」条可移动预览区；卡片右下角可拖拽改变长宽，尺寸会写入根节点
        card 的 width / height（导出 JSON 可见）。
      </p>
      <div
        style={{ marginTop: 8, textAlign: "start" }}
        role="region"
        aria-label="DSL 预览"
      >
        <PreviewCanvas>
          <Renderer node={dsl} onRootCardPixelSize={onRootCardPixelSize} />
        </PreviewCanvas>
      </div>
    </div>
  );
}
