// netlify/functions/bulk_upload_activities.js
import { sql } from '@vercel/postgres'; // or '@neondatabase/serverless' if you're using Neon client

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const activities = JSON.parse(event.body);
  const results = [];

  for (const doc of activities) {
    try {
      await sql`
        INSERT INTO crm_activities (_id, lead_id, agent, type, status, notes, date, follow_up_date)
        VALUES (
          ${doc._id}, ${doc.leadId}, ${doc.agent},
          ${doc.type}, ${doc.status}, ${doc.notes},
          ${doc.date}, ${doc.followUpDate}
        )
        ON CONFLICT (_id) DO UPDATE SET
          type = EXCLUDED.type,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          date = EXCLUDED.date,
          follow_up_date = EXCLUDED.follow_up_date;
      `;
      results.push({ id: doc._id, status: 'ok' });
    } catch (error) {
      results.push({ id: doc._id, status: 'error', error: error.message });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ uploaded: results.length, results })
  };
}
