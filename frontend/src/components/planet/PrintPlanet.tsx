"use client";

import React, { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { PrintPlanet as PlanetScene } from "./printPlanetScene";

interface PrintPlanetProps {
  className?: string;
  /** Hands over the scene once it exists. Three.js loads separately from the page. */
  onScene?: (scene: PlanetScene) => void;
  /** Halftone dots per ink on large screens. Phones use 40% of this. */
  dots?: number;
  /** Skips the Three.js download below this width, for scenes hidden on phones. */
  minViewport?: number;
}

/**
 * Decorative only, so it is hidden from assistive tech. If WebGL is missing the
 * flat CMYK circles behind the canvas stay in place.
 */
export default function PrintPlanet({ className = "", onScene, dots = 11000, minViewport = 0 }: PrintPlanetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const onSceneRef = useRef(onScene);

  useEffect(() => {
    onSceneRef.current = onScene;
  }, [onScene]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || window.innerWidth < minViewport) return;

    let cancelled = false;
    let scene: PlanetScene | null = null;
    let visible = false;
    let resizeObserver: ResizeObserver | undefined;

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      scene?.setRunning(visible && !document.hidden);
    });
    const onVisibility = () => scene?.setRunning(visible && !document.hidden);
    const onPointer = (event: PointerEvent) => {
      if (!visible || event.pointerType === "touch") return;
      scene?.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
    };

    import("./printPlanetScene")
      .then(({ createPrintPlanet }) => {
        if (cancelled) return;
        const phone = window.matchMedia("(max-width: 767px)").matches;
        scene = createPrintPlanet(canvas, {
          dots: Math.round(phone ? dots * 0.4 : dots),
          still: prefersReducedMotion(),
          fontFamily: getComputedStyle(document.body).fontFamily,
        });

        resizeObserver = new ResizeObserver(([entry]) => {
          scene?.resize(entry.contentRect.width, entry.contentRect.height);
        });
        resizeObserver.observe(root);
        scene.resize(root.clientWidth, root.clientHeight);

        visibility.observe(root);
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("pointermove", onPointer, { passive: true });

        onSceneRef.current?.(scene);
        gsap.to(canvas, { opacity: 1, duration: 0.6, ease: "power2.out" });
        gsap.to(fallbackRef.current, { opacity: 0, duration: 0.4 });
      })
      .catch(() => {
        // No WebGL or the chunk failed: the static mark remains.
      });

    return () => {
      cancelled = true;
      visibility.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      scene?.dispose();
    };
  }, [dots, minViewport]);

  return (
    <div ref={rootRef} aria-hidden="true" className={`relative ${className}`}>
      <div ref={fallbackRef} className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-2/5 max-w-56 aspect-square">
          <span className="absolute inset-0 -translate-x-[5%] -translate-y-[3%] rounded-full bg-[#00A0DC] mix-blend-screen" />
          <span className="absolute inset-0 translate-x-[5%] -translate-y-[3%] rounded-full bg-[#D6127E] mix-blend-screen" />
          <span className="absolute inset-0 translate-y-[6%] rounded-full bg-[#F7D117] mix-blend-screen" />
        </div>
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-0" />
    </div>
  );
}
