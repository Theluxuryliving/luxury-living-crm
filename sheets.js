const PROXY_URL = 'https://crm-cors-proxy.atif-zubair.workers.dev/';

// 🇵🇰 Format time to Pakistan Standard Time (no seconds/millis)
function getPakistanTime() {
  const options = {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  return new Intl.DateTimeFormat('en-GB', options).format(new Date());
}

// ✅ EXPORT leads from PouchDB to Google Sheets via Worker
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

// ✅ IMPORT leads from Google Sheets via Worker into PouchDB
window.importFromSheets = async function () {
  try {
    const response = await fetch(PROXY_URL + "?action=import");
    const data = await response.json();

    const db = new PouchDB("crm_leads");
    const existingDocs = await db.allDocs();
    const existingIds = new Set(existingDocs.rows.map(row => row.id));
    const reps = ["Atif Z", "Atif A", "Talha A", "Talal Y"];

    for (const item of data) {
      // Clean up undefined/missing fields
      item.name = item.name || item.Name || "Unnamed";
      item.contact_number = item.contact_number || item.Phone || "N/A";
      item.city = item.city || item.City || "-";
      item.country = item.country || item.Country || "-";
      item.budget = item.budget || item.Budget || "-";
      item.project_interest = item.project_interest || item.Area || "-";
      item.property_type = item.property_type || item["Property Types"] || "-";
      item.timeline = item.timeline || item.Timeline || "-";
      item.status = item.status || "new";

      if (!item._id) item._id = new Date().toISOString();
      if (!item.created_at) item.created_at = getPakistanTime();
      item.updated_at = getPakistanTime();

      // Assign agent if missing
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
        console.warn("⚠️ Conflict adding/updating", item._id, e);
      }
    }

    console.log("✅ Import Success:", data.length, "records");
    alert("✅ Imported " + data.length + " records from Google Sheets.");
  } catch (error) {
    console.error("❌ Import error:", error);
    alert("❌ Import Failed: " + error.message);
  }
};

// ⏱️ Auto import/export every 30 mins
setInterval(() => {
  console.log("🔁 Auto sync started...");
  window.exportToSheets();
  window.importFromSheets();
}, 30 * 60 * 1000);
