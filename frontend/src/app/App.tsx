import "../app/app.css";

export function App() {
  return (
    <main className="app-shell">
      <section className="workspace-shell" aria-labelledby="workspace-title">
        <aside
          className="side-panel side-panel--left"
          aria-label="Left sidebar placeholder"
        >
          <p className="panel-kicker">Left sidebar placeholder</p>
          <h2 id="workspace-title" className="panel-title">
            Placeholder only
          </h2>
          <p className="panel-copy">
            Informational region with no active behavior.
          </p>
        </aside>

        <div className="center-column">
          <section
            className="surface surface--playback"
            aria-label="Playback placeholder"
          >
            <p className="surface-kicker">Playback placeholder</p>
            <div className="surface-frame">
              <span className="surface-label">Playback placeholder</span>
              <p className="surface-copy">
                Center top region for viewing only.
              </p>
            </div>
          </section>

          <section
            className="surface surface--exact"
            aria-label="Exact-frame placeholder"
          >
            <p className="surface-kicker">Exact-frame placeholder</p>
            <div className="surface-frame">
              <span className="surface-label">Exact-frame placeholder</span>
              <p className="surface-copy">
                Center bottom region held for exact-frame work.
              </p>
            </div>
          </section>
        </div>

        <aside
          className="side-panel side-panel--right"
          aria-label="Right sidebar placeholder"
        >
          <p className="panel-kicker">Right sidebar placeholder</p>
          <h2 className="panel-title">Placeholder only</h2>
          <p className="panel-copy">
            Informational region. The center stack stays playback first,
            exact-frame second on compact screens.
          </p>
        </aside>
      </section>
    </main>
  );
}
