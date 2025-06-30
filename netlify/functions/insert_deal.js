const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'YOUR_NEON_CONNECTION_STRING', // must include sslmode=require
});

exports.handler = async function(event, context) {
  try {
    console.log("🔔 insert_deal triggered");
    const data = JSON.parse(event.body);
    console.log("📦 Body:", data);

    const query = `
      INSERT INTO crm_deals (
        id, lead_id, project_id, unit_id, project_type, property_type,
        payment_term, primary_agent, secondary_agent, is_affiliate,
        sale_price, discount, final_price, commission, status, notes, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, NOW()
      )
    `;

    const values = [
      data._id,
      data.lead_id,
      data.project_id,
      data.unit_id,
      data.project_type,
      data.property_type,
      data.payment_term,
      data.primary_agent,
      data.secondary_agent || null,
      data.is_affiliate === 'yes',
      data.sale_price,
      data.discount,
      data.final_price,
      data.commission,
      data.status,
      data.notes
    ];

    await pool.query(query, values);
    return { statusCode: 200, body: "✅ Deal inserted into Neon." };

  } catch (err) {
    console.error("❌ insert_deal error:", err);
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
};
