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

    // Add a source flag
    const neonProjects = result.rows.map(p => ({
      ...p,
      source: 'neon'
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(neonProjects),
    };

  } catch (err) {
    console.error("get_projects error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch projects", detail: err.message }),
    };
  }
};
