import { buildQueries } from "../services/queryGenerator.js";
import { sanitizeInput } from "../utils/sanitize.js";

export async function generateQueries(req, res) {
  const role = sanitizeInput(req.body?.role);
  const skills = sanitizeInput(req.body?.skills);
  const location = sanitizeInput(req.body?.location);
  const preferences = Array.isArray(req.body?.preferences)
    ? req.body.preferences
        .map((pref) => String(pref).trim())
        .filter(Boolean)
    : [];

  if (!role) {
    return res.status(400).json({ error: "role is required" });
  }

  try {
    const result = await buildQueries({ role, skills, location, preferences });
    return res.json(result);
  } catch {
    return res.status(500).json({ error: "Error generating queries" });
  }
}
