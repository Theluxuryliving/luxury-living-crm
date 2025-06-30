const { Client } = require("pg");

exports.handler = async function () {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const result = await client.query("SELECT * FROM projects ORDER BY created_at DESC");
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch (err) {
    console.error("Fetch Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch projects", detail: err.message })
    };
  }
};
