const User = require('../models/User');

/**
 * Authentication middleware - validates API key from x-api-key header
 */
exports.authenticate = async (req, res, next) => {
    try {
        // Get API key from header
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'API key is required. Provide it in x-api-key header'
            });
        }

        // Find user by API key
        const user = await User.findOne({ apiKey });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid API key'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Optional authentication - attaches user if API key provided, but doesn't require it
 */
exports.optionalAuth = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (apiKey) {
            const user = await User.findOne({ apiKey });
            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication on error
        next();
    }
};
