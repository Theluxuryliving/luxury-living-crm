const PROXY_URL = 'https://crm-cors-proxy.atif-zubair.workers.dev/'; // 🔁 Replace with your Worker URL

// ✅ EXPORT: Send local leads from PouchDB to Google Sheet (via Worker)
window.exportToSheets = async function () {
  try {
    const db = new PouchDB("crm_leads");
    const allDocs = await db.allDocs({ include_docs: true });
    const leads = allDocs.rows.map(row => row.doc);

    const response = await fetch(PROXY_URL, {
      method: "POST",
      body: JSON.stringify({ leads }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.text();
    console.log("✅ Export Success:", result);
    alert("✅ Exported to Google Sheets!");
  } catch (error) {
    console.error("❌ Export error:", error);
    alert("❌ Export Failed: " + error.message);
  }
};

// ✅ IMPORT: Pull data from Google Sheet (via Worker) and save into PouchDB
window.importFromSheets = async function () {
  try {
    const response = await fetch(PROXY_URL + "?action=import");
    const data = await response.json();

    const db = new PouchDB("crm_leads");

    for (const item of data) {
      if (!item._id) item._id = new Date().toISOString();

      try {
        await db.put(item);
      } catch (e) {
        if (e.status === 409) {
          const existing = await db.get(item._id);
          item._rev = existing._rev;
          await db.put(item);
        } else {
          throw e;
        }
      }
    }

    console.log("✅ Import Success:", data.length, "records");
    alert("✅ Imported " + data.length + " records from Google Sheets.");
  } catch (error) {
    console.error("❌ Import error:", error);
    alert("❌ Import Failed: " + error.message);
  }
};
