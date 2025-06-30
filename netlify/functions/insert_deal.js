// netlify/functions/insert_deal.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    console.log("Received deal data:", data);

    const {
      lead_id, project_id, unit_id,
      primary_agent, secondary_agent,
      is_affiliate, sale_price,
      discount, final_price,
      status, notes
    } = data;

    // Validate required fields
    if (!lead_id || !project_id || !unit_id || !primary_agent || !sale_price || !final_price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    // Fetch commission info from the project
    const projectRes = await pool.query(
      'SELECT commission, commission_type FROM crm_projects WHERE id = $1',
      [project_id]
    );

    const project = projectRes.rows[0];

    if (!project) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Project not found in Neon" })
      };
    }

    // Calculate commission
    let commission = 0;
    if (project.commission_type === 'percent') {
      commission = (parseFloat(project.commission) / 100) * parseFloat(final_price);
    } else {
      commission = parseFloat(project.commission);
    }

    // Insert into Neon
    const insertRes = await pool.query(
      `INSERT INTO crm_deals (
        lead_id, project_id, unit_id,
        primary_agent, secondary_agent,
        is_affiliate, sale_price,
        discount, final_price,
        commi
