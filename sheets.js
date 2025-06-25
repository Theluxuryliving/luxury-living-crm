const PROXY_URL = "https://luxcrmsync.net/api/leads";

window.exportToSheets = async function () {
  try {
    const db = new PouchDB("crm_leads");
    const result = await db.allDocs({ include_docs: true });
    const leads = result.rows.map(r => r.doc);

    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leads })
    });

    const json = await res.json();
    alert("✅ " + (json.message || "Export complete"));
  } catch (e) {
    console.error(e);
    alert("❌ Export failed: " + e.message);
  }
};

window.importFromSheets = async function () {
  try {
    const res = await fetch(PROXY_URL, { method: "GET" });
    const { leads } = await res.json();

    const db = new PouchDB("crm_leads");
    for (const lead of leads) {
      lead._id = lead._id || new Date().toISOString();
      lead.updated_at = new Date().toISOString();
      await db.put(lead);
    }

    alert(`✅ Imported ${leads.length} leads.`);
    if (typeof loadLeads === "function") loadLeads();
  } catch (e) {
    console.error(e);
    alert("❌ Import failed: " + e.message);
  }
};
