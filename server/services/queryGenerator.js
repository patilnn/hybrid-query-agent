import linkedin from "./siteRules/linkedin.js";
import indeed from "./siteRules/indeed.js";
import naukri from "./siteRules/naukri.js";
import glassdoor from "./siteRules/glassdoor.js";
import reed from "./siteRules/reed.js";
import totaljobs from "./siteRules/totaljobs.js";

const siteRules = [linkedin, indeed, naukri, glassdoor, reed, totaljobs];

const PREFERENCE_KEYWORDS = {
  hybrid: ["hybrid"],
  onSite: ["on site", "on-site"],
  internship: ["internship"],
};

function normalizeSkills(skills) {
  if (!skills) return [];
  return skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function quote(term) {
  return term.includes(" ") ? `"${term}"` : term;
}

function buildBoolean({ role, skills, location, preferences }) {
  const skillList = normalizeSkills(skills).map(quote);
  const skillClause = skillList.length ? `(${skillList.join(" OR ")})` : "";
  const roleClause = quote(role);
  const locationClause = location ? quote(location) : "";

  const preferenceList = (preferences ?? [])
    .flatMap((pref) => PREFERENCE_KEYWORDS[pref] ?? [])
    .filter(Boolean);
  const preferenceClause = preferenceList.length
    ? `(${preferenceList.map(quote).join(" OR ")})`
    : "";

  return [roleClause, skillClause, preferenceClause, locationClause]
    .filter(Boolean)
    .join(" AND ");
}

function buildXRayQuery({ baseBoolean, domain }) {
  return `site:${domain} ${baseBoolean}`;
}

export async function buildQueries({ role, skills, location, preferences }) {
  const baseBoolean = buildBoolean({ role, skills, location, preferences });

  const siteQueries = {};
  const xrayQueries = {};

  for (const site of siteRules) {
    siteQueries[site.key] = baseBoolean;
    xrayQueries[site.key] = buildXRayQuery({ baseBoolean, domain: site.domain });
  }

  return {
    input: { role, skills, location, preferences },
    booleanQuery: baseBoolean,
    siteQueries,
    xrayQueries,
  };
}
