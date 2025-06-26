const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAtraDpVoYu0pmDAl84KItv1NaRetAhOJJgUFr9gVHHkgHEwsW9-8uh0SXltNQPt08Fg/exec';

// This function exports data to Google Sheets
window.exportToSheets = async function () {
  try {
    const db = new PouchDB("crm_leads");
    const allDocs = await db.allDocs({ include_docs: true });
    const leads = allDocs.rows.map(row => row.doc);

    const response = await fetch(GOOGLE_SHEET_WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify({ leads }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.text();
    alert("Export Successful: " + result);
  } catch (error) {
    console.error("Export error:", error);
    alert("Export Failed: " + error.message);
  }
};

// This function imports data from Google Sheets
window.importFromSheets = async function () {
  try {
    const response = await fetch(GOOGLE_SHEET_WEBAPP_URL + "?action=import");
    const data = await response.json();

    const db = new PouchDB("crm_leads");

    for (const item of data) {
      if (!item._id) {
        item._id = new Date().toISOString();
      }
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

    alert("Import Successful: " + data.length + " records.");
  } catch (error) {
    console.error("Import error:", error);
    alert("Import Failed: " + error.message);
  }
};


