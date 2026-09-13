import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
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
 * MATERIAL/LIGHTING BUG FIX: the previous version of this component
 * rendered as flat, matte, cartoonish shapes instead of glass, and the
 * root causes were:
 *   1. Orbiting stones used `octahedronGeometry` with `detail: 0` - only
 *      8 flat triangular faces, which reads as a hard-edged 2D "diamond"
 *      cutout rather than a faceted 3D gem. Now `icosahedronGeometry`
 *      with `detail: 1` (80 faces) on every stone.
 *   2. Stone material used fully-saturated flat colors (e.g. solid
 *      "#22D3EE") as the base `color`, plus a `metalness` property that
 *      has no place on a glass material at all. Now every stone's
 *      `color` is a pale, near-white tint of its hue (STONE_CONFIG's
 *      `paleColor`) so light actually transmits through it rather than
 *      reading as a painted solid; the saturated hex only drives the
 *      `emissive` glow and the bloom pass's color.
 *   3. Stone `transmission` (0.3) and `roughness` (0.25) were both far
 *      outside a convincing glass range - low transmission makes it
 *      opaque, and 0.25 roughness is matte/frosted, not polished glass.
 *      Now `transmission: 1`, `roughness` in the 0.05-0.15 band, with
 *      `ior`/`clearcoat`/`clearcoatRoughness` added (previously missing
 *      on stones entirely).
 *   4. `<Environment preset="night">` - a near-black HDRI with almost
 *      nothing bright in it - gives a transmissive material nothing to
 *      refract/reflect, which is most of why the previous result looked
 *      like flat plastic instead of glass. Switched to `"studio"`, a
 *      bright, evenly-lit HDRI built exactly for showing off reflective/
 *      refractive product materials.
 *   5. Lighting was a single flat ambient + a single directional light
 *      with no distinction between a "key" and "fill" light, which is
 *      why the previous render had one flat highlight dot rather than
 *      real specular falloff. Now a brighter angled key light (upper
 *      front) plus a dimmer, cooler-toned fill light from the opposite
 *      side, in addition to the ambient and the core's own inner glow.
 *   6. No grounding/contact shadow at all, so the object read as a flat
 *      sprite floating with no sense of it occupying real 3D space. Now
 *      drei's <ContactShadows> renders a soft, blurred dark ellipse
 *      beneath the whole group - this doesn't require setting up real
 *      shadow-casting lights (which would need calibrating a shadow
 *      camera frustum for very little visual gain here), just a
 *      purpose-built "soft ambient-occlusion-like darkening" as
 *      specified as the minimum acceptable option.
 *
 * VERIFICATION CAVEAT: three/@react-three/fiber/drei/postprocessing are
 * listed in package.json but this sandbox has no npm registry access, so
 * none of these packages could actually be installed or rendered in a
 * browser here - this component has NOT been runtime-verified, and no
 * screenshot could be taken to confirm the fix visually. Please test for
 * real after `npm install` and confirm it now reads as a polished glass
 * gem rather than flat plastic before considering this done.
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
 * Stones". `emissiveColor` is the intended saturated hue (drives the
 * inner glow + bloom tint); `paleColor` is the actual material `color` -
 * a near-white tint of that same hue, per the fix list's "pale icy cyan,
 * not solid teal, so light passes through" requirement. Colors are
 * illustrative (per the brief) - swap freely once TechAstra's real
 * per-track branding colors are finalized. This palette is original to
 * TechAstra, not copied from any prior theme this app has used.
 *
 * `period` (seconds per full revolution), `radius`, `tilt` (how
 * compressed the Z-axis of the ellipse is relative to X, i.e. how
 * "edge-on" this stone's orbit plane looks), `phase` (starting angle,
 * so stones don't all begin lined up), and `spin` (own-axis rotation
 * speed) are all varied per stone for visual richness, per the brief.
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
function OrbitingStone({ emissiveColor, paleColor, radius, period, tilt, phase, spin }) {
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
      <mesh ref={meshRef} castShadow>
        {/* detail=1 (80 faces) instead of the previous detail=0 octahedron
            (8 flat faces) - this is the single biggest fix for the
            "flat, hard-edged diamond" complaint. A gem this small still
            reads as faceted rather than smooth at this level of detail. */}
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

function Scene({ enableParallax }) {
  return (
    <>
      {/* Soft fill-everything ambient, kept low - most of the shape
          reading should come from the key/fill lights + environment
          reflections below, not flat ambient light (flat ambient with
          no directional key light was a big part of why the previous
          render had only one fake-looking highlight dot). */}
      <ambientLight intensity={0.25} />

      {/* Key light: bright, angled from the upper-front - this is what
          creates a real, moving specular highlight and directional
          shading across the facets as the object rotates, rather than
          flat even lighting. */}
      <directionalLight position={[3, 5, 4]} intensity={2.2} color="#FFF6E8" />

      {/* Fill light: dimmer, cooler-toned, from the opposite side - softens
          the shadow side of the key light instead of leaving it pure
          black, without competing with the key light for the "main"
          highlight. */}
      <directionalLight position={[-4, -1.5, -2]} intensity={0.5} color="#8FD8FF" />

      {/* Environment lighting is what makes a transmissive glass material
          actually read as glass - without a bright HDRI to reflect/
          refract, it looks flat and fake. "studio" is a bright, evenly
          lit preset built for exactly this (showing off reflective/
          refractive product materials) - the previous "night" preset is
          near-black and gave transmission almost nothing to work with,
          which was a primary cause of the flat/plastic look. */}
      <Suspense fallback={null}>
        <Environment preset="studio" />
      </Suspense>

      <ParallaxGroup enableParallax={enableParallax}>
        <CoreGem />
        {STONE_CONFIG.map((stone) => (
          <OrbitingStone key={stone.label} {...stone} />
        ))}
      </ParallaxGroup>

      {/* Soft grounding shadow beneath the whole group - a self-contained
          blurred blob (does not require any light to have castShadow
          enabled, no shadow-camera frustum to calibrate), satisfying the
          "at minimum a soft ambient-occlusion-like darkening beneath it"
          requirement without the complexity of a full real-time shadow
          setup for an object that has no literal ground plane around it. */}
      <ContactShadows position={[0, -1.9, 0]} opacity={0.45} scale={8} blur={2.6} far={3} color="#000000" />

      {/* Subtle bloom halo on the core/stones' emissive glow - tuned to
          the brief's 0.4-0.7 range with a ~0.2 luminance threshold. */}
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
          {/* Parallax is desktop/mouse-only, per the brief - mobile keeps
              the ambient orbit/rotation animation with no pointer-driven
              tilt at all (there's no mouse to derive it from). */}
          <Scene enableParallax={finePointer} />
        </Canvas>
      </TechAstraCoreErrorBoundary>
    </div>
  );
}
