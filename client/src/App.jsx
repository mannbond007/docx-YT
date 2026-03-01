/**
 * App.jsx
 * Root application component — provides global layout shell (nav + footer)
 * and renders the single ConverterPage.
 */
import ConverterPage from "./pages/ConverterPage";

const App = () => (
  <div className="app">
    {/* ── Navigation ─────────────────────────────────────────────────── */}
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__brand">
        <span className="navbar__logo">⬡</span>
        <span className="navbar__name">DocuShift</span>
      </div>
      <span className="navbar__tagline">DOCX → PDF Converter</span>
    </nav>

    {/* ── Page Content ───────────────────────────────────────────────── */}
    <ConverterPage />

    {/* ── Footer ─────────────────────────────────────────────────────── */}
    <footer className="footer">
      <p>
        Built with <span aria-label="love">♥</span> using the MERN stack &mdash;{" "}
        <a href="#" className="footer__link">
          GitHub
        </a>
      </p>
      <p className="footer__note">
        Files are processed in-memory. Nothing is stored on disk.
      </p>
    </footer>
  </div>
);

export default App;
