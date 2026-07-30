"use client";

import { useRef, useState } from "react";

const REVEAL_WIDTH = 84;
const OPEN_THRESHOLD = REVEAL_WIDTH / 2;
const AXIS_LOCK_THRESHOLD = 6;

/**
 * Standard mobile "swipe left to reveal an action" gesture, via Pointer
 * Events. Locks to the horizontal axis only once a drag clearly reads as
 * more horizontal than vertical, so it doesn't fight normal page
 * scrolling — a vertical-reading drag is left alone entirely.
 */
export function useSwipeToReveal() {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startTranslate = useRef(0);
  const axis = useRef<"x" | "y" | null>(null);
  const pointerId = useRef<number | null>(null);

  function close() {
    setTranslateX(0);
  }

  function onPointerDown(event: React.PointerEvent) {
    pointerId.current = event.pointerId;
    startX.current = event.clientX;
    startY.current = event.clientY;
    startTranslate.current = translateX;
    axis.current = null;
    setIsDragging(true);
  }

  function onPointerMove(event: React.PointerEvent) {
    if (pointerId.current !== event.pointerId) return;
    const dx = event.clientX - startX.current;
    const dy = event.clientY - startY.current;

    if (!axis.current) {
      if (Math.abs(dx) < AXIS_LOCK_THRESHOLD && Math.abs(dy) < AXIS_LOCK_THRESHOLD) {
        return;
      }
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axis.current === "x") {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }

    if (axis.current !== "x") return;
    event.preventDefault();
    const next = Math.min(0, Math.max(-REVEAL_WIDTH, startTranslate.current + dx));
    setTranslateX(next);
  }

  function endDrag(event: React.PointerEvent) {
    if (pointerId.current !== event.pointerId) return;
    pointerId.current = null;
    setIsDragging(false);
    if (axis.current !== "x") return;
    setTranslateX((current) => (current <= -OPEN_THRESHOLD ? -REVEAL_WIDTH : 0));
  }

  return {
    translateX,
    isOpen: translateX <= -OPEN_THRESHOLD,
    isDragging,
    revealWidth: REVEAL_WIDTH,
    close,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
