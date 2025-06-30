const { Client } = require('pg');

exports.handler = async () => {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM projects ORDER BY id DESC');
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    console.error("get_projects error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch projects", detail: err.message }),
    };
  }
};
