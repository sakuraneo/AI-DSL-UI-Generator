import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export type DraggablePreviewPanelProps = {
  canvasRef: RefObject<HTMLDivElement | null>;
  /** 初始左上角偏移（画布内 px） */
  defaultPosition?: { x: number; y: number };
  /** 多个面板时用于叠放顺序 */
  zIndex?: number;
  handleLabel?: string;
  children: ReactNode;
};

/**
 * 画布内单个可拖动预览块（手柄 + body），多块时可各自独立拖动。
 */
export function DraggablePreviewPanel({
  canvasRef,
  defaultPosition = { x: 24, y: 24 },
  zIndex = 1,
  handleLabel = "拖动卡片",
  children,
}: DraggablePreviewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(defaultPosition);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);

  const clampPosToCanvas = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      const panel = panelRef.current;
      if (!canvas || !panel) return { x, y };
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const pw = panel.offsetWidth;
      const ph = panel.offsetHeight;
      if (cw <= 0 || ch <= 0) return { x, y };
      const maxX = Math.max(0, cw - pw);
      const maxY = Math.max(0, ch - ph);
      return {
        x: clamp(x, 0, maxX),
        y: clamp(y, 0, maxY),
      };
    },
    [canvasRef]
  );

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
    };
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const dx = e.clientX - d.startClientX;
    const dy = e.clientY - d.startClientY;
    setPos(clampPosToCanvas(d.startPosX + dx, d.startPosY + dy));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    dragRef.current = null;
  };

  useEffect(() => {
    const onWinResize = () =>
      setPos((p) => clampPosToCanvas(p.x, p.y));
    window.addEventListener("resize", onWinResize);
    return () => window.removeEventListener("resize", onWinResize);
  }, [clampPosToCanvas]);

  /** 用户拖拽调整画布大小时，把卡片位置限制在新的可视区域内 */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      setPos((p) => clampPosToCanvas(p.x, p.y));
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [canvasRef, clampPosToCanvas]);

  return (
    <div
      ref={panelRef}
      className="dsl-canvas-panel"
      style={{ left: pos.x, top: pos.y, zIndex }}
    >
      <div
        className="dsl-canvas-handle"
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="button"
        aria-label={`${handleLabel}：按住拖动`}
        tabIndex={0}
      >
        <span className="dsl-canvas-handle-icon" aria-hidden>
          ⋮⋮
        </span>
        {handleLabel}
      </div>
      <div className="dsl-canvas-body">{children}</div>
    </div>
  );
}
