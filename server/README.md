# ATM Management Server

This is the backend server for the ATM Management system with AWS Cognito authentication.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the server directory with the following variables:

```env
# AWS Cognito Configuration
COGNITO_CLIENT_ID=4ecd14vqq0niscmt2lhv7cqac7
COGNITO_USER_POOL_ID=us-east-2_Lylzuyppl
COGNITO_REGION=us-east-2
COGNITO_DOMAIN=us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com

# DeepSeek API Key (if you have one)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Server Configuration
PORT=5001
SESSION_SECRET=some_secret_key_here
```

**Important**: This setup uses a **public client** configuration. Make sure your AWS Cognito App Client is configured as a public client (no client secret required).

### 3. Start the Server
```bash
npm start
```

The server will run on port 5001 by default.

## API Endpoints

### Authentication
- `GET /auth/login` - Initiate login flow
- `GET /auth/callback` - OAuth callback handler
- `GET /auth/logout` - Logout user
- `GET /api/user` - Get current user info

### Banking Operations
- `POST /api/deposit` - Deposit money
- `POST /api/withdraw` - Withdraw money
- `GET /api/balance` - Get account balance

### AI Chat
- `POST /api/chat` - Chat with AI assistant

## Troubleshooting

### "client_id is required" Error
1. Make sure your `.env` file exists and contains the correct `COGNITO_CLIENT_ID`
2. Verify that your AWS Cognito User Pool is properly configured
3. Check that the client ID matches your Cognito App Client

### "client_secret_basic client authentication method requires a client_secret" Error
This error occurs when the Cognito App Client is configured as a confidential client but the server is set up as a public client. To fix:

1. **Option 1 (Recommended)**: Configure your Cognito App Client as a **public client**
   - Go to AWS Cognito Console
   - Navigate to your User Pool → App Clients
   - Select your app client
   - Make sure "Generate client secret" is **unchecked**
   - Save the changes

2. **Option 2**: If you need a confidential client, add the client secret to your `.env` file:
   ```env
   COGNITO_CLIENT_SECRET=your_client_secret_here
   ```

### Redirect URI Issues
1. Ensure the redirect URIs are correctly configured in your Cognito App Client
2. The callback URL should be: `http://localhost:5001/auth/callback`
3. The logout URL should be: `http://localhost:3000/`

## Notes

- The server uses session-based authentication
- Banking operations are simulated (no real database)
- AI chat requires a DeepSeek API key to function
- This is configured as a **public client** - no client secret is required 