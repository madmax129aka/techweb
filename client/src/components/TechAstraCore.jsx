import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import TechAstraCoreErrorBoundary from "./TechAstraCoreErrorBoundary";
import TechAstraCoreStatic from "./TechAstraCoreStatic";

/**
 * SECTION 5C - "TechAstra Core": an ORIGINAL 3D symbol - a central
 * glowing crystal core with six smaller gemstones orbiting it on tilted
 * elliptical paths, one per TechAstra event track/energy.
 *
 * DO NOT rename this file/component/any UI text after, or model its
 * geometry/materials on, any third-party trademarked character, film, or
 * franchise symbol. All naming here ("TechAstra Core", "Nexus Stone" for
 * the individual gems) and the faceted-gem geometry are original to this
 * project - this file and its siblings must stay that way.
 *
 * VERIFICATION CAVEAT: three/@react-three/fiber/drei/postprocessing are
 * listed in package.json but this sandbox has no npm registry access, so
 * none of these packages could actually be installed or rendered in a
 * browser here. Written carefully to the documented R3F/drei/
 * postprocessing APIs, but - unlike most other files in this repo - this
 * component has NOT been runtime-verified. Please test for real after
 * `npm install` before relying on it.
 *
 * Fallback matrix (all render TechAstraCoreStatic.jsx, the pure-CSS
 * version, in this component's exact layout position - never a blank
 * gap):
 *  - prefers-reduced-motion: renders the static graphic with
 *    animated=false (a genuinely still single frame) and never even
 *    creates a WebGL context.
 *  - WebGL unsupported / context creation fails / any render error inside
 *    the Canvas tree: caught by TechAstraCoreErrorBoundary, renders the
 *    static graphic with animated=true (so there's still some life to
 *    the page even without real 3D).
 *  - off-screen: Canvas's `frameloop` prop toggles to "never" via an
 *    IntersectionObserver, pausing all rendering rather than burning
 *    CPU/battery on something nobody can see.
 */

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function isFinePointer() {
  return typeof window !== "undefined" && (window.matchMedia?.("(pointer: fine)").matches ?? false);
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
 * Per-track color + orbital parameters for each of the six "Nexus
 * Stones". Colors are illustrative (per the brief) - swap freely once
 * TechAstra's real per-track branding colors are finalized. This
 * palette is original to TechAstra, not copied from any prior theme
 * this app has used.
 *
 * `period` (seconds per full revolution), `radius`, `tilt` (how
 * compressed the Z-axis of the ellipse is relative to X, i.e. how
 * "edge-on" this stone's orbit plane looks), `phase` (starting angle,
 * so stones don't all begin lined up), and `spin` (own-axis rotation
 * speed) are all varied per stone for visual richness, per the brief.
 */
const STONE_CONFIG = [
  { color: "#22D3EE", label: "Technical", radius: 2.2, period: 18, tilt: 0.35, phase: 0, spin: 1.4 },
  { color: "#B565F0", label: "Non-Technical", radius: 2.6, period: 27, tilt: 0.55, phase: 1.1, spin: 1.0 },
  { color: "#F2B84B", label: "Flagship", radius: 1.9, period: 15, tilt: 0.2, phase: 2.4, spin: 1.8 },
  { color: "#34D399", label: "Robotics", radius: 3.0, period: 34, tilt: 0.65, phase: 3.6, spin: 0.7 },
  { color: "#E8495B", label: "Esports", radius: 2.4, period: 22, tilt: 0.45, phase: 4.5, spin: 1.2 },
  { color: "#4C8DF6", label: "Creative", radius: 2.8, period: 40, tilt: 0.5, phase: 5.5, spin: 0.9 },
];

/** One orbiting gemstone: a small faceted octahedron with its own elliptical path, own-axis spin, and emissive glow. */
function OrbitingStone({ color, radius, period, tilt, phase, spin }) {
  const groupRef = useRef(null);
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * (Math.PI * 2 / period) + phase;

    // Elliptical orbit position, per the brief's formula
    // (x = radius*cos(t), z = radius*sin(t)*tiltFactor), tracing a path
    // tilted relative to the core rather than a flat circle.
    if (groupRef.current) {
      groupRef.current.position.x = radius * Math.cos(t);
      groupRef.current.position.z = radius * Math.sin(t) * tilt;
      groupRef.current.position.y = Math.sin(t * 1.3) * 0.2 * tilt;
    }

    // Independent own-axis spin, decoupled from orbital motion.
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * spin;
      meshRef.current.rotation.y += delta * spin * 0.7;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.9}
          roughness={0.25}
          metalness={0.1}
          clearcoat={1}
          transmission={0.3}
          thickness={0.3}
        />
      </mesh>
    </group>
  );
}

/** The central "TechAstra Core" gem: larger faceted glass shape with a warm inner glow, slow spin, and a breathing scale pulse. */
function CoreGem() {
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Slow independent rotation, ~30s per revolution per the brief.
    meshRef.current.rotation.y += delta * (Math.PI * 2 / 30);
    meshRef.current.rotation.x += delta * 0.05;

    // Subtle breathing pulse: 1.0 -> 1.03 on a sine wave, not a hard loop.
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.015;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={meshRef}>
      {/* detail=1 keeps facets visible (a "cut gem" look) rather than a
          smoothed-out sphere - a higher detail value would round it off. */}
      <icosahedronGeometry args={[1.1, 1]} />
      <meshPhysicalMaterial
        color="#eafeff"
        transmission={1}
        roughness={0.1}
        thickness={0.8}
        ior={1.45}
        clearcoat={1}
        attenuationDistance={2.5}
        attenuationColor="#22D3EE"
      />
      {/* Faint white-cyan glow from inside the core mesh itself. */}
      <pointLight color="#8FEFFF" intensity={2.2} distance={4} decay={2} />
    </mesh>
  );
}

/** Whole-group parallax tilt on mouse move (desktop/fine-pointer only) - subtle, never distracting. */
function ParallaxGroup({ enableParallax, children }) {
  const groupRef = useRef(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current || !enableParallax) return;
    const targetRotX = pointer.y * 0.12;
    const targetRotY = pointer.x * 0.18;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.04;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.04;
  });

  return <group ref={groupRef}>{children}</group>;
}

function Scene({ enableParallax }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 2]} intensity={1} />
      {/* Environment lighting is what makes a transmissive glass material
          actually read as glass - without an HDRI to reflect/refract, it
          looks flat and fake. "night" per the brief's lighting spec. */}
      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>

      <ParallaxGroup enableParallax={enableParallax}>
        <CoreGem />
        {STONE_CONFIG.map((stone) => (
          <OrbitingStone key={stone.label} {...stone} />
        ))}
      </ParallaxGroup>

      {/* Subtle bloom halo on the core/stones' emissive glow - tuned to
          the brief's 0.4-0.8 range, not an overblown flare. */}
      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export default function TechAstraCore({ size = 320, className = "" }) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [webglOk, setWebglOk] = useState(true);
  const [finePointer, setFinePointer] = useState(false);
  const reduceMotion = useMemo(prefersReducedMotion, []);

  useEffect(() => {
    setWebglOk(supportsWebGL());
    setFinePointer(isFinePointer());
  }, []);

  // Pause rendering entirely once scrolled out of view, rather than
  // letting an off-screen canvas keep animating in the background.
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const fallback = <TechAstraCoreStatic size={size} animated className={className} />;

  // Static/no-WebGL/reduced-motion all fall back to the pure-CSS gem -
  // no point paying for a WebGL context just to render something static
  // when prefers-reduced-motion is set, and no way to render WebGL at
  // all when it's unsupported.
  if (!webglOk) {
    return fallback;
  }
  if (reduceMotion) {
    return <TechAstraCoreStatic size={size} animated={false} className={className} />;
  }

  return (
    <div ref={containerRef} className={className} style={{ width: size, height: size }}>
      <TechAstraCoreErrorBoundary fallback={fallback}>
        <Canvas
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 6.5], fov: 42 }}
          frameloop={inView ? "always" : "never"}
          style={{ background: "transparent" }}
        >
          {/* Parallax is desktop/mouse-only, per the brief - mobile keeps
              the ambient orbit/rotation animation with no pointer-driven
              tilt at all (there's no mouse to derive it from). */}
          <Scene enableParallax={finePointer} />
        </Canvas>
      </TechAstraCoreErrorBoundary>
    </div>
  );
}
