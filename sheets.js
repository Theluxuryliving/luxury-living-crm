window.exportToSheets = async () => {
  try {
    const db = new PouchDB('crm_leads');
    const leads = await db.allDocs({ include_docs: true });
    const leadDocs = leads.rows.map(row => row.doc);

    const response = await fetch("https://script.google.com/macros/s/AKfycbxcHVxzGNtlmFZPNR-ZNzh7kMvvxP5rSFhCNijJcUiHH_i8FtPuyFSGBOL0CgtU2SIeNA/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(leadDocs)
    });

    const result = await response.json();
    if (result.success) {
      alert("✅ Exported to Google Sheets successfully!");
    } else {
      alert("❌ Export failed.");
    }
  } catch (error) {
    console.error("Export error:", error);
    alert("❌ Failed to export. Check console for details.");
  }
};

window.importFromSheets = async () => {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxcHVxzGNtlmFZPNR-ZNzh7kMvvxP5rSFhCNijJcUiHH_i8FtPuyFSGBOL0CgtU2SIeNA/exec?action=import");
    const data = await response.json();
    const db = new PouchDB('crm_leads');
    for (const row of data) {
      row._id = row._id || new Date().toISOString();
      await db.put(row);
    }
    alert("✅ Imported data from Google Sheets.");
  } catch (error) {
    console.error("Import error:", error);
    alert("❌ Failed to import. Check console for details.");
  }
};

  } catch (e) {
    console.error(e);
    alert("❌ Import failed: " + e.message);
  }
};
