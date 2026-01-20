const { noteSchema, noteUpdateSchema, userSchema } = require('../utils/validators');

/**
 * Validate note creation request
 */
exports.validateNote = (req, res, next) => {
    const { error, value } = noteSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(d => d.message)
        });
    }

    // Replace body with validated/sanitized value
    req.body = value;
    next();
};

/**
 * Validate note update request
 */
exports.validateNoteUpdate = (req, res, next) => {
    const { error, value } = noteUpdateSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(d => d.message)
        });
    }

    req.body = value;
    next();
};

/**
 * Validate user registration request
 */
exports.validateUser = (req, res, next) => {
    const { error, value } = userSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(d => d.message)
        });
    }

    req.body = value;
    next();
};

/**
 * Validate MongoDB ObjectId parameter
 */
exports.validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format`
            });
        }

        next();
    };
};
