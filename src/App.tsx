import Renderer from "./components/Renderer";
import { exampleDSL } from "./schema/dslSchema";

/**
 * 入口：单一数据源 exampleDSL（后续可由 AI 生成替换）
 */
export default function App() {
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>AI DSL UI Generator</h2>

      <div style={{ marginTop: 12 }}>
        <Renderer node={exampleDSL} />
      </div>
    </div>
  );
}
