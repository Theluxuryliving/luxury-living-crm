// sheets.js

const PROXY_URL = 'https://crm-cors-proxy.atif-zubair.workers.dev/'; // 🔁 Replace with your Worker URL

function getPakistanTime() {
  const date = new Date();
  const offsetMs = 5 * 60 * 60 * 1000; // PKT offset
  const pstDate = new Date(date.getTime() + offsetMs);
  return pstDate.toISOString().replace(/T/, ' ').replace(/:\d{2}\..+/, '');
}

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
    const existingDocs = await db.allDocs();
    const existingIds = new Set(existingDocs.rows.map(row => row.id));

    const reps = ["Atif Z", "Atif A", "Talha A", "Talal Y"];

    for (const item of data) {
      if (!item._id) item._id = new Date().toISOString();
      if (!item.created_at) item.created_at = getPakistanTime();
      item.updated_at = getPakistanTime();
      if (!item.assigned_to || item.assigned_to === '-') {
        item.assigned_to = reps[Math.floor(Math.random() * reps.length)];
      }
      try {
        if (!existingIds.has(item._id)) {
          await db.put(item);
        } else {
          const existing = await db.get(item._id);
          item._rev = existing._rev;
          await db.put(item);
        }
      } catch (e) {
        console.error("Put failed for", item, e);
      }
    }

    console.log("✅ Import Success:", data.length, "records");
    alert("✅ Imported " + data.length + " records from Google Sheets.");
  } catch (error) {
    console.error("❌ Import error:", error);
    alert("❌ Import Failed: " + error.message);
  }
};

// 🔁 Auto-sync every 30 minutes
setInterval(() => {
  console.log("⏱ Auto syncing with Google Sheets...");
  window.exportToSheets();
  window.importFromSheets();
}, 30 * 60 * 1000);
