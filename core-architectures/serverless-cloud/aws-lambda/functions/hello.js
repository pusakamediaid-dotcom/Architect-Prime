/**
 * Hello World Lambda Function
 */

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  
  // Handle different HTTP methods
  const method = event.httpMethod || event.requestContext?.http?.method;
  
  if (method === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Hello from Serverless!',
        timestamp: new Date().toISOString(),
        path: event.path,
        method: method
      })
    };
  }
  
  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
