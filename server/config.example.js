// Example configuration file
// Copy this to .env file in the server directory

module.exports = {
  // AWS Cognito Configuration
  COGNITO_CLIENT_ID: '4ecd14vqq0niscmt2lhv7cqac7',
  COGNITO_USER_POOL_ID: 'us-east-2_Lylzuyppl',
  COGNITO_REGION: 'us-east-2',
  COGNITO_DOMAIN: 'us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com',
  
  // Note: This is a public client setup - no client secret needed
  // Make sure your Cognito App Client is configured as a public client
  
  // DeepSeek API Key (if you have one)
  DEEPSEEK_API_KEY: 'your_deepseek_api_key_here',
  
  // Server Configuration
  PORT: 5001,
  SESSION_SECRET: 'some_secret_key_here'
}; 