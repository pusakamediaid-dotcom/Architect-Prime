exports.handler = async (event) => ({
  statusCode: 200,
  body: JSON.stringify({ success: true, records: event.Records?.length || 0 }),
});
