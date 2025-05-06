const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	limit: 25, // 25 hits for windowMs
	standardHeaders: true,
	message: "Too many requests. Please try again later.",
	handler: (req, res) => {
		res.status(429).json({ error: "Too many requests. Please try again later." });
	},
	keyGenerator: (req) => req.ip, // based on IP address
});

module.exports = limiter;