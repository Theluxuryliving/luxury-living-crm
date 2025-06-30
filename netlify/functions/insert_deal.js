const { Client } = require('pg');

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    const query = `
      INSERT INTO deals (
        lead_id, project_id, unit_id,
        project_type, property_type, payment_term,
        primary_agent, secondary_agent, is_affiliate,
        sale_price, discount, final_price,
        payment_due, payment_received, balance_payment, balance_payment_due,
        commission, status, notes, created_at
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19, NOW()
      )
    `;

    const values = [
      data.lead_id,
      data.project_id,
      data.unit_id,
      data.project_type,
      data.property_type,
      parseInt(data.payment_term),
      data.primary_agent,
      data.secondary_agent || null,
      data.is_affiliate || 'No',
      parseFloat(data.sale_price),
      parseFloat(data.discount || 0),
      parseFloat(data.final_price),
      parseFloat(data.payment_due || 0),
      parseFloat(data.payment_received || 0),
      parseFloat(data.balance_payment || 0),
      data.balance_payment_due || null,
      parseFloat(data.commission || 0),
      data.status,
      data.notes || ''
    ];

    await client.query(query, values);
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Deal inserted into Neon DB.' })
    };
  } catch (error) {
    console.error('Insert error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to insert deal.' })
    };
  }
};
