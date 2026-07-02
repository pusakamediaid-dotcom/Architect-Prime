exports.handler = async (event) => ({
  statusCode: 200,
  body: JSON.stringify({ success: true, received: Boolean(event) }),
});
