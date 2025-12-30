module.exports = async function (context, keepAliveTimer) {
  try {
    const timestamp = new Date().toISOString();
    context.log(`Keep-alive triggered at: ${timestamp}`);

    // Optional: Internal ping to warm endpoints (uncomment if needed; keeps auth/login warm without external calls)
    // const response = await fetch(`${process.env.WEBSITE_HOSTNAME}/api/login`, { method: 'GET' });
    // context.log(`Ping response: ${response.status}`);

    if (keepAliveTimer.isPastDue) {
      context.log('Keep-alive is running late!');
    }
  } catch (error) {
    context.log.error(`Keep-alive error: ${error.message}`);
  }
};