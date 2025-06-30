// netlify/functions/insert_deal.js

const { Pool } = require('pg');

// ✅ Neon connection string
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_1fzZpmGOxH9D@ep-fragrant-moon-aeb7mpuo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

exports.handler = async (event, context) => {
  console.log("🔔 insert_deal triggered");

  try {
    const data = JSON.parse(event.body);
    console.log("📦 Deal Received:", data);

    // 1️⃣ Basic fields
    const {
      _id, lead_id, project_id, unit_id, project_type, property_type, payment_term,
      primary_agent, secondary_agent, is_affiliate, sale_price, discount, final_price,
      commission, status, notes
    } = data;

    // 2️⃣ Affiliate commission logic
    let companyShare = 0;
    let affiliateShare = 0;
    if (is_affiliate === 'yes') {
      if (commission.toString().includes('%')) {
        const percent = parseFloat(commission);
        const total = final_price * percent / 100;
        companyShare = total * 0.01; // 1% company
        affiliateShare = total - companyShare;
      } else {
        const total = parseFloat(commission);
        companyShare = 100000;
        affiliateShare = total - companyShare;
      }
    }

    // 3️⃣ Insert into crm_deals table
    await pool.query(`
      INSERT INTO crm_deals (
        id, lead_id, project_id, unit_id, project_type, property_type, payment_term,
        primary_agent, secondary_agent, is_affiliate, sale_price, discount, final_price,
        commission, status, notes, company_share, affiliate_share
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18
      )
    `, [
      _id, lead_id, project_id, unit_id, project_type, property_type, payment_term,
      primary_agent, secondary_agent, is_affiliate, sale_price, discount, final_price,
      commission, status, notes, companyShare, affiliateShare
    ]);

    console.log("✅ Deal inserted into Neon");

    // 4️⃣ Mark inventory unit as 'sold'
    await pool.query(`
      UPDATE crm_inventory
      SET status = 'sold'
      WHERE id = $1
    `, [unit_id]);

    console.log(`🏷️ Inventory unit ${unit_id} marked as sold`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Deal saved and unit marked as sold.' })
    };
  } catch (err) {
    console.error("❌ Insert deal error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
