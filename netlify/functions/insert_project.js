const mysql = require('mysql2/promise');

exports.handler = async function(event, context) {
  // CORS support
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const data = JSON.parse(event.body);

    const connection = await mysql.createConnection({
      host: 'sql311.infinityfree.com',
      user: 'if0_39342524',
      password: 'Orient009',
      database: 'if0_39342524_crm',
    });

    const query = `
      INSERT INTO projects (
        project_name, developer, project_type, property_type, asking_price,
        discount_type, discount_value, payment_time, down_percent, confirm_percent,
        possession_percent, balloon_type, commission_type, commission,
        commission_notes, banking
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.project_name || '',
      data.developer || '',
      data.projectType || '',
      data.propertyType || '',
      data.askingPrice || 0,
      data.discountType || '',
      data.discountValue || 0,
      data.paymentTime || 0,
      data.downPercent || 0,
      data.confirmPercent || 0,
      data.possessionPercent || 0,
      data.balloonType || '',
      data.commission_type || '',
      data.commission || 0,
      data.commission_notes || '',
      data.banking || '',
    ];

    await connection.execute(query, values);
    await connection.end();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, message: '✅ Project added to MySQL' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message || 'Unknown error' })
    };
  }
};
