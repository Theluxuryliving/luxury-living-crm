exports.handler = async (event, context) => {
  console.log("🔔 insert_deal triggered");
  const body = JSON.parse(event.body || '{}');
  console.log("📦 Deal Received:", body);

  // Your logic here...

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
