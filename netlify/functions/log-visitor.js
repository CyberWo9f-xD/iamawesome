const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Your Telegram bot token and chat ID (secured as environment variables)
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  // Your IPinfo token (secured as environment variable)
  const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

  // Extract visitor data sent from the client-side
  const { referrer, userAgent, timestamp } = JSON.parse(event.body);

  // Fetch the visitor's IP address and location using the IPinfo API from the server-side
  let visitorIP, location;
  try {
    const ipInfoResponse = await fetch(`https://ipinfo.io/json?token=${IPINFO_TOKEN}`);
    const ipInfoData = await ipInfoResponse.json();
    visitorIP = ipInfoData.ip;
    location = `${ipInfoData.city}, ${ipInfoData.region}, ${ipInfoData.country}`;
  } catch (error) {
    visitorIP = "Unknown";
    location = "Unknown";
    console.error("Error fetching IP info:", error);
  }

  // Construct the message for Telegram
  const message = `
    New visitor:
    Referrer: ${referrer || 'Unknown'}
    User Agent: ${userAgent}
    IP Address: ${visitorIP}
    Location: ${location}
    Timestamp: ${timestamp}
  `;

  const telegramURL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;

  // Send the data to Telegram securely
  try {
    const telegramResponse = await fetch(telegramURL);
    if (telegramResponse.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Visitor info sent to Telegram successfully." }),
      };
    } else {
      return {
        statusCode: telegramResponse.status,
        body: JSON.stringify({ error: "Failed to send message to Telegram." }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error sending message to Telegram." }),
    };
  }
};
