function normalizeLicenseString(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return null;
  const key = trimmed.toLowerCase();
  if (LICENSE_ALIASES[key]) return LICENSE_ALIASES[key];
  if (trimmed.length < 40) return trimmed;
  return null;
}

function detectLicenseFromText(text) {
  for (const sig of LICENSE_TEXT_SIGNATURES) {
    if (sig.pattern.test(text)) return sig.id;
  }
  return null;
}

async function fetchGithubLicenseFallback(info) {
  const candidateUrls = Object.values(info.project_urls || {});
  if (info.home_page) candidateUrls.push(info.home_page);
  let match = null;
  for (const u of candidateUrls) {
    if (!u) continue;
    const m = u.match(/github\.com\/([^\/\s]+)\/([^\/\s#?]+)/i);
    if (m) { match = m; break; }
  }
  if (!match) return null;
  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, "");
  try {
    const resp = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const spdx = data.license && data.license.spdx_id;
    if (spdx && spdx !== "NOASSERTION" && spdx !== "Other") return spdx;
  } catch (e) {
    // GitHub unreachable or rate-limited — not fatal, just no extra signal.
  }
  return null;
}

async function resolvePackageLicense(info) {
  if (info.license_expression) {
    const norm = normalizeLicenseString(info.license_expression);
    if (norm) return norm;
  }

  for (const cl of (info.classifiers || [])) {
    if (LICENSE_CLASSIFIER_MAP[cl]) return LICENSE_CLASSIFIER_MAP[cl];
  }

  const rawLicense = (info.license || "").trim();
  if (rawLicense && rawLicense.toUpperCase() !== "UNKNOWN") {
    if (rawLicense.length < 40) {
      const norm = normalizeLicenseString(rawLicense);
      if (norm) return norm;
    } else {
      const detected = detectLicenseFromText(rawLicense);
      if (detected) return detected;
    }
  }

  const gh = await fetchGithubLicenseFallback(info);
  if (gh) return gh;

  return "Unknown";
}
