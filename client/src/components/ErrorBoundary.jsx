import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    // Survives even when DevTools is closed — read it after the freeze clears
    console.error("💥 Render error:", error?.message);
    console.error("Component stack:", info?.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "monospace", color: "#b00" }}>
          <h2>Something crashed while rendering</h2>
          <pre>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}