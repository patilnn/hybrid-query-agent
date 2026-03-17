import { useMemo, useState } from "react";
import "./App.css";

const SITE_LABELS = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  naukri: "Naukri",
  glassdoor: "Glassdoor",
  reed: "Reed",
  totaljobs: "TotalJobs",
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function App() {
  const [role, setRole] = useState("Frontend Developer");
  const [skills, setSkills] = useState("React, TypeScript, Next.js");
  const [location, setLocation] = useState("Bangalore");
  const [seniority, setSeniority] = useState("Mid");
  const [preferences, setPreferences] = useState({
    hybrid: false,
    onSite: false,
    internship: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const canSubmit = role.trim().length > 0;

  const togglePreference = (key) =>
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));

  const sites = useMemo(() => {
    if (!result?.siteQueries) return [];
    return Object.keys(result.siteQueries);
  }, [result]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/queries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          skills,
          location,
          seniority,
          preferences: Object.entries(preferences)
            .filter(([, value]) => value)
            .map(([key]) => key),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to generate queries.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard errors are non-fatal for the UI
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Job Search Optimization Agent</p>
          <h1>Boolean + X-Ray queries, instantly tuned for each job board.</h1>
          <p className="subhead">
            Generate tailored search strings for LinkedIn, Indeed, Naukri,
            Glassdoor, Reed, and TotalJobs from one clean dashboard.
          </p>
        </div>
        <div className="hero-panel">
          <div className="chip">LinkedIn</div>
          <div className="chip">Indeed</div>
          <div className="chip">Naukri</div>
          <div className="chip">Glassdoor</div>
          <div className="chip">Reed</div>
          <div className="chip">TotalJobs</div>
        </div>
      </header>

      <section className="panel">
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="role">Target role</label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="e.g., Backend Engineer"
            />
          </div>
          <div className="field">
            <label htmlFor="skills">Core skills</label>
            <input
              id="skills"
              type="text"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              placeholder="Comma separated"
            />
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="City or region"
            />
          </div>
          <div className="field">
            <label htmlFor="seniority">Seniority</label>
            <select
              id="seniority"
              value={seniority}
              onChange={(event) => setSeniority(event.target.value)}
            >
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>
          </div>
          <div className="field preference-field">
            <label>Work preferences</label>
            <div className="preference-options">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.hybrid}
                  onChange={() => togglePreference("hybrid")}
                />
                Hybrid
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.onSite}
                  onChange={() => togglePreference("onSite")}
                />
                On-site
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.internship}
                  onChange={() => togglePreference("internship")}
                />
                Internship
              </label>
            </div>
          </div>
          <button className="primary" type="submit" disabled={!canSubmit || loading}>
            {loading ? "Generating..." : "Generate Queries"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="results">
        <div className="results-header">
          <h2>Optimized queries</h2>
          <p>Copy and paste directly into each platform.</p>
        </div>

        <div className="result-card">
          <div>
            <h3>Base Boolean query</h3>
            <p className="muted">
              A clean Boolean string used as the base for every platform.
            </p>
          </div>
          <div className="query-box">
            <code>{result?.booleanQuery || "Fill the form to generate queries."}</code>
            <button onClick={() => copyText(result?.booleanQuery)}>Copy</button>
          </div>
        </div>

        <div className="site-grid">
          {sites.map((siteKey) => (
            <div className="site-card" key={siteKey}>
              <div className="site-header">
                <h3>{SITE_LABELS[siteKey] || siteKey}</h3>
                <span className="pill">Site query</span>
              </div>
              <div className="query-box">
                <code>{result?.siteQueries?.[siteKey]}</code>
                <button onClick={() => copyText(result?.siteQueries?.[siteKey])}>
                  Copy
                </button>
              </div>
              <div className="xray">
                <p className="muted">X-Ray</p>
                <div className="query-box compact">
                  <code>{result?.xrayQueries?.[siteKey]}</code>
                  <button onClick={() => copyText(result?.xrayQueries?.[siteKey])}>
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
