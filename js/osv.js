function extractSeverity(vuln) {
  const dsSeverity = vuln.database_specific && vuln.database_specific.severity;
  const bucket = (s) => {
    s = (s || "").toUpperCase();
    if (s === "CRITICAL") return "Critical";
    if (s === "HIGH") return "High";
    if (s === "MODERATE" || s === "MEDIUM") return "Medium";
    if (s === "LOW") return "Low";
    return null;
  };
  if (dsSeverity) {
    const b = bucket(dsSeverity);
    if (b) return b;
  }
  for (const sev of (vuln.severity || [])) {
    const score = parseFloat(sev.score);
    if (!isNaN(score)) {
      if (score >= 9.0) return "Critical";
      if (score >= 7.0) return "High";
      if (score >= 4.0) return "Medium";
      return "Low";
    }
  }
  return "Unknown";
}

function findFixedVersions(vuln, pkgName) {
  const fixes = new Set();
  for (const aff of (vuln.affected || [])) {
    const affName = aff.package && aff.package.name;
    if (affName && affName.toLowerCase() !== pkgName.toLowerCase()) continue;
    for (const range of (aff.ranges || [])) {
      for (const ev of (range.events || [])) {
        if (ev.fixed) fixes.add(ev.fixed);
      }
    }
  }
  return [...fixes];
}

async function fetchVulns(name, version) {
  const resp = await fetch("https://api.osv.dev/v1/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ package: { name, ecosystem: "PyPI" }, version })
  });
  if (!resp.ok) return [];
  const data = await resp.json();
  return (data.vulns || []).map(v => ({
    id: v.id,
    aliases: v.aliases || [],
    summary: v.summary || "",
    severity: extractSeverity(v),
    fixedVersions: findFixedVersions(v, name)
  }));
}
