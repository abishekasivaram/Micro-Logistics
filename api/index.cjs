const app = require('../backend/src/app').default || require('../backend/src/app');

module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Vercel Execution Error",
      message: err.message,
      stack: err.stack
    });
  }
};
