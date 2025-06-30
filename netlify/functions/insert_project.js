const { Client } = require('pg');

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    const query = `
      INSERT INTO crm_projects (
        project_name, developer, project_type, property_type, asking_price,
        discount_type, discount_value, payment_time, down_percent, confirm_percent,
        possession_percent, balloon_type, commission_type, commission_value,
        commission_rules, banking_details, latitude, longitude, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, CURRENT_TIMESTAMP
      )
    `;

    const values = [
      data.project_name,
      data.developer,
      data.projectType,
      data.propertyType,
      data.askingPrice,
      data.discountType,
      data.discountValue,
      data.paymentTime,
      data.downPercent,
      data.confirmPercent,
      data.possessionPercent,
      data.balloonType,
      data.commission_type,
      data.commission_value,
      data.commission_rules,
      data.banking_details,
      data.latitude,
      data.longitude
    ];

    await client.query(query, values);
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "✅ Project saved to Neon DB" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
