import "../app/app.css";

import { frontendScaffold } from "../tooling-placeholder";

export function App() {
  return (
    <main className="scaffold">
      <section className="scaffold-card" aria-labelledby="scaffold-title">
        <p className="scaffold-kicker">{frontendScaffold.stage}</p>
        <h1 id="scaffold-title">{frontendScaffold.name}</h1>
        <p className="scaffold-subtitle">{frontendScaffold.subtitle}</p>
        <p className="scaffold-copy">
          The application shell will be added in a later milestone.
        </p>
      </section>
    </main>
  );
}
