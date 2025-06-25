window.exportToSheets = async () => {
  try {
    const db = new PouchDB('crm_leads');
    const leads = await db.allDocs({ include_docs: true });
    const leadDocs = leads.rows.map(row => row.doc);

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxcHVxzGNtlmFZPNR-ZNzh7kMvvxP5rSFhCNijJcUiHH_i8FtPuyFSGBOL0CgtU2SIeNA/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ leads: leadDocs })
      }
    );

    const result = await response.json();
    if (result.success) {
      alert("✅ Exported to Google Sheets successfully!");
    } else {
      alert("❌ Export failed: " + result.message);
    }
  } catch (error) {
    console.error("Export error:", error);
    alert("❌ Failed to export. Check console for details.");
  }
};
