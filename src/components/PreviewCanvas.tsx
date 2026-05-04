import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type PreviewCanvasProps = {
  children: ReactNode;
};

/**
 * 预览画布：通过顶部拖动手柄移动整卡片，避免与内部按钮/链接误触。
 */
export function PreviewCanvas({ children }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 24, y: 24 });
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
    []
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
    setPos(
      clampPosToCanvas(d.startPosX + dx, d.startPosY + dy)
    );
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
    const onResize = () =>
      setPos((p) => clampPosToCanvas(p.x, p.y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampPosToCanvas]);

  return (
    <div
      ref={canvasRef}
      className="dsl-canvas"
      role="presentation"
      aria-label="可拖动预览画布"
    >
      <div
        ref={panelRef}
        className="dsl-canvas-panel"
        style={{ left: pos.x, top: pos.y }}
      >
        <div
          className="dsl-canvas-handle"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          role="button"
          aria-label="按住拖动以移动预览卡片"
          tabIndex={0}
        >
          <span className="dsl-canvas-handle-icon" aria-hidden>
            ⋮⋮
          </span>
          拖动卡片
        </div>
        <div className="dsl-canvas-body">{children}</div>
      </div>
    </div>
  );
}
