const PROXY_URL = "https://script.google.com/macros/s/AKfycbxcHVxzGNtlmFZPNR-ZNzh7kMvvxP5rSFhCNijJcUiHH_i8FtPuyFSGBOL0CgtU2SIeNA/exec";

window.exportToSheets = async function() {
  const db = new PouchDB("crm_leads");
  const result = await db.allDocs({ include_docs: true });
  const leads = result.rows.map(r => r.doc);
  const url = PROXY_URL + "?leads=" + encodeURIComponent(JSON.stringify(leads));
  const res = await fetch(url);
  const msg = await res.text();
  alert("✅ " + msg);
};

window.importFromSheets = async function() {
  const res = await fetch(PROXY_URL);
  const { leads } = await res.json();
  const db = new PouchDB("crm_leads");
  for (const lead of leads) {
    lead._id = lead._id || new Date().toISOString();
    lead.updated_at = new Date().toISOString();
    await db.put(lead);
  }
  alert(`✅ Imported ${leads.length} leads.`);
  if (typeof loadLeads === "function") loadLeads();
};

  } catch (e) {
    console.error(e);
    alert("❌ Import failed: " + e.message);
  }
};
