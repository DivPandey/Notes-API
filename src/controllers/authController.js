const User = require('../models/User');
const { generateApiKey } = require('../utils/apiKeyGenerator');

/**
 * Register a new user and get API key
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
    try {
        const { username, email } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'Email' : 'Username';
            return res.status(400).json({
                success: false,
                message: `${field} already registered`
            });
        }

        // Generate API key
        const apiKey = generateApiKey();

        // Create user
        const user = await User.create({
            username,
            email,
            apiKey
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                apiKey: user.apiKey,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Regenerate API key for authenticated user
 * POST /api/auth/regenerate
 */
exports.regenerateApiKey = async (req, res, next) => {
    try {
        const newApiKey = generateApiKey();

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { apiKey: newApiKey },
            { new: true }
        );

        res.json({
            success: true,
            message: 'API key regenerated successfully',
            data: {
                apiKey: user.apiKey
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                apiKey: req.user.apiKey,
                createdAt: req.user.createdAt,
                updatedAt: req.user.updatedAt
            }
        });

    } catch (error) {
        next(error);
    }
};
