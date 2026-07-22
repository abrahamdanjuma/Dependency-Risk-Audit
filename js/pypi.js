// Thin client for the public PyPI JSON API.
async function fetchPypi(name, pinnedVersion) {
  const url = pinnedVersion
    ? `https://pypi.org/pypi/${encodeURIComponent(name)}/${encodeURIComponent(pinnedVersion)}/json`
    : `https://pypi.org/pypi/${encodeURIComponent(name)}/json`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("pypi lookup failed");
  return resp.json();
}
