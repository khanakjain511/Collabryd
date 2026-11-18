import { Component } from "react";
import type { ReactNode } from "react";

// React's native error boundary API uses a class. All product components are functions.
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="container access-page">
          <h1>Let’s take a fresh start.</h1>
          <p>
            The demo couldn’t display this screen. Refreshing will reset the
            example data.
          </p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              window.location.hash = "/";
              window.location.reload();
            }}
          >
            Restart the demo
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
