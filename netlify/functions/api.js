// Netlify function to proxy API requests to a backend server
// This is a temporary solution until we deploy the full backend

exports.handler = async (event, context) => {
  // For now, return a simple response indicating the backend needs to be deployed
  return {
    statusCode: 501,
    body: JSON.stringify({
      error: "Backend server not deployed yet",
      message: "Please deploy the backend server to handle API requests",
      required: "Deploy backend to Railway, Heroku, or similar service"
    }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
};