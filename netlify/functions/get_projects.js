const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON', detail: err.message }),
    };
  }

  const {
    project_name,
    developer,
    projectType,
    propertyType,
    askingPrice,
    discountType,
    discountValue,
    paymentTime,
    downPercent,
    confirmPercent,
    possessionPercent,
    balloonType,
    commission_type,
    commission,
    commission_notes,
    banking,
    latitude,
    longitude,
  } = data;

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO projects (
        name, developer, location, price,
        commission_type, commission_value,
        payment_time, down_payment_percent,
        confirmation_percent, possession_percent,
        balloon_schedule, balloon_percent,
        created_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6,
        $7, $8,
        $9, $10,
        $11, $12,
        NOW()
      )
      RETURNING id
    `;

    const values = [
      project_name || null,
      developer || null,
      `${latitude},${longitude}` || null,
      askingPrice ? parseFloat(askingPrice) : null,
      commission_type || null,
      commission ? parseFloat(commission) : null,
      paymentTime || null,
      downPercent ? parseFloat(downPercent) : null,
      confirmPercent ? parseFloat(confirmPercent) : null,
      possessionPercent ? parseFloat(possessionPercent) : null,
      balloonType || null,
      20, // hardcoded balloon_percent (from your formula logic)
    ];

    const result = await client.query(query, values);
    const newId = result.rows[0].id;

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, projectId: newId }),
    };

  } catch (err) {
    console.error('insert_project error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to insert project',
        detail: err.message,
      }),
    };
  }
};
