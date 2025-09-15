// Netlify function to handle API requests including Google authentication
// Completely serverless - uses JWT tokens for session management
import { randomBytes } from 'crypto';

function generateSecureState() {
  return randomBytes(32).toString('hex');
}

function generateGoogleOAuthUrl(clientId, redirectUri, state, scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
]) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status}`);
  }
  
  return response.json();
}

async function getUserInfo(accessToken) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.status}`);
  }
  
  return response.json();
}

// Simple JWT-like token creation (base64 encoded for simplicity)
function createSessionToken(userData) {
  const payload = {
    userId: userData.id,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    picture: userData.picture,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiration
  };
  
  // Simple base64 encoding (in production, use proper JWT with signing)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifySessionToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

// In-memory user store for demo purposes (reset on function cold start)
// In production, you might want to use a persistent storage
const demoUsers = new Map();

export const handler = async (event, context) => {
  const { path } = event;
  
  // Handle Google OAuth URL generation
  if (path === '/api/auth/google-url' && event.httpMethod === 'GET') {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "Google OAuth not configured",
            message: "GOOGLE_CLIENT_ID environment variable is required"
          }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        };
      }

      const host = event.headers.host || event.headers.Host;
      const protocol = event.headers['x-forwarded-proto'] || 'https';
      const redirectUri = `${protocol}://${host}/auth/callback`;
      const state = generateSecureState();
      
      const url = generateGoogleOAuthUrl(clientId, redirectUri, state);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ url }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to generate OAuth URL",
          message: error.message
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
    }
  }

  // Handle Google OAuth callback with JWT session tokens
  if (path === '/api/auth/google-callback' && event.httpMethod === 'POST') {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "Google OAuth not configured",
            message: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required"
          }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        };
      }

      const body = JSON.parse(event.body || '{}');
      const { code } = body;
      
      if (!code) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Authorization code required" }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        };
      }

      const host = event.headers.host || event.headers.Host;
      const protocol = event.headers['x-forwarded-proto'] || 'https';
      const redirectUri = `${protocol}://${host}/auth/callback`;
      
      // Exchange code for tokens
      const tokenData = await exchangeCodeForTokens(code, clientId, clientSecret, redirectUri);
      
      // Get user info from Google
      const googleUser = await getUserInfo(tokenData.access_token);
      
      // Create or get user (demo - uses in-memory storage)
      const userId = googleUser.id || randomBytes(16).toString('hex');
      const user = {
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        role: 'program_officer', // Default role
        profilePictureUrl: googleUser.picture,
        lastLogin: new Date().toISOString()
      };
      
      // Store user in memory (for demo purposes)
      demoUsers.set(userId, user);
      
      // Create session token
      const sessionToken = createSessionToken(user);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ user }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Set-Cookie': `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
        }
      };
      
    } catch (error) {
      console.error('Auth callback error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          message: "Authentication failed",
          error: error.message 
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
    }
  }

  // Handle session validation
  if (path === '/api/auth/me' && event.httpMethod === 'GET') {
    try {
      const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
      const sessionCookie = cookieHeader.split(';').find(c => c.trim().startsWith('session='));
      
      if (!sessionCookie) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Not authenticated" }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        };
      }
      
      const sessionToken = sessionCookie.split('=')[1];
      const sessionData = verifySessionToken(sessionToken);
      
      if (!sessionData) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Invalid or expired session" }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        };
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ user: sessionData }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
      
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to validate session" }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
    }
  }

  // Handle logout
  if (path === '/api/auth/logout' && event.httpMethod === 'POST') {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Logged out successfully" }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Set-Cookie': 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
      }
    };
  }

  // Handle other API routes
  return {
    statusCode: 501,
    body: JSON.stringify({
      error: "Backend endpoint not implemented",
      message: "This API endpoint requires additional configuration",
      implemented_endpoints: [
        "GET /api/auth/google-url",
        "POST /api/auth/google-callback", 
        "GET /api/auth/me",
        "POST /api/auth/logout"
      ],
      documentation: "See NETLIFY_GOOGLE_SETUP.md for complete setup instructions"
    }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
};