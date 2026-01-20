const crypto = require('crypto');

/**
 * Generate a unique API key
 * @param {string} prefix - Optional prefix for the API key
 * @returns {string} Generated API key
 */
function generateApiKey(prefix = null) {
  const keyPrefix = prefix || process.env.API_KEY_PREFIX || 'napi_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${keyPrefix}${randomBytes}`;
}

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} Whether the API key has valid format
 */
function isValidApiKeyFormat(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  const prefix = process.env.API_KEY_PREFIX || 'napi_';

  // Check if it starts with the correct prefix
  if (!apiKey.startsWith(prefix)) {
    return false;
  }

  // Check if the rest is a valid hex string (64 characters for 32 bytes)
  const keyPart = apiKey.slice(prefix.length);
  const hexRegex = /^[a-f0-9]{64}$/i;

  return hexRegex.test(keyPart);
}

module.exports = {
  generateApiKey,
  isValidApiKeyFormat
};
