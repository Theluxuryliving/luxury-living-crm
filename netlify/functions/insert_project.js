const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const connection = await mysql.createConnection({
      host: 'sql311.infinityfree.com',
      user: 'if0_39342524',
      password: 'Orient009',
      database: 'if0_39342524_theluxliving'
    });

    await connection.execute(
      `INSERT INTO crm_projects (project_name, developer) VALUES (?, ?)`,
      [data.project_name, data.developer] // extend this array to match your actual fields
    );

    await connection.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Project saved!' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
