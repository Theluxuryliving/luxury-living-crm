const { Client } = require("pg");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const data = JSON.parse(event.body || "{}");

  if (!data.project_name || !data.developer || !data.askingPrice) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields" })
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO projects (
        name, developer, location, price,
        commission_type, commission_value,
        payment_time, down_payment_percent,
        confirmation_percent, possession_percent,
        balloon_schedule, balloon_percent
      )
      VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11, $12
      )
      RETURNING id;
    `;

    const values = [
      data.project_name || "",
      data.developer || "",
      data.location || "",
      parseFloat(data.askingPrice) || 0,
      data.commission_type || "percent",
      parseFloat(data.commission) || 0,
      data.paymentTime || "0",
      parseFloat(data.downPercent) || 0,
      parseFloat(data.confirmPercent) || 0,
      parseFloat(data.possessionPercent) || 0,
      data.balloonType || "quarterly",
      20 // Assuming fixed 20% balloon, adjust if dynamic
    ];

    const result = await client.query(query, values);
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Project inserted", id: result.rows[0].id })
    };
  } catch (err) {
    console.error("Insert Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error", detail: err.message })
    };
  }
};
