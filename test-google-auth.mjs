// Test script for serverless Google authentication
// Run this with: node test-google-auth.mjs

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { handler } = require('./netlify/functions/api.js');

async function testGoogleUrl() {
  console.log('Testing Google authentication URL generation...');
  
  const mockEvent = {
    path: '/api/auth/google-url',
    httpMethod: 'GET',
    headers: {
      host: 'elevate.zaidlab.xyz',
      'x-forwarded-proto': 'https'
    }
  };

  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-client-id';

  const response = await handler(mockEvent, {});
  
  console.log('Response Status:', response.statusCode);
  
  if (response.statusCode === 200) {
    const body = JSON.parse(response.body);
    if (body.url && body.url.includes('accounts.google.com')) {
      console.log('✅ SUCCESS: Google OAuth URL generated correctly');
      return true;
    } else {
      console.log('❌ ERROR: Invalid OAuth URL format');
      return false;
    }
  } else {
    console.log('❌ ERROR: Failed to generate OAuth URL');
    console.log('Response Body:', response.body);
    return false;
  }
}

async function testSessionManagement() {
  console.log('\nTesting session management...');
  
  // Test session validation without cookie
  const mockEventNoCookie = {
    path: '/api/auth/me',
    httpMethod: 'GET',
    headers: {
      host: 'elevate.zaidlab.xyz',
      'x-forwarded-proto': 'https'
    }
  };

  const responseNoCookie = await handler(mockEventNoCookie, {});
  
  if (responseNoCookie.statusCode === 401) {
    console.log('✅ SUCCESS: Properly rejects requests without session cookie');
  } else {
    console.log('❌ ERROR: Should reject requests without session cookie');
    return false;
  }

  // Test logout endpoint
  const mockEventLogout = {
    path: '/api/auth/logout',
    httpMethod: 'POST',
    headers: {
      host: 'elevate.zaidlab.xyz',
      'x-forwarded-proto': 'https'
    }
  };

  const responseLogout = await handler(mockEventLogout, {});
  
  if (responseLogout.statusCode === 200) {
    console.log('✅ SUCCESS: Logout endpoint works correctly');
    return true;
  } else {
    console.log('❌ ERROR: Logout endpoint failed');
    return false;
  }
}

async function testErrorHandling() {
  console.log('\nTesting error handling...');
  
  // Test callback without code
  const mockEventNoCode = {
    path: '/api/auth/google-callback',
    httpMethod: 'POST',
    headers: {
      host: 'elevate.zaidlab.xyz',
      'x-forwarded-proto': 'https'
    },
    body: JSON.stringify({})
  };

  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-client-id';
  process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret';

  const responseNoCode = await handler(mockEventNoCode, {});
  
  if (responseNoCode.statusCode === 400) {
    console.log('✅ SUCCESS: Properly handles missing authorization code');
  } else {
    console.log('❌ ERROR: Should handle missing authorization code');
    return false;
  }

  // Test missing environment variables
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;

  const mockEventMissingEnv = {
    path: '/api/auth/google-callback',
    httpMethod: 'POST',
    headers: {
      host: 'elevate.zaidlab.xyz',
      'x-forwarded-proto': 'https'
    },
    body: JSON.stringify({ code: 'test-code' })
  };

  const responseMissingEnv = await handler(mockEventMissingEnv, {});
  
  if (responseMissingEnv.statusCode === 500) {
    console.log('✅ SUCCESS: Properly handles missing environment variables');
    return true;
  } else {
    console.log('❌ ERROR: Should handle missing environment variables');
    return false;
  }
}

async function runTests() {
  console.log('Testing Serverless Google Authentication...');
  console.log('='.repeat(50));
  
  const urlTestPassed = await testGoogleUrl();
  const sessionTestPassed = await testSessionManagement();
  const errorTestPassed = await testErrorHandling();
  
  console.log('\n' + '='.repeat(50));
  if (urlTestPassed && sessionTestPassed && errorTestPassed) {
    console.log('✅ ALL TESTS PASSED: Serverless authentication is working!');
    console.log('\n🎉 Your app is now ready for serverless Google authentication!');
    console.log('\nNext steps:');
    console.log('1. Set these environment variables in Netlify:');
    console.log('   - GOOGLE_CLIENT_ID');
    console.log('   - GOOGLE_CLIENT_SECRET');
    console.log('2. Configure Google OAuth redirect URI:');
    console.log('   https://elevate.zaidlab.xyz/auth/callback');
    console.log('3. Deploy your changes to Netlify');
    console.log('4. Test the complete login flow');
  } else {
    console.log('❌ SOME TESTS FAILED: Check the implementation');
  }
  console.log('='.repeat(50));
}

runTests().catch(console.error);