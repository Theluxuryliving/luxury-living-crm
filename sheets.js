const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxcHVxzGNtlmFZPNR-ZNzh7kMvvxP5rSFhCNijJcUiHH_i8FtPuyFSGBOL0CgtU2SIeNA/exec";

window.exportToSheets = async function () {
  try {
    const db = new PouchDB("crm_leads");
    const result = await db.allDocs({ include_docs: true });
    const leads = result.rows.map(r => r.doc);

    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leads }),
    });

    if (!res.ok) throw new Error("Export failed: " + res.statusText);
    const msg = await res.text();
    alert("✅ Export successful: " + msg);
  } catch (e) {
    console.error("Export error:", e);
    alert("❌ Export failed. See console for details.");
  }
};

window.importFromSheets = async function () {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL + "?action=import");
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
    console.error("Import error:", e);
    alert("❌ Import failed. See console for details.");
  }
};
