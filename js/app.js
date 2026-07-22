document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById("fileName").textContent = file.name;
  const reader = new FileReader();
  reader.onload = () => { document.getElementById("reqInput").value = reader.result; };
  reader.readAsText(file);
});

document.getElementById("runBtn").addEventListener("click", async () => {
  const text = document.getElementById("reqInput").value;
  const packages = parseRequirements(text);
  if (packages.length === 0) {
    alert("Paste at least one package line first.");
    return;
  }
  const ignoreIds = parseIgnoreIds(document.getElementById("ignoreInput").value);

  const runBtn = document.getElementById("runBtn");
  runBtn.disabled = true;
  const status = document.getElementById("status");
  const statusText = document.getElementById("statusText");
  status.classList.add("active");
  document.getElementById("results").style.display = "none";

  let done = 0;
  const total = packages.length;
  statusText.textContent = `Checking 0 of ${total}\u2026`;

  const results = await pooledRun(packages, 5, (pkg) => auditOne(pkg, () => {
    done++;
    statusText.textContent = `Checking ${done} of ${total}\u2026`;
  }));

  status.classList.remove("active");
  runBtn.disabled = false;
  renderResults(results, ignoreIds);
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob([window.__lastReportHtml || ""], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dependency_audit_report.html";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("results").style.display = "none";
  document.getElementById("reqInput").value = "";
  document.getElementById("ignoreInput").value = "";
  document.getElementById("fileName").textContent = "";
});
