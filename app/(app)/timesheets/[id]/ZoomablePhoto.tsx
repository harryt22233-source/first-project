"use client";

import { useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_MS = 300;

export default function ZoomablePhoto({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [interacting, setInteracting] = useState(false);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartDist = useRef(0);
  const pinchStartScale = useRef(1);
  const panStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const lastTap = useRef(0);

  function reset() {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }

  function close() {
    setOpen(false);
    reset();
  }

  function distance(pts: { x: number; y: number }[]) {
    const [a, b] = pts;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setInteracting(true);

    if (pointers.current.size === 2) {
      pinchStartDist.current = distance([...pointers.current.values()]);
      pinchStartScale.current = scale;
    } else if (pointers.current.size === 1) {
      panStart.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const dist = distance([...pointers.current.values()]);
      if (pinchStartDist.current > 0) {
        const next = pinchStartScale.current * (dist / pinchStartDist.current);
        setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, next)));
      }
    } else if (pointers.current.size === 1 && scale > 1) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPos({ x: panStart.current.posX + dx, y: panStart.current.posY + dy });
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    const wasSinglePoint = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) setInteracting(false);

    if (wasSinglePoint) {
      const now = Date.now();
      if (now - lastTap.current < DOUBLE_TAP_MS) {
        if (scale > 1) {
          reset();
        } else {
          setScale(2.5);
        }
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full"
        aria-label="View timesheet photo full size"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Timesheet photo" className="max-h-80 w-full object-contain bg-zinc-900" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white"
            aria-label="Close"
          >
            ✕
          </button>
          <div
            className="h-full w-full touch-none overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Timesheet photo, zoomed"
              className="h-full w-full select-none object-contain"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transition: interacting ? "none" : "transform 0.15s ease-out",
              }}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
