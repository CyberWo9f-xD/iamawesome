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

    // Get visitor's IP from X-Forwarded-For header
    const xForwardedFor = event.headers['x-forwarded-for'];
    const visitorIP = xForwardedFor ? xForwardedFor.split(',')[0].trim() : 'Unknown';

    // Fetch IP info from IPinfo
    let location;
    const ipInfoResponse = await fetch(`https://ipinfo.io/${visitorIP}?token=${IPINFO_TOKEN}`);
    const ipInfoData = await ipInfoResponse.json();
    location = `${ipInfoData.city || 'Unknown'}, ${ipInfoData.region || 'Unknown'}, ${ipInfoData.country || 'Unknown'}`;

    // Prepare a beautiful message for Telegram
    const message = `
      🌟 *New Visitor Alert!* 🌟
    📍 *Referrer:* ${referrer || 'Unknown'}
    🕵️ *User Agent:* ${userAgent}
    🌐 *IP Address:* ${visitorIP}
    🌎 *Location:* ${location}
    ⏰ *Timestamp:* ${timestamp}
    `;

    // Send message to Telegram
    const telegramURL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
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
