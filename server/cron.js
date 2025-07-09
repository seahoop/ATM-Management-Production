// Cron job to hit endpoint every 14 minutes to keep backend alive
const cron = require('cron');
const https = require('https');

const backendUrl = 'https://atm-management-production.onrender.com'; // Replace with your Render backend URL

const job = new cron.CronJob('*/14 * * * *', function () {
  console.log('Pinging server to keep it alive...');

  https.get(backendUrl, (res) => {
    if (res.statusCode === 200) {
      console.log('Server responded OK');
    } else {
      console.error(`Failed to ping server. Status code: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error('Error during ping:', err.message);
  });
});

module.exports = job;
