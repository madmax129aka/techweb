import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
// NOTE: `useThree` is still used inside GemMesh (for pointer position) -
// the unused FrameDriver approach that also imported it was removed above
// in favor of simply toggling Canvas's `frameloop` prop between "always"
// and "never" based on IntersectionObserver visibility, which is simpler
// and matches the brief's "reduce Canvas frameloop... when scrolled out
// of view" instruction directly without needing manual invalidation.
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import VisionStoneErrorBoundary from "./VisionStoneErrorBoundary";
import Polyhedron3D from "./Polyhedron3D";

/**
 * "Vision Stone" - a floating, semi-transparent glass/crystal gem for the
 * hero section, built with React Three Fiber + drei's
 * MeshTransmissionMaterial (real refractive glass, not a flat gradient
 * cutout). This is the WebGL upgrade path for the hero's centerpiece;
 * Polyhedron3D.jsx (pure CSS) remains as the fallback for every failure
 * case below, so the hero never breaks even if WebGL is unavailable.
 *
 * IMPORTANT - VERIFICATION CAVEAT: three/@react-three/fiber/drei/
 * postprocessing were added to package.json in this same change, but this
 * sandbox has no npm registry access, so none of these packages could
 * actually be installed here, and this component could not be
 * npm-installed or rendered in a browser to confirm it works. It is
 * written carefully to the documented R3F/drei APIs, but - unlike every
 * other file touched this session - it has NOT been runtime-verified.
 * Test this for real after `npm install` before relying on it.
 *
 * Fallback matrix:
 *  - prefers-reduced-motion: renders the static CSS Polyhedron3D instead
 *    (no rotation/float animation to honor the user's OS-level setting),
 *    and never even creates a WebGL context in this case
 *  - WebGL unsupported / context creation fails / any render error:
 *    caught by VisionStoneErrorBoundary -> renders Polyhedron3D
 *  - hero scrolled out of view: Canvas's `frameloop` prop is toggled to
 *    "never" via an IntersectionObserver, pausing all rendering rather
 *    than burning CPU/battery on an off-screen canvas
 */

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

/**
 * The gem mesh itself: icosahedron geometry, transmissive glass material,
 * motion. Only ever mounted once VisionStone has already confirmed
 * prefers-reduced-motion is off (see the early-return fallback below), so
 * it can unconditionally animate every frame.
 */
function GemMesh() {
  const meshRef = useRef(null);
  const { pointer } = useThree();
  const baseY = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Slow continuous Y rotation - one full turn roughly every 24s.
    meshRef.current.rotation.y += delta * (Math.PI * 2 / 24);
    meshRef.current.rotation.x += delta * 0.05;

    // Gentle sine-wave vertical float, weightless rather than static.
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = baseY.current + Math.sin(t * 0.6) * 0.15;

    // Subtle parallax: nudge position based on normalized pointer
    // coordinates (R3F's state.pointer is already -1..1), eased so it
    // doesn't feel jumpy.
    const targetX = pointer.x * 0.3;
    const targetZ = pointer.y * 0.15;
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.03;
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.03;
  });

  return (
    <mesh ref={meshRef}>
      {/* detail=1 keeps facets visible (a "cut gem" look) rather than a
          smoothed-out sphere - a higher detail value would round it off. */}
      <icosahedronGeometry args={[1.4, 1]} />
      <MeshTransmissionMaterial
        // Faint crimson tint per the theme's accent color, kept subtle so
        // the object still reads as clear glass rather than solid color.
        color="#AA0505"
        transmission={1}
        roughness={0.08}
        thickness={0.6}
        ior={1.45}
        chromaticAberration={0.02}
        anisotropy={0.1}
        distortion={0.1}
        distortionScale={0.2}
        temporalDistortion={0.1}
        clearcoat={1}
        attenuationDistance={2}
        attenuationColor="#22D3EE"
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      {/* Environment lighting is what makes a transmissive glass material
          actually read as glass - without an HDRI to reflect/refract, it
          looks flat and fake. "city" is a reasonably neutral built-in
          preset that drei fetches for us. */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      <GemMesh />
    </>
  );
}

export default function VisionStone({ size = 340, className = "" }) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [webglOk, setWebglOk] = useState(true);
  const reduceMotion = useMemo(prefersReducedMotion, []);

  useEffect(() => {
    setWebglOk(supportsWebGL());
  }, []);

  // Pause rendering entirely once the hero scrolls out of view, rather
  // than letting an off-screen canvas keep animating in the background.
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // The real 3D gem floats via its own JS-driven sine wave inside GemMesh
  // (see useFrame above), so the WebGL container itself doesn't need a
  // CSS float animation - but the CSS-only Polyhedron3D fallback has no
  // such built-in motion of its own, so it always gets "animate-float-slow"
  // baked in here regardless of whatever `className` the caller passes
  // (which is then free to be used purely for positioning, not motion).
  const fallback = <Polyhedron3D size={size} className={`animate-float-slow ${className}`} />;

  // Static/no-WebGL/reduced-motion all fall back to the pure-CSS gem -
  // no point paying for a WebGL context just to render something static
  // when prefers-reduced-motion is set, and no way to render WebGL at
  // all when it's unsupported.
  if (!webglOk || reduceMotion) {
    return fallback;
  }

  return (
    <div ref={containerRef} className={className} style={{ width: size, height: size }}>
      <VisionStoneErrorBoundary fallback={fallback}>
        <Canvas
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 4.2], fov: 40 }}
          frameloop={inView ? "always" : "never"}
          style={{ background: "transparent" }}
        >
          <Scene />
        </Canvas>
      </VisionStoneErrorBoundary>
    </div>
  );
}
