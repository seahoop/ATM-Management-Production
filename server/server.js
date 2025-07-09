// Behavior: Express server that handles AWS Cognito authentication and banking operations
// Exceptions:
// - Throws if environment variables are missing
// - Throws if OIDC client initialization fails
// Return:
// - Express app with configured routes and middleware
// Parameters:
// - None (server setup)

// This express server used AWS Cognito for authentication using the OpenbID Connect Protocal.
// It supports login, logout, callback handling, user session management, and provides user
// info to the frontend.
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const { Issuer, generators } = require("openid-client");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 5003;
const SQLiteStore = require('connect-sqlite3')(session);
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { setupStockRoutes } = require('./stockMarket');

// Behavior: Ensure database directory exists for SQLite sessions in production
// Exceptions: None
// Return: None
// Parameters: None
if (process.env.NODE_ENV === 'production') {
  const dbDir = path.join(__dirname, 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
  }
}

// Behavior: Set trust proxy for secure cookies behind Cloudflare/Render
// Exceptions: None
// Return: None
// Parameters: None
app.set('trust proxy', 1);

// Behavior: Configure CORS with allowed origins for development and production
// Exceptions: None
// Return: None
// Parameters: None
const allowedOrigins = [
  // Development URLs
  'http://localhost:3000',
  'http://localhost:3003',
  'http://localhost:5003',
  
  // Production URLs
  'https://atm-management-production.vercel.app',
  'https://atm-management-production.onrender.com',
  'https://atm-management-production.vercel.app/',
  'https://atm-management-production.onrender.com/',
  
];

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Behavior: Configure session middleware with SQLite store for production
// Exceptions: None
// Return: None
// Parameters: None
app.use(
  session({
    store: process.env.NODE_ENV === 'production'
      ? new SQLiteStore({ db: 'sessions.sqlite', dir: path.join(__dirname, 'db') })
      : undefined,
    secret: process.env.SESSION_SECRET || "some_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none", // Required for cross-site cookies
      secure: true,     // Required for HTTPS (Cloudflare/Render)
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      path: '/',
      domain: '.onrender.com', // Allow sharing across subdomains
    },
    name: "atm-session",
  })
);

// Behavior: Parse JSON request bodies
// Exceptions: None
// Return: None
// Parameters: None
app.use(express.json());

// Behavior: Cache for OAuth state and nonce values
// Exceptions: None
// Return: None
// Parameters: None
const oauthStateCache = new Map();

// Behavior: JWT authentication middleware
// Exceptions: Throws if JWT token is invalid
// Return: None (adds user to request object)
// Parameters: req - Express request object, res - Express response object, next - Express next function
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET || "some_secret");
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    next();
  }
}

// Behavior: Check authentication status middleware
// Exceptions: None
// Return: None (adds isAuthenticated to request object)
// Parameters: req - Express request object, res - Express response object, next - Express next function
function checkAuth(req, res, next) {
  req.isAuthenticated = !!(req.session.userInfo || req.user);
  next();
}

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
app.post("/api/chat", authenticateJWT, async (req, res) => {
  console.log("Chat request received");
  console.log("Authorization header:", req.headers.authorization ? "Present" : "Missing");
  console.log("Session in /api/chat:", req.session);
  console.log("Session ID:", req.sessionID);
  console.log("User info:", req.session.userInfo);
  console.log("JWT user:", req.user);
  
  // Check JWT first, then session
  if (!req.user && !req.session.userInfo) {
    console.log("No authentication found, returning 401");
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid message" });
  }

  try {
    console.log("Generating AI response for message:", message);
    const aiResponse = await generateBankingResponse(message);
    console.log("AI response generated successfully");
    res.json({ message: aiResponse });
  } catch (error) {
    console.error("Error generating AI response:", error);
    res.status(500).json({ error: "Failed to generate AI response", details: error.message });
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
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are Habo AI, a helpful banking assistant for Habo Banking. You help customers with banking-related questions, account information, deposits, withdrawals, transfers, loans, investments, and general banking services. Be friendly, professional, and helpful. Keep responses concise but informative.",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek API error:", error);
    // Fallback response if API fails
    return "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment, or you can use the banking features in your dashboard for immediate assistance.";
  }
}

// Behavior: Initialize OpenID Connect client using AWS Cognito's discovery endpoint. Creates a client that can generate auth URLs
// and handle callback Logic. 
// Exceptions: Throws if discovery or client initialization fails. 
async function initializeClient() {
  try {
    // Try the hosted UI domain first (this is the most common format)
    const discoveryUrl = `https://${process.env.COGNITO_DOMAIN || 'us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com'}/.well-known/openid-configuration`;
    
    console.log("Attempting to discover OIDC issuer at:", discoveryUrl);
    
    const issuer = await Issuer.discover(discoveryUrl);
    
    // Determine the correct redirect URI based on environment
    const redirectUri = process.env.NODE_ENV === 'production' 
      ? `${process.env.BACKEND_URL}/auth/callback`
      : `${process.env.BACKEND_URL_LOCAL}/auth/callback`;
      
    client = new issuer.Client({
      client_id: "4ecd14vqq0niscmt2lhv7cqac7",
      client_secret: process.env.COGNITO_CLIENT_SECRET,
      redirect_uris: [redirectUri],
      response_types: ["code"],
    });
    console.log("Cognito OIDC client initialized successfully");
    console.log("Redirect URI:", redirectUri);
  } catch (error) {
    console.error("Failed to initialize OIDC client:", error.message);
    console.error("Discovery URL used:", `https://${process.env.COGNITO_DOMAIN || 'us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com'}/.well-known/openid-configuration`);
    
    // Try alternative discovery URL format
    try {
      console.log("Trying alternative discovery URL...");
      const altDiscoveryUrl = `https://cognito-idp.${process.env.COGNITO_REGION || 'us-east-2'}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID || 'us-east-2_Lylzuyppl'}/.well-known/openid-configuration`;
      
      const issuer = await Issuer.discover(altDiscoveryUrl);
      
      const redirectUri = process.env.NODE_ENV === 'production' 
        ? `${process.env.BACKEND_URL}/auth/callback`
        : `${process.env.BACKEND_URL_LOCAL}/auth/callback`;
        
      client = new issuer.Client({
        client_id: "4ecd14vqq0niscmt2lhv7cqac7",
        client_secret: process.env.COGNITO_CLIENT_SECRET,
        redirect_uris: [redirectUri],
        response_types: ["code"],
      });
      console.log("Cognito OIDC client initialized successfully with alternative URL");
      console.log("Redirect URI:", redirectUri);
    } catch (altError) {
      console.error("Alternative discovery URL also failed:", altError.message);
      throw error; // Throw the original error
    }
  }
}

// Behavior: Initialize the OIDC client on server startup
// Exceptions: Throws if client initialization fails
// Return: None
// Parameters: None
let client;
initializeClient().catch(console.error);

// Behavior: Configure a login route
// Exceptions: Throws 500 error if OIDC client failed to initialize
// Return: redirect to AWS Cognito hosted UI for authentication
// Parameters:
// - req: The incoming request
// - res: The outgoing response
app.get("/auth/login", (req, res) => {
  if (!client) {
    return res.status(500).send("OIDC client not initialized");
  }

  const nonce = generators.nonce();
  const state = generators.state();

  // Store in both session and cache for redundancy
  req.session.nonce = nonce;
  req.session.state = state;
  
  // Also store in cache with timestamp
  oauthStateCache.set(state, {
    nonce: nonce,
    state: state,
    timestamp: Date.now()
  });

  console.log("OAuth state stored - State:", state, "Nonce:", nonce);
  console.log("Cache size:", oauthStateCache.size);

  const authUrl = client.authorizationUrl({
    scope: "email openid phone",
    state: state,
    nonce: nonce,
  });

  res.redirect(authUrl);
});

// Behavior: Configure the callback route from cognito after log in.
// Exceptions: Throws 500 error if OIDC client failed to authenticate or if authenticate fails
// Return: Redorect tp callback route with user info stored in session or error message if failed
app.get('/auth/callback', async (req, res) => {
  if (!client) {
    return res.status(500).send("OIDC client not initialized");
  }

  try {
    console.log("Callback received with params:", req.query);
    console.log("Session state:", req.session.state);
    console.log("Session nonce:", req.session.nonce);
    
    const params = client.callbackParams(req);
    console.log("Parsed callback params:", params);
    
    // Get state and nonce from multiple sources with fallback
    let state = req.session.state;
    let nonce = req.session.nonce;
    
    // If session doesn't have state/nonce, try cache
    if (!state || !nonce) {
      console.log("Session missing state/nonce, checking cache...");
      const cachedData = oauthStateCache.get(params.state);
      if (cachedData) {
        state = cachedData.state;
        nonce = cachedData.nonce;
        console.log("Found state/nonce in cache:", state, nonce);
      } else {
        console.log("State not found in cache either");
      }
    }
    
    // If still no state/nonce, use the state from callback params (less secure but functional)
    if (!state || !nonce) {
      console.log("Using state from callback params as fallback");
      state = params.state;
      nonce = params.state; // Use state as nonce fallback
    }
    
    // Determine the correct callback URL based on environment
    const callbackUrl = process.env.NODE_ENV === 'production' 
      ? `${process.env.BACKEND_URL}/auth/callback`
      : `${process.env.BACKEND_URL_LOCAL}/auth/callback`;
      
    console.log("Using callback URL:", callbackUrl);
    console.log("Using state:", state, "nonce:", nonce);
    
    const tokenSet = await client.callback(
      callbackUrl,
      params,
      {
        nonce: nonce,
        state: state,
      }
    );

    const userInfo = await client.userinfo(tokenSet.access_token);
    req.session.userInfo = userInfo;
    
    // Generate JWT token for frontend
    const jwtToken = jwt.sign(
      { 
        sub: userInfo.sub, 
        email: userInfo.email, 
        username: userInfo.username || userInfo.email || userInfo.sub 
      }, 
      process.env.SESSION_SECRET || "some_secret",
      { expiresIn: '24h' }
    );
    
    console.log("Generated JWT token for user:", {
      sub: userInfo.sub,
      email: userInfo.email,
      username: userInfo.username || userInfo.email || userInfo.sub
    });
    
    // Clean up cache entry
    oauthStateCache.delete(params.state);

    // Save session before redirecting to ensure Set-Cookie header is sent
    req.session.save(() => {
      const frontendUrl = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : process.env.FRONTEND_URL_LOCAL;
      console.log("Redirecting to frontend:", frontendUrl);
      // Pass JWT token as URL parameter
      res.redirect(`${frontendUrl}/callback?token=${encodeURIComponent(jwtToken)}`);
    });
  } catch (err) {
    console.error("Callback error:", err);
    console.error("Error details:", {
      message: err.message,
      checks: err.checks,
      params: err.params
    });
    res.status(500).send("Authentication failed: " + err.message);
  }
});

// Behavior: Logout route, destroys session and redirects to Cognito logout endpoint
// Return: Redirect to Cognito logout endpoint
app.get("/auth/logout", (req, res) => {
  console.log("Logout request received");
  
  // Clear JWT token from session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    
    // Determine the correct logout redirect URI based on environment
    const logoutRedirectUri = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : process.env.FRONTEND_URL_LOCAL;
      
    console.log("Logout redirect URI:", logoutRedirectUri);
    
    // Fix the logout URL - use /logout instead of /login
    const logoutUrl = `https://us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com/logout?client_id=4ecd14vqq0niscmt2lhv7cqac7&logout_uri=${encodeURIComponent(logoutRedirectUri)}`;
    
    console.log("Redirecting to Cognito logout:", logoutUrl);
    res.redirect(logoutUrl);
  });
});

// Behavior: Configure a home route at the root of your application, check if user is authenticated
// Returns session info if available/authenticated.
// Return:
// - Json: {isAuthenticated: Boolean, userInfo: Object | Null}
// Parameters:
// - req: The incoming request
// - res: The ougoing response
app.get("/", checkAuth, (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated,
    userInfo: req.session.userInfo || null,
  });
});

// Behavior: Setup stock market routes
// Exceptions: None
// Return: None
// Parameters: app - Express application instance
setupStockRoutes(app);

// Behavior: Start the server
// Return: Shows status of server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
