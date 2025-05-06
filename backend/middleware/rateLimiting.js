const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	limit: 15,
	standardHeaders: true,
	message: "Too many requests. Please try again later.",
	handler: (req, res) => {
		res.status(429).json({ error: "Too many requests. Please try again later." });
	},
	keyGenerator: (req) => req.ip,
});

module.exports = limiter;
