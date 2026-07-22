function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function parseIgnoreIds(text) {
  return new Set(text.split("\n").map(s => s.trim()).filter(Boolean));
}

function renderResults(packagesData, ignoreIds) {
  for (const pkg of packagesData) {
    pkg.vulns = pkg.vulns.filter(v => !ignoreIds.has(v.id) && !v.aliases.some(a => ignoreIds.has(a)));
  }

  const totalPackages = packagesData.length;
  const totalVulns = packagesData.reduce((n, p) => n + p.vulns.length, 0);
  const riskyLicenses = packagesData.filter(p => !SAFE_LICENSES.has(p.license) && p.license !== "Unknown").length;

  let maxSeverity = 0;
  let hasRestrictedLicense = false;
  for (const p of packagesData) {
    for (const v of p.vulns) maxSeverity = Math.max(maxSeverity, severityRank(v.severity));
    if (RESTRICTED_LICENSES.has(p.license)) hasRestrictedLicense = true;
  }

  let rating = "green", ratingText = "GREEN";
  if (maxSeverity >= 3 || hasRestrictedLicense) { rating = "red"; ratingText = "RED"; }
  else if (maxSeverity >= 1) { rating = "amber"; ratingText = "AMBER"; }

  const banner = document.getElementById("riskBanner");
  banner.className = "risk-banner " + rating;
  document.getElementById("riskLabel").textContent = ratingText;

  const subParts = [];
  if (hasRestrictedLicense) subParts.push("a restricted-copyleft license is in use");
  if (maxSeverity >= 3) subParts.push("a high or critical severity vulnerability was found");
  else if (maxSeverity >= 1) subParts.push("lower-severity vulnerabilities were found");
  document.getElementById("riskSub").textContent = subParts.length ? subParts.join(" \u00b7 ") : "No known vulnerabilities or flagged licenses.";

  document.getElementById("mPackages").textContent = totalPackages;
  document.getElementById("mVulns").textContent = totalVulns;
  document.getElementById("mLicenses").textContent = riskyLicenses;

  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";
  for (const p of packagesData) {
    const tr = document.createElement("tr");
    const licenseClass = RESTRICTED_LICENSES.has(p.license) ? "lic-tag restricted" : "lic-tag";

    let securityCell;
    if (p.error) {
      securityCell = `<span class="err-tag">${escapeHtml(p.error)}</span>`;
    } else if (p.vulns.length === 0) {
      securityCell = `<span class="clear-tag">Clear</span>`;
    } else {
      securityCell = "<ul class=\"vuln-list\">" + p.vulns.map(v =>
        `<li class="sev-${v.severity.toLowerCase()}">${escapeHtml(v.id)} \u2014 ${escapeHtml(v.severity)}</li>`
      ).join("") + "</ul>";
    }

    const fixVersions = [...new Set(p.vulns.flatMap(v => v.fixedVersions))];
    const fixCell = fixVersions.length ? escapeHtml(fixVersions.join(", ")) : "\u2014";

    tr.innerHTML = `
      <td class="pkg">${escapeHtml(p.name)}</td>
      <td class="ver">${escapeHtml(p.version)}</td>
      <td><span class="${licenseClass}">${escapeHtml(p.license)}</span></td>
      <td>${securityCell}</td>
      <td class="fix-list">${fixCell}</td>
    `;
    tbody.appendChild(tr);
  }

  document.getElementById("results").style.display = "block";
  const sweep = document.getElementById("sweep");
  sweep.style.animation = "none";
  void sweep.offsetWidth;
  sweep.style.animation = "";

  window.__lastReportHtml = buildStandaloneReport(packagesData, { rating: ratingText, totalPackages, totalVulns, riskyLicenses });
}

function buildStandaloneReport(packagesData, summary) {
  const rows = packagesData.map(p => {
    const licenseFlag = RESTRICTED_LICENSES.has(p.license) ? ' style="color:#dc3545;font-weight:600;"' : "";
    let security;
    if (p.error) security = `<span style="color:#888;font-style:italic;">${escapeHtml(p.error)}</span>`;
    else if (p.vulns.length === 0) security = '<span style="color:#28a745;">Clear</span>';
    else security = '<ul style="margin:0;padding-left:18px;">' + p.vulns.map(v =>
      `<li>${escapeHtml(v.id)} (${escapeHtml(v.severity)})</li>`).join("") + "</ul>";
    const fixes = [...new Set(p.vulns.flatMap(v => v.fixedVersions))].join(", ") || "N/A";
    return `<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.version)}</td><td${licenseFlag}>${escapeHtml(p.license)}</td><td>${security}</td><td>${escapeHtml(fixes)}</td></tr>`;
  }).join("");
  const color = summary.rating === "RED" ? "#dc3545" : summary.rating === "AMBER" ? "#e0a800" : "#28a745";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Dependency Audit Report</title>
  <style>body{font-family:Segoe UI,Tahoma,Verdana,sans-serif;margin:40px;color:#222;}
  table{width:100%;border-collapse:collapse;margin-top:20px;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f2f2f2;}
  .metrics span{display:inline-block;margin-right:24px;font-size:14px;color:#555;} .metrics b{font-size:20px;color:#111;display:block;}</style>
  </head><body>
  <h1>Dependency Risk Audit Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <p>Overall risk: <b style="color:${color};">${summary.rating}</b></p>
  <div class="metrics">
    <span><b>${summary.totalPackages}</b>Packages scanned</span>
    <span><b>${summary.totalVulns}</b>Vulnerabilities</span>
    <span><b>${summary.riskyLicenses}</b>Licenses to review</span>
  </div>
  <table><thead><tr><th>Package</th><th>Version</th><th>License</th><th>Security</th><th>Fix to</th></tr></thead>
  <tbody>${rows}</tbody></table>
  </body></html>`;
}
