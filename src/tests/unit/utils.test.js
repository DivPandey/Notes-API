const { generateApiKey, isValidApiKeyFormat } = require('../../utils/apiKeyGenerator');

describe('API Key Generator', () => {
  beforeAll(() => {
    process.env.API_KEY_PREFIX = 'napi_';
  });

  describe('generateApiKey', () => {
    it('should generate API key with default prefix', () => {
      const apiKey = generateApiKey();

      expect(apiKey).toMatch(/^napi_/);
      expect(apiKey.length).toBe(5 + 64); // prefix + 64 hex chars
    });

    it('should generate API key with custom prefix', () => {
      const apiKey = generateApiKey('test_');

      expect(apiKey).toMatch(/^test_/);
    });

    it('should generate unique API keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe('isValidApiKeyFormat', () => {
    it('should return true for valid API key', () => {
      const apiKey = 'napi_' + 'a'.repeat(64);

      expect(isValidApiKeyFormat(apiKey)).toBe(true);
    });

    it('should return true for generated API key', () => {
      const apiKey = generateApiKey();

      expect(isValidApiKeyFormat(apiKey)).toBe(true);
    });

    it('should return false for invalid prefix', () => {
      const apiKey = 'invalid_' + 'a'.repeat(64);

      expect(isValidApiKeyFormat(apiKey)).toBe(false);
    });

    it('should return false for wrong length', () => {
      const apiKey = 'napi_abc123';

      expect(isValidApiKeyFormat(apiKey)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidApiKeyFormat(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidApiKeyFormat(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidApiKeyFormat('')).toBe(false);
    });
  });
});
