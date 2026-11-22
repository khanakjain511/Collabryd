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
        <main className="max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Let’s take a fresh start.
          </h1>
          <p className="text-muted text-base max-w-md">
            The demo couldn’t display this screen. Refreshing will reset the
            example data.
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer shadow-sm"
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
