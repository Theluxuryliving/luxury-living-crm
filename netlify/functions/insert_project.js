const { Client } = require("pg");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const data = JSON.parse(event.body || "{}");

  // Validate required fields
  if (!data.project_name || !data.askingPrice || !data.developer) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields" })
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO projects (
        project_name, developer, projectType, propertyType,
        askingPrice, discountType, discountValue,
        paymentTime, downPercent, confirmPercent, possessionPercent,
        balloonType, commission_type, commission, commission_notes,
        banking, latitude, longitude, created_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14, $15,
        $16, $17, $18, $19
      )
      RETURNING id;
    `;

    const values = [
      data.project_name || "",
      data.developer || "",
      data.projectType || "",
      data.propertyType || "",
      parseFloat(data.askingPrice) || 0,
      data.discountType || "none",
      parseFloat(data.discountValue) || 0,
      parseInt(data.paymentTime) || 0,
      parseFloat(data.downPercent) || 0,
      parseFloat(data.confirmPercent) || 0,
      parseFloat(data.possessionPercent) || 0,
      data.balloonType || "quarterly",
      data.commission_type || "percent",
      parseFloat(data.commission) || 0,
      data.commission_notes || "",
      data.banking || "",
      parseFloat(data.latitude) || null,
      parseFloat(data.longitude) || null,
      new Date().toISOString()
    ];

    const result = await client.query(query, values);
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Project inserted successfully",
        project_id: result.rows[0].id
      })
    };
  } catch (err) {
    console.error("DB Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to insert project",
        detail: err.message
      })
    };
  }
};
