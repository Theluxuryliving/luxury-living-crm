// followups.js
const db = new PouchDB("crm_activities");
const leadsDb = new PouchDB("crm_leads");
const calendarDB = new PouchDB("crm_calendar");
const user = localStorage.getItem("repName") || "Unknown";
const role = localStorage.getItem("role") || "sales_rep";

async function loadFollowups() {
  const res = await leadsDb.allDocs({ include_docs: true });
  const allLeads = res.rows.map(r => r.doc);
  const activitiesRes = await db.allDocs({ include_docs: true });
  const activities = activitiesRes.rows.map(r => r.doc);

  const selectedStatus = document.getElementById("filterStatus").value;
  const selectedAgent = document.getElementById("filterAgent").value;
  const selectedDate = document.getElementById("filterDate").value;
  const showOverdueOnly = document.getElementById("showOverdueOnly").checked;
  const today = new Date().toISOString().split('T')[0];

  const container = document.getElementById("followupContainer");
  container.innerHTML = allLeads.map(lead => {
    const leadActivities = activities.filter(a => a.leadId === lead._id);
    const latest = leadActivities.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const noActivity = !latest;

    if (selectedAgent && lead.assigned_to !== selectedAgent) return '';
    if (selectedStatus && (!latest || latest.status !== selectedStatus)) return '';
    if (selectedDate && (!latest || latest.followUpDate !== selectedDate)) return '';
    if (showOverdueOnly && (!latest || latest.status !== 'pending' || latest.followUpDate >= today)) return '';

    const overdue = latest && latest.status === 'pending' && latest.followUpDate < today;
    const dueToday = latest && latest.status === 'pending' && latest.followUpDate === today;
    const needsAttention = noActivity || overdue;
    let statusClass = '';
    if (noActivity || overdue) statusClass = 'overdue';
    if (dueToday) statusClass = 'due-today';

    return `
      <div class="followup-item ${statusClass}">
        <strong>${lead.Name}</strong> (${lead.Phone})<br>
        ${noActivity ? '<em style="color: orange">No follow-up activity yet</em><br>' : ''}
        Assigned to: ${lead.assigned_to || 'Unassigned'}<br>
        <div class="followup-detail">
          <select onchange="updateActivity('${lead._id}', 'type', this.value)">
            <option value="Call">Call</option>
            <option value="Meeting">Meeting</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
          </select>
          <input type="date" onchange="updateActivity('${lead._id}', 'date', this.value)" />
          <input type="date" onchange="updateActivity('${lead._id}', 'followUpDate', this.value)" />
          <select onchange="updateActivity('${lead._id}', 'status', this.value)">
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>
          <textarea placeholder="Conversation notes" onchange="updateActivity('${lead._id}', 'notes', this.value)"></textarea>
        </div>
      </div>
    `;
  }).join('');

  const agents = [...new Set(allLeads.map(l => l.assigned_to).filter(Boolean))];
  const agentFilter = document.getElementById("filterAgent");
  agentFilter.innerHTML = '<option value="">All Agents</option>' + agents.map(a => `<option value="${a}">${a}</option>`).join('');

  const agentStats = {};
  allLeads.forEach(lead => {
    const acts = activities.filter(a => a.leadId === lead._id);
    const latest = acts.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const assigned = lead.assigned_to || 'Unassigned';
    if (!agentStats[assigned]) agentStats[assigned] = { total: 0, overdue: 0 };
    agentStats[assigned].total++;
    if (!latest || (latest.status === 'pending' && latest.followUpDate < today)) agentStats[assigned].overdue++;
  });

  const summaryDiv = document.getElementById("agentOverdueSummary");
  summaryDiv.innerHTML = Object.entries(agentStats).map(([agent, stat]) => {
    const percent = stat.total ? ((stat.overdue / stat.total) * 100).toFixed(1) : '0';
    const highlight = percent >= 50 ? ' style="color: red; font-weight: bold;"' : '';
    if (percent >= 50) sendNotificationToDashboard("Follow-ups", `${agent} has ${percent}% overdue follow-ups`, agent);
    return `<div${highlight}>${agent}: ${percent}% overdue (${stat.overdue}/${stat.total})</div>`;
  }).join("<br>");
}

async function updateActivity(leadId, field, value) {
  const today = new Date().toISOString().split('T')[0];
  const id = `${leadId}-${today}`;
  let doc;
  try { doc = await db.get(id); } catch { doc = { _id: id, leadId, agent: user }; }
  doc[field] = value;
  doc.date = doc.date || today;
  await db.put(doc);

  fetch("/.netlify/functions/insert_activity", {
    method: "POST",
    body: JSON.stringify(doc),
    headers: { "Content-Type": "application/json" }
  });

  await calendarDB.put({
    _id: `cal-${id}`,
    title: `Follow-up: ${field} updated`,
    start: today,
    agent: user,
    description: `${field} changed to ${value} for lead ${leadId}`
  }).catch(err => {});

  loadFollowups();
}

function sendNotificationToDashboard(source, message, agent) {
  window.parent.postMessage({
    type: "crm-notification",
    source,
    message,
    agent
  }, "*");
}

document.addEventListener("DOMContentLoaded", loadFollowups);
