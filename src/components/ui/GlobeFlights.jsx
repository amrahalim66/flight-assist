import { useEffect, useRef, useCallback, useState } from "react";
import createGlobe from "cobe";

/**
 * cobe's `dark` uniform is a polarity switch, not a dimmer:
 * mix((1 - q) * pow(i, 0.4), q, dark) — at 0 the landmass dots render dark on a
 * light sphere, at 1 they render bright on a dark sphere. So a light-background
 * globe needs a light baseColor with dark ~0, not just a paler navy.
 */
const GLOBE_THEMES = {
  light: {
    dark: 0,
    diffuse: 1.15,
    mapBrightness: 2.6,
    mapBaseBrightness: 0.05,
    baseColor: [0.86, 0.91, 0.98],
    markerColor: [0.11, 0.45, 0.85],
    glowColor: [0.62, 0.76, 0.94],
    opacity: 0.92,
  },
  dark: {
    dark: 0.1,
    diffuse: 2,
    mapBrightness: 6,
    mapBaseBrightness: 0,
    baseColor: [0.15, 0.25, 0.45],
    markerColor: [0.37, 0.72, 1],
    glowColor: [0.36, 0.49, 0.98],
    opacity: 0.9,
  },
};

function readTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

const defaultMarkers = [
  { id: "apt-jfk", location: [40.64, -73.78] },
  { id: "apt-lhr", location: [51.47, -0.46] },
  { id: "apt-dxb", location: [25.25, 55.36] },
  { id: "apt-nrt", location: [35.55, 139.78] },
  { id: "apt-sfo", location: [37.62, -122.38] },
  { id: "apt-sin", location: [1.36, 103.99] },
  { id: "apt-nbo", location: [-1.29, 36.82] },
  { id: "apt-bom", location: [19.08, 72.88] },
];

export function GlobeFlights({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}) {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);
  const isVisibleRef = useRef(true);
  const [theme, setTheme] = useState(readTheme);

  // The theme toggle swaps a data-theme attribute on <html>; cobe bakes its
  // colours in at creation, so the globe has to be rebuilt when that changes.
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(readTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const handlePointerDown = useCallback((e) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "grabbing";
      canvasRef.current.style.transform = "scale(1.02)";
    }
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "grab";
      canvasRef.current.style.transform = "scale(1)";
    }
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 200,
          theta: (e.clientY - pointerInteracting.current.y) / 800,
        };
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let globe = null;
    let animationId;
    let phi = 0;

    let currentWidth = 0;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;
      currentWidth = width;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.3,
        mapSamples: 20000,
        markerElevation: 0.005,
        markers: markers.map((m) => ({ location: m.location, size: 0.04 })),
        ...GLOBE_THEMES[theme],
      });

      function animate() {
        // Skip the WebGL draw while the globe is off-screen or the tab is hidden.
        if (!isVisibleRef.current || document.hidden) {
          animationId = requestAnimationFrame(animate);
          return;
        }
        if (!isPausedRef.current) phi += speed;
        globe.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.3 + thetaOffsetRef.current + dragOffset.current.theta,
        });
        animationId = requestAnimationFrame(animate);
      }

      animate();
      setTimeout(() => canvas && (canvas.style.opacity = "1"));
    }

    // Tear the globe down and rebuild it at the new size. cobe bakes the
    // render buffer dimensions in at creation, so a resized canvas would
    // otherwise be upscaled and blurry.
    function rebuild() {
      const width = canvas.offsetWidth;
      if (width === 0 || width === currentWidth) return;
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
      globe = null;
      animationId = undefined;
      init();
    }

    let resizeTimer;
    const ro = new ResizeObserver(() => {
      if (!globe) {
        init();
        return;
      }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 150);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    });
    io.observe(canvas);

    init();

    return () => {
      ro.disconnect();
      io.disconnect();
      clearTimeout(resizeTimer);
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, speed, theme]);

  return (
    <div className={className} style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1 / 1',
      userSelect: 'none',
    }}>
      {/* Static glow painted once. A drop-shadow filter on the wrapper would be
          re-blurred on every animated frame of the canvas. */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: '-12%',
        borderRadius: '50%',
        pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(94, 184, 255, 0.35) 0%, rgba(139, 124, 246, 0.2) 45%, transparent 70%)',
      }} />
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease, transform 0.2s ease",
          borderRadius: "50%",
          touchAction: "none",
          transform: "scale(1)",
        }}
      />
    </div>
  );
}
