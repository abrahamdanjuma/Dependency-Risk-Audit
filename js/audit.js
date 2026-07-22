async function auditOne(pkg, onDone) {
  let version = null, license = "Unknown", vulns = [], error = null;
  try {
    const pinned = pkg.spec.startsWith("==") ? pkg.spec.slice(2) : null;
    const data = await fetchPypi(pkg.name, pinned);
    version = pinned || data.info.version;
    license = await resolvePackageLicense(data.info);
  } catch (e) {
    error = "Could not reach PyPI for this package (name may be wrong, or the request was blocked).";
  }
  if (version) {
    try { vulns = await fetchVulns(pkg.name, version); }
    catch (e) { /* leave vulns empty, don't fail the whole row */ }
  }
  const result = { name: pkg.name, version: version || "unknown", license, vulns, error };
  onDone();
  return result;
}

function severityRank(s) {
  return { Critical: 4, High: 3, Medium: 2, Low: 1, Unknown: 0 }[s] ?? 0;
}

async function pooledRun(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function runner() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(new Array(Math.min(limit, items.length)).fill(0).map(runner));
  return results;
}
