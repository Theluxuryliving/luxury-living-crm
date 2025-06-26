const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxcHVxzGNtlmFZPNR-ZNzh7kMvvxP5rSFhCNijJcUiHH_i8FtPuyFSGBOL0CgtU2SIeNA/exec';

window.exportToSheets = async function () {
  try {
    const db = new PouchDB('crm_leads');
    const allDocs = await db.allDocs({ include_docs: true });
    const leads = allDocs.rows.map(row => row.doc);

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(leads),
      headers: {
        'Content-Type': 'application/json'
      }
    });

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
