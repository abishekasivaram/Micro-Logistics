let app;
let initError = null;

try {
  app = require('../backend/src/app').default || require('../backend/src/app');
} catch (err) {
  console.error("Failed to load backend app in Vercel serverless function:", err);
  initError = err;
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      success: false,
      error: "Vercel Serverless Initialization Error",
      message: initError.message,
      stack: initError.stack
    });
  }
  return app(req, res);
};
