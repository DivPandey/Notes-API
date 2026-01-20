const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    apiKey: {
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: true
});

// Generate API key before saving
userSchema.pre('save', function (next) {
    if (!this.apiKey) {
        this.apiKey = generateApiKey();
    }
    next();
});

// Static method to generate API key
userSchema.statics.generateApiKey = function () {
    return generateApiKey();
};

function generateApiKey() {
    const prefix = process.env.API_KEY_PREFIX || 'napi_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}${randomBytes}`;
}

module.exports = mongoose.model('User', userSchema);
