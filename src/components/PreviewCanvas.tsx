import { useRef, type ReactNode } from "react";
import { DraggablePreviewPanel } from "./DraggablePreviewPanel";

type PreviewCanvasProps = {
  children: ReactNode;
};

/**
 * 预览画布：单个拖动面板包裹整块预览（根 DSL 非「纯多 card 容器」时使用）。
 */
export function PreviewCanvas({ children }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={canvasRef}
      className="dsl-canvas"
      role="presentation"
      aria-label="可拖动预览画布"
    >
      <DraggablePreviewPanel canvasRef={canvasRef}>{children}</DraggablePreviewPanel>
    </div>
  );
}

export type MultiCardPreviewCanvasProps = {
  /** 每张卡片对应的预览节点（通常每张是一个 Renderer(card)） */
  panels: ReactNode[];
};

/**
 * 根为 container 且子节点全部为 card 时：每张卡片各自一条拖动柄，互不牵连。
 */
export function MultiCardPreviewCanvas({ panels }: MultiCardPreviewCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={canvasRef}
      className="dsl-canvas"
      role="presentation"
      aria-label="可拖动预览画布（多卡片独立拖动）"
    >
      {panels.map((panel, i) => (
        <DraggablePreviewPanel
          key={i}
          canvasRef={canvasRef}
          defaultPosition={{ x: 24 + i * 40, y: 24 + i * 40 }}
          zIndex={1 + i}
          handleLabel={panels.length > 1 ? `拖动卡片 ${i + 1}` : "拖动卡片"}
        >
          {panel}
        </DraggablePreviewPanel>
      ))}
    </div>
  );
}
