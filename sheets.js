const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAtraDpVoYu0pmDAl84KItv1NaRetAhOJJgUFr9gVHHkgHEwsW9-8uh0SXltNQPt08Fg/exec';

window.exportToSheets = async function () {
  const url = 'https://script.google.com/macros/s/AKfycbzAtraDpVoYu0pmDAl84KItv1NaRetAhOJJgUFr9gVHHkgHEwsW9-8uh0SXltNQPt08Fg/exec';
  try {
    const test = await fetch(url);
    const txt = await test.text();
    console.log("Fetch test result:", txt);
  } catch (err) {
    console.error("Test fetch failed:", err);
  }
}

    const result = await res.json();
    if (result.success) {
      alert('Leads exported to Google Sheets!');
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    console.error('Export error:', err);
    alert('Export failed!');
  }
};

window.importFromSheets = async function () {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=import`);
    const leads = await res.json();
    const db = new PouchDB('crm_leads');
    for (const lead of leads) {
      await db.put({ ...lead, _id: new Date().toISOString() });
    }
    alert('Leads imported successfully!');
  } catch (err) {
    console.error('Import error:', err);
    alert('Import failed!');
  }
};
