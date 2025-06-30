const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const data = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.POSTGRES_URL, // Make sure this env variable is set!
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO projects
      (name, location, developer, price, commission_type, commission_value,
       payment_time, down_payment_percent, confirmation_percent,
       balloon_schedule, balloon_percent, possession_percent)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id;
    `;

    const values = [
      data.project_name,
      data.location || '',
      data.developer,
      parseFloat(data.askingPrice) || 0,
      data.commission_type,
      parseFloat(data.commission) || 0,
      data.paymentTime,
      parseFloat(data.downPercent) || 0,
      parseFloat(data.confirmPercent) || 0,
      data.balloonType || '',
      20, // assumed 20% balloon by default
      parseFloat(data.possessionPercent) || 0
    ];

    const result = await client.query(query, values);
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: result.rows[0].id })
    };

  } catch (err) {
    console.error('DB Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
