// netlify/functions/insert_deal.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_1fzZpmGOxH9D@ep-fragrant-moon-aeb7mpuo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

exports.handler = async function(event, context) {
  console.log("🔔 insert_deal function triggered");
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const deal = JSON.parse(event.body);
    console.log("📦 Received data:", deal);

    const result = await pool.query(`
      INSERT INTO crm_deals (
        id, lead_id, project_id, unit_id, project_type,
        property_type, payment_term, primary_agent, secondary_agent,
        is_affiliate, sale_price, discount, final_price,
        commission, status, notes, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, NOW()
      )
    `, [
      deal._id, deal.lead_id, deal.project_id, deal.unit_id, deal.project_type,
      deal.property_type, deal.payment_term, deal.primary_agent, deal.secondary_agent,
      deal.is_affiliate, deal.sale_price, deal.discount, deal.final_price,
      deal.commission, deal.status, deal.notes
    ]);

    console.log("✅ Deal inserted into Neon");

    // Optionally mark unit as booked and update lead stage
    await pool.query("UPDATE crm_inventory SET status = 'booked' WHERE id = $1", [deal.unit_id]);
    await pool.query("UPDATE crm_leads SET stage = 'Closed-Won' WHERE id = $1", [deal.lead_id]);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error("❌ Insert deal error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
