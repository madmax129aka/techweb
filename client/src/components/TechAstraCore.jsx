import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import TechAstraCoreErrorBoundary from "./TechAstraCoreErrorBoundary";
import TechAstraCoreStatic from "./TechAstraCoreStatic";

/**
 * "TechAstra Core" - an ORIGINAL 3D symbol (not modeled on, named after,
 * or a reproduction of any third-party trademarked character, franchise,
 * or asset - see the naming/DO-NOT-rename notes below). A central
 * glowing glass core gem, slowly rotating and breathing, orbited by six
 * smaller faceted "Nexus Stone" gems, one per TechAstra event track.
 *
 * THIS IS THE "BEST LOOKING" VERSION - it deliberately does NOT use the
 * literal, flatter values from the exact-spec build asked for earlier
 * (Environment "night", fully-saturated stone colors, low-detail
 * octahedron stones, no grounding shadow). Those values are individually
 * "correct" to that spec, but they're also exactly what caused the
 * "looks flat/plastic, not like glass" complaint the FIRST time this
 * component was built. This version restores every fix that actually
 * solved that problem, combined into one settings pass:
 *
 *   1. Environment preset "studio" (not "night") - a bright, evenly-lit
 *      HDRI. A transmissive glass material has NOTHING to refract or
 *      reflect against a near-black environment - "night" gives it
 *      almost no light to bend, which reads as flat plastic no matter
 *      how the material properties are tuned. "studio" is built
 *      specifically to show off reflective/refractive product materials.
 *   2. Pale, near-white material `color` on every gem (not the fully-
 *      saturated track hue) - a transmissive material colored with a
 *      fully saturated hex (e.g. solid "#3DD9EB") looks like solid
 *      dyed plastic, because there's no "clear" for light to pass
 *      through. The saturated hue is used ONLY for `emissive` (the
 *      glow) and the bloom pass's color, while `color` stays a faint
 *      tint of it - so light still visibly passes through the shape.
 *   3. Higher-detail icosahedron geometry on every gem (not a
 *      detail-0/1 octahedron) - more facets catch light at more
 *      distinct angles as the gem rotates, which is what actually
 *      reads as "a cut gem" instead of a smooth blob or a hard-edged
 *      low-poly diamond.
 *   4. Two-light setup: a bright, warm-toned KEY light from the upper
 *      front, and a dimmer, cool-toned FILL light from the opposite
 *      side - this produces a real, moving specular highlight plus a
 *      softened (not pure-black) shadow side as the object rotates,
 *      instead of one flat "painted-on" highlight dot from a single
 *      light.
 *   5. A soft grounding shadow (drei's <ContactShadows>) beneath the
 *      whole group, so it reads as occupying real 3D space rather than
 *      floating as a flat sprite with nothing anchoring it.
 *   6. Bloom tuned for a soft, believable glow (not a blown-out flare).
 *
 * NAMING: "TechAstra Core" / "Nexus Stone" are original names coined for
 * this project. Do not rename this file, its exported component, or any
 * on-screen text after any third-party trademarked character, film, or
 * franchise (e.g. Marvel/Avengers/Infinity Stones) - the geometry,
 * material choices, and color palette here are all original as well,
 * not a copy of any specific existing design.
 *
 * VERIFICATION CAVEAT: three / @react-three/fiber / drei / postprocessing
 * are listed in package.json, but this sandbox has no npm registry
 * access and no browser - none of this has been installed or rendered
 * for real. Written to the documented public API of each package;
 * please verify visually after `npm install` on a machine that can
 * actually run it.
 *
 * Fallback matrix (all render TechAstraCoreStatic.jsx, the pure-CSS
 * version, in this component's exact layout slot - never a blank gap):
 *  - prefers-reduced-motion: skips WebGL entirely, renders the static
 *    graphic with animated={false} (a genuinely still single frame).
 *  - WebGL unsupported, or any render error inside the Canvas tree:
 *    caught by TechAstraCoreErrorBoundary / a supportsWebGL() check,
 *    renders the static graphic with animated={true} (so the page still
 *    has some life to it even without real 3D).
 *  - off-screen: Canvas's `frameloop` prop toggles to "never" via an
 *    IntersectionObserver, pausing rendering instead of burning
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
 * Stones". `emissiveColor` is the intended saturated hue (drives the
 * inner glow + bloom tint); `paleColor` is the actual material `color` -
 * a near-white tint of that same hue, so light passes through the gem
 * instead of it reading as painted plastic (see fix #2 above). Colors
 * are illustrative - swap freely once TechAstra's real per-track
 * branding colors are finalized. `period` (seconds per revolution),
 * `radius`, `tilt` (how compressed the orbit's Z-axis is relative to X -
 * how "edge-on" this stone's orbit plane looks), `phase` (starting
 * angle, so stones don't all begin lined up), and `spin` (own-axis
 * rotation speed) are all varied per stone for visual richness.
 */
const STONE_CONFIG = [
  { emissiveColor: "#22D3EE", paleColor: "#D8F8FD", label: "Technical", radius: 2.2, period: 18, tilt: 0.35, phase: 0, spin: 1.4 },
  { emissiveColor: "#B565F0", paleColor: "#EFE1FD", label: "Non-Technical", radius: 2.6, period: 27, tilt: 0.55, phase: 1.1, spin: 1.0 },
  { emissiveColor: "#F2B84B", paleColor: "#FDECC9", label: "Flagship", radius: 1.9, period: 15, tilt: 0.2, phase: 2.4, spin: 1.8 },
  { emissiveColor: "#34D399", paleColor: "#DAF7EA", label: "Robotics", radius: 3.0, period: 34, tilt: 0.65, phase: 3.6, spin: 0.7 },
  { emissiveColor: "#E8495B", paleColor: "#FCDFE2", label: "Esports", radius: 2.4, period: 22, tilt: 0.45, phase: 4.5, spin: 1.2 },
  { emissiveColor: "#4C8DF6", paleColor: "#DEE9FE", label: "Creative", radius: 2.8, period: 40, tilt: 0.5, phase: 5.5, spin: 0.9 },
];

/** One orbiting gemstone: a small, richly-faceted glass gem with its own elliptical path, own-axis spin, and emissive glow. */
function OrbitingStone({ emissiveColor, paleColor, radius, period, tilt, phase, spin, reducedMotion }) {
  const groupRef = useRef(null);
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime * (Math.PI * 2 / period) + phase;

    // Elliptical orbit position (x = radius*cos(t), z = radius*sin(t)*tilt),
    // tracing a path tilted relative to the core rather than a flat circle.
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
      <mesh ref={meshRef} castShadow>
        {/* detail=1 (80 faces) instead of a detail=0 octahedron (8 flat
            faces) - this is the single biggest fix for the "hard-edged
            2D diamond" look; a gem this small still reads as faceted
            rather than smooth at this level of detail. */}
        <icosahedronGeometry args={[0.3, 1]} />
        <meshPhysicalMaterial
          color={paleColor}
          emissive={emissiveColor}
          emissiveIntensity={0.55}
          transmission={1}
          roughness={0.08}
          thickness={1.2}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          attenuationColor={emissiveColor}
          attenuationDistance={0.8}
        />
      </mesh>
    </group>
  );
}

/** The central "TechAstra Core" gem: larger faceted glass shape with a warm inner glow, slow spin, and a breathing scale pulse. */
function CoreGem({ reducedMotion }) {
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    if (reducedMotion || !meshRef.current) return;

    // Slow independent rotation, ~30s per revolution.
    meshRef.current.rotation.y += delta * (Math.PI * 2 / 30);
    meshRef.current.rotation.x += delta * 0.05;

    // Subtle breathing pulse: 1.0 -> 1.03 on a sine wave, not a hard loop.
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.015;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={meshRef} castShadow>
      {/* detail=1 keeps facets visible (a "cut gem" look) rather than a
          smoothed-out sphere - a higher detail value would round it off. */}
      <icosahedronGeometry args={[1.1, 1]} />
      <meshPhysicalMaterial
        color="#eafeff"
        transmission={1}
        roughness={0.1}
        thickness={1.4}
        ior={1.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
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

function Scene({ reducedMotion, enableParallax }) {
  return (
    <>
      {/* Soft fill-everything ambient, kept low - most of the shape
          reading should come from the key/fill lights + environment
          reflections below, not flat ambient light. */}
      <ambientLight intensity={0.25} />

      {/* Key light: bright, angled from the upper-front - creates a real,
          moving specular highlight and directional shading across the
          facets as the object rotates. */}
      <directionalLight position={[3, 5, 4]} intensity={2.2} color="#FFF6E8" />

      {/* Fill light: dimmer, cooler-toned, from the opposite side -
          softens the shadow side of the key light instead of leaving it
          pure black, without competing with the key light for the "main"
          highlight. */}
      <directionalLight position={[-4, -1.5, -2]} intensity={0.5} color="#8FD8FF" />

      {/* Environment lighting is what makes a transmissive glass material
          actually read as glass - without a bright HDRI to reflect/
          refract, it looks flat and fake. "studio" is a bright, evenly
          lit preset built for exactly this. */}
      <Suspense fallback={null}>
        <Environment preset="studio" />
      </Suspense>

      <ParallaxGroup enableParallax={enableParallax}>
        <CoreGem reducedMotion={reducedMotion} />
        {STONE_CONFIG.map((stone) => (
          <OrbitingStone key={stone.label} {...stone} reducedMotion={reducedMotion} />
        ))}
      </ParallaxGroup>

      {/* Soft grounding shadow beneath the whole group - a self-contained
          blurred blob (no shadow-camera frustum to calibrate), so the
          object feels anchored in 3D space instead of floating as a flat
          sprite. */}
      <ContactShadows position={[0, -1.9, 0]} opacity={0.45} scale={8} blur={2.6} far={3} color="#000000" />

      {/* Subtle bloom halo on the core/stones' emissive glow - soft, not
          an overblown flare. */}
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
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
          {/* Parallax is desktop/mouse-only - mobile keeps the ambient
              orbit/rotation animation with no pointer-driven tilt at all
              (there's no mouse to derive it from). */}
          <Scene reducedMotion={reduceMotion} enableParallax={finePointer} />
        </Canvas>
      </TechAstraCoreErrorBoundary>
    </div>
  );
}
