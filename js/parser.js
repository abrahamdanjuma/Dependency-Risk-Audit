function parseRequirements(text) {
  const packages = [];
  const seen = new Set();
  for (let raw of text.split("\n")) {
    let line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    line = line.split("#")[0].trim();
    line = line.split(";")[0].trim(); 
    if (!line) continue;
    const m = line.match(/^([A-Za-z0-9_.\-]+)\s*(\[[^\]]*\])?\s*(==|>=|<=|~=|!=|>|<)?\s*([0-9][0-9A-Za-z.\-*]*)?/);
    if (m && m[1]) {
      const name = m[1];
      if (seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      const spec = (m[3] || "") + (m[4] || "");
      packages.push({ name, spec });
    }
  }
  return packages;
}
