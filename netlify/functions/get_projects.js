// netlify/functions/get_projects.js

const { Client } = require('pg');

exports.handler = async function (event, context) {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing DATABASE_URL in environment' }),
    };
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // for Neon DB or other cloud hosts with SSL
    },
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM projects ORDER BY id DESC');
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(res.rows),
    };
  } catch (err) {
    console.error('Postgres query error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch projects', detail: err.message }),
    };
  }
};
