const fetch = require('node-fetch');

exports.handler = async (event) => {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

  try {
    let requestBody;

    // Ensure the request body is present and valid
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (error) {
        throw new Error("Invalid JSON format");
      }
    } else {
      throw new Error("Missing request body");
    }

    const { referrer, userAgent, timestamp } = requestBody;

    // Fetch IP info from IPinfo
    let visitorIP, location;
    const ipInfoResponse = await fetch(`https://ipinfo.io/json?token=${IPINFO_TOKEN}`);
    const ipInfoData = await ipInfoResponse.json();
    visitorIP = ipInfoData.ip;
    location = `${ipInfoData.city}, ${ipInfoData.region}, ${ipInfoData.country}`;

    // Prepare message for Telegram
    const message = `
      New visitor:
      Referrer: ${referrer || 'Unknown'}
      User Agent: ${userAgent}
      IP Address: ${visitorIP}
      Location: ${location}
      Timestamp: ${timestamp}
    `;

    // Send message to Telegram
    const telegramURL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;
    const telegramResponse = await fetch(telegramURL);
    if (!telegramResponse.ok) {
      throw new Error(`Telegram API response: ${telegramResponse.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Visitor info sent to Telegram successfully." }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
