// This express server used AWS Cognito for authentication using the OpenbID Connect Protocal.
// It supports login, logout, callback handling, user session management, and provides user 
// info to the frontend. 
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Issuer, generators } = require('openid-client');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 5001;

// Behavior: Middleware Set Up
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'some_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax', secure: false }
}));

// Behavior: OIDC State
let client;
const codeVerifier = generators.codeVerifier();
const codeChallenge = generators.codeChallenge(codeVerifier);

// Behavior: Handles chat requests from the frontend byverifying authentication, 
// sending the user message to DeepSeek API only for banking related questions
// Exceptions: 
// - Returns 401 if user is not authenticated
// - Returns 400 if message is invalid
// - Returns 500 if AI response generation fails
// Return: 
// - Json: {message: String} - The AI-generated response message
// Parameters: 
// - req: The incoming request containing the user message
// - res: The outgoing response containing the AI-generated reply
app.post('/api/chat', async (req, res) => {
  if(!req.session.userInfo) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { message } = req.body;

  if(!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message' });
  }

  try {
    const aiResponse = await generateBankingResponse(message);
    res.json({ message: aiResponse});
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// Behavior: Sends the user message to DeepSeek API with a banking-focused system prompt
// Exceptions: 
// - Throws if DeepSeek API request fails
// Return: 
// - String: The AI-generated response content
// Parameters: 
// - userMessage: The user's input message
async function generateBankingResponse(userMessage) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are Habo AI, a helpful banking assistant for Habo Banking. You help customers with banking-related questions, account information, deposits, withdrawals, transfers, loans, investments, and general banking services. Be friendly, professional, and helpful. Keep responses concise but informative.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API error:', error);
    // Fallback response if API fails
    return "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment, or you can use the banking features in your dashboard for immediate assistance.";
  }
}

// Behavior: Initialize OpenID Connect client using AWS Cognito's discovery endpoint. Creates a client that can generate auth URLs
// and handle callback Logic. 
// Exceptions: Throws if discovery or client initialization fails. 
async function initializeClient() {
  const issuer = await Issuer.discover('https://cognito-idp.us-east-2.amazonaws.com/us-east-2_Lylzuyppl');
  client = new issuer.Client({
    client_id: '4ecd14vqq0niscmt2lhv7cqac7',
    client_secret: process.env.COGNITO_CLIENT_SECRET,
    redirect_uris: ['/auth/callback'],
    response_types: ['code']
  });
  console.log('Cognito OIDC client initialized successfully');
}

initializeClient().catch(console.error);

// Behavior: Add a middleware component that checks if a user is authenticated
// Parameters: 
// - req: The incoming request
// - res: The outgoing response
// - next: Function to continue middleware chain
const checkAuth = (req, res, next) => {
  if (!req.session.userInfo) {
    req.isAuthenticated = false;
  } else {
    req.isAuthenticated = true;
  }
  next();
};

// Behavior: Configure a home route at the root of your application, check if user is authenticated
// Returns session info if available/authenticated.
// Return: 
// - Json: {isAuthenticated: Boolean, userInfo: Object | Null}
// Parameters: 
// - req: The incoming request
// - res: The ougoing response
app.get('/', checkAuth, (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated,
    userInfo: req.session.userInfo || null
  });
});

// Behavior: Configure a login route
// Exceptions: Throws 500 error if OIDC client failed to initialize
// Return: redirect to AWS Cognito hosted UI for authentication
// Parameters: 
// - req: The incoming request
// - res: The outgoing response
app.get('/auth/login', (req, res) => {
  if (!client) {
    return res.status(500).send('OIDC client not initialized');
  }
  
  const nonce = generators.nonce();
  const state = generators.state();

  req.session.nonce = nonce;
  req.session.state = state;

  const authUrl = client.authorizationUrl({
    scope: 'email openid phone',
    state: state,
    nonce: nonce,
  });

  res.redirect(authUrl);
});

// Behavior: Helper function to get the path from the URL
// Exceptions: Return null if URL is invalid
// Return: 
// - String | Null: The URL path or null if invalid
// Parameters: 
// - UrlString: The full URL string to extrat from
function getPathFromURL(urlString) {
  try {
    const url = new URL(urlString);
    return url.pathname;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

// Behavior: Configure the callback route from cognito after log in.
// Exceptions: Throws 500 error if OIDC client failed to authenticate or if authenticate fails
// Return: Redorect tp callback route with user info stored in session or error message if failed
app.get(getPathFromURL('/auth/callback'), async (req, res) => {
  if (!client) {
    return res.status(500).send('OIDC client not initialized');
  }
  
  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(
      '/auth/callback',
      params,
      {
        nonce: req.session.nonce,
        state: req.session.state
      }
    );

    const userInfo = await client.userinfo(tokenSet.access_token);
    req.session.userInfo = userInfo;

    res.redirect(`${process.env.REACT_APP_API_URL}/callback`);
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).send('Authentication failed: ' + err.message);
  }
});

// Behavior: Returns the User info if available
// Exceptions: Returns 401 error if not authenticated
// Return: 
// - Json: userInfo Object
app.get('/api/user', (req, res) => {
  if (!req.session.userInfo) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.userInfo);
});

// Behavior: Logout route, destroys session and redirects to Cognito logout endpoint
// Return: Redirect to Cognito logout endpoint
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  const logoutUrl = `https://us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com/logout?client_id=4ecd14vqq0niscmt2lhv7cqac7&logout_uri=${process.env.REACT_APP_LOGOUT_REDIRECT_URI}`;
  res.redirect(logoutUrl);
});

// Behavior: Start the server
// Return: Shows status of server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});