import React from "react";

/**
 * Catches any render/init failure inside the R3F <Canvas> tree (e.g. WebGL
 * context creation failing, a driver quirk, a Three.js runtime error) and
 * swaps in the caller-provided fallback instead of taking down the whole
 * hero section. React error boundaries must be class components - there
 * is no hooks equivalent for componentDidCatch.
 */
export default class VisionStoneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("VisionStone (3D hero object) failed to render, falling back to static graphic:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
