import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import TechAstraCoreErrorBoundary from "./TechAstraCoreErrorBoundary";
import TechAstraCoreStatic from "./TechAstraCoreStatic";

/**
 * SECTION 5C - "TechAstra Core": an ORIGINAL 3D symbol - a central
 * glowing crystal core with six smaller gemstones orbiting it, one per
 * TechAstra event track/energy.
 *
 * DO NOT rename this file/component/any UI text after, or model its
 * geometry/materials on, any third-party trademarked character, film, or
 * franchise symbol. All naming here ("TechAstra Core", "Nexus Stone" for
 * the individual gems) and the faceted-gem geometry are original to this
 * project - this file and its siblings must stay that way.
 *
 * THIS FILE NOW FOLLOWS AN EXACT, LITERAL BUILD SPEC ("The Core Cinematic
 * Scene") GIVEN VERBATIM BY THE USER - every geometry arg, material
 * property, light value, and animation constant below is copied from
 * that spec exactly, not re-derived or "improved." This deliberately
 * REVERSES several visual fixes made in the immediately prior session
 * (in response to a "looks flat/plastic" bug report), because the new
 * spec explicitly hardcodes different values for the same properties.
 * Every reversal is called out below so it isn't mistaken for an
 * oversight:
 *   - <Environment preset="night" /> - the prior fix swapped this to
 *     "studio" (a brighter HDRI) to fix a flat/plastic look. The new
 *     spec explicitly requires "night" ("without it the glass will
 *     render flat regardless of material settings" - so per the new
 *     spec, "night" is treated as sufficient once combined with its
 *     given material/light values).
 *   - Stone material `color` is now the fully-saturated STONE_CONFIG hue
 *     directly (e.g. solid "#3DD9EB"). The prior fix used a pale
 *     near-white tint as the base `color` instead, reserving the
 *     saturated hue for `emissive` only. The new spec's OrbitStone code
 *     sets `color={color}` (the saturated hue) AND `emissive={color}`.
 *   - Stone geometry is `octahedronGeometry` with `detail: 1` (per the
 *     spec's literal `<octahedronGeometry args={[size, 1]} />`) - not
 *     the icosahedron swap made in the prior fix.
 *   - Parallax is no longer gated to fine-pointer (mouse) devices only -
 *     the spec's `Rig` applies `state.pointer`-based tilt unconditionally
 *     to whatever device is in use, with no fine-pointer check.
 *   - The core's own inner point light (a fixed cyan pointLight mounted
 *     inside CoreGem) and the ContactShadows grounding shadow from the
 *     prior fix are both gone - the spec's exact `Scene` lighting is
 *     ambient + one directional + one scene-level pointLight only, and
 *     it does not include any contact/ground shadow at all.
 *
 * FALLBACK ARCHITECTURE (preserved from before, not part of the literal
 * spec code itself - the spec only specifies WHAT to fall back to, not
 * HOW to wire the fallback logic in React):
 *  - WebGL unsupported, or any render error inside the Canvas tree:
 *    caught by TechAstraCoreErrorBoundary / a supportsWebGL() check,
 *    rendering TechAstraCoreStatic.jsx (the pure-CSS fallback) in this
 *    component's exact layout slot - matches the spec's "On WebGL init
 *    failure ... render a static PNG/SVG fallback ... in the same
 *    .core-canvas-frame slot" requirement.
 *  - prefers-reduced-motion: per the spec's explicit instruction ("freeze
 *    useFrame updates ... render one static frame"), this NO LONGER
 *    swaps to the static CSS fallback (which is what the prior
 *    implementation did) - the real WebGL Canvas still mounts, but every
 *    useFrame callback below early-returns before touching
 *    rotation/position/scale, so the gem renders once at its initial
 *    pose and never animates.
 *  - off-screen: Canvas's `frameloop` prop toggles to "never" via an
 *    IntersectionObserver, pausing all rendering rather than burning
 *    CPU/battery on something nobody can see (not in the literal spec
 *    code, but a reasonable performance carryover with no conflicting
 *    spec instruction).
 *
 * VERIFICATION CAVEAT: three/@react-three/fiber/drei/postprocessing are
 * listed in package.json but this sandbox has no npm registry access, so
 * none of these packages could actually be installed or rendered in a
 * browser here - this component has NOT been runtime-verified. Please
 * test for real after `npm install`.
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

// Exact STONE_CONFIG from the spec - six stones, unique radius/speed/
// tilt/phase/size each, per the "do not make them uniform" instruction.
const STONE_CONFIG = [
  { color: "#3DD9EB", radius: 1.6, speed: 0.045, tilt: 0.2, phase: 0.0, size: 0.16 },
  { color: "#8B5CF6", radius: 1.9, speed: 0.032, tilt: -0.3, phase: 1.1, size: 0.14 },
  { color: "#F59E0B", radius: 1.4, speed: 0.055, tilt: 0.35, phase: 2.3, size: 0.15 },
  { color: "#22C55E", radius: 2.1, speed: 0.028, tilt: -0.15, phase: 3.4, size: 0.13 },
  { color: "#EF4444", radius: 1.7, speed: 0.038, tilt: 0.4, phase: 4.5, size: 0.15 },
  { color: "#3B82F6", radius: 1.95, speed: 0.03, tilt: -0.25, phase: 5.6, size: 0.14 },
];

/** Core gem - exact geometry/material/animation values from the spec. `reducedMotion` freezes rotation/pulse (spec: "render one static frame"). */
function CoreGem({ reducedMotion }) {
  const ref = useRef();
  useFrame((state, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.y += delta * 0.05; // one revolution ~126s
    const t = state.clock.getElapsedTime();
    const pulse = 1.0 + Math.sin(t * 0.6) * 0.03; // breathing scale 0.97-1.03
    ref.current.scale.setScalar(pulse);
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.85, 1]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={1.4}
        roughness={0.08}
        ior={1.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        color="#dff7f9"
        emissive="#3DD9EB"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

/** Orbiting stone - exact geometry/material/animation values from the spec. `reducedMotion` freezes orbit/spin (spec: "render one static frame"). */
function OrbitStone({ color, radius, speed, tilt, phase, size, reducedMotion }) {
  const ref = useRef();
  useFrame((state, delta) => {
    if (reducedMotion || !ref.current) return;
    const t = state.clock.getElapsedTime() * speed + phase;
    ref.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t) * radius * tilt,
      Math.sin(t) * radius
    );
    ref.current.rotation.x += delta * 0.6;
    ref.current.rotation.y += delta * 0.4;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[size, 1]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={0.8}
        roughness={0.1}
        ior={1.45}
        clearcoat={1}
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

/** Whole-group parallax rig - exact lerp factor/target formula from the spec. `reducedMotion` freezes the tilt (spec applies "freeze useFrame updates" to every useFrame hook, this one included). */
function Rig({ reducedMotion, children }) {
  const group = useRef();
  useFrame((state) => {
    if (reducedMotion || !group.current) return;
    const targetX = state.pointer.x * 0.25;
    const targetY = state.pointer.y * 0.15;
    group.current.rotation.y += (targetX - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (-targetY - group.current.rotation.x) * 0.05;
  });
  return <group ref={group}>{children}</group>;
}

function Scene({ reducedMotion }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 0, 0]} intensity={0.6} color="#3DD9EB" distance={3} />
      {/* Environment lighting - required per the spec for the glass
          material to read as glass at all. Wrapped in Suspense since
          drei's Environment loads its HDRI asynchronously (not in the
          literal spec snippet, but necessary for this to not throw). */}
      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>

      <Rig reducedMotion={reducedMotion}>
        <CoreGem reducedMotion={reducedMotion} />
        {STONE_CONFIG.map((s, i) => (
          <OrbitStone key={i} {...s} reducedMotion={reducedMotion} />
        ))}
      </Rig>

      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
      </EffectComposer>
    </>
  );
}

export default function TechAstraCore({ size = 320, className = "" }) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [webglOk, setWebglOk] = useState(true);
  const reduceMotion = useMemo(prefersReducedMotion, []);

  useEffect(() => {
    setWebglOk(supportsWebGL());
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

  // WebGL unsupported: the only case that swaps to the static CSS
  // fallback entirely - prefers-reduced-motion is handled INSIDE the
  // Canvas now (frozen useFrame hooks), per the spec.
  const fallback = <TechAstraCoreStatic size={size} animated className={className} />;
  if (!webglOk) {
    return fallback;
  }

  return (
    <div ref={containerRef} className={className} style={{ width: size, height: size }}>
      <TechAstraCoreErrorBoundary fallback={fallback}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          frameloop={inView ? "always" : "never"}
          style={{ background: "transparent" }}
        >
          <Scene reducedMotion={reduceMotion} />
        </Canvas>
      </TechAstraCoreErrorBoundary>
    </div>
  );
}
