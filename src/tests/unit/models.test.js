const User = require('../../models/User');
const Note = require('../../models/Note');

describe('User Model', () => {
    it('should create a user with auto-generated API key', async () => {
        const user = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            apiKey: User.generateApiKey()
        });

        expect(user.username).toBe('testuser');
        expect(user.email).toBe('test@example.com');
        expect(user.apiKey).toMatch(/^napi_/);
    });

    it('should require username', async () => {
        await expect(User.create({
            email: 'test@example.com',
            apiKey: 'napi_test'
        })).rejects.toThrow();
    });

    it('should require email', async () => {
        await expect(User.create({
            username: 'testuser',
            apiKey: 'napi_test'
        })).rejects.toThrow();
    });

    it('should convert username to lowercase', async () => {
        const user = await User.create({
            username: 'TestUser',
            email: 'test@example.com',
            apiKey: 'napi_test123'
        });

        expect(user.username).toBe('testuser');
    });

    it('should validate email format', async () => {
        await expect(User.create({
            username: 'testuser',
            email: 'invalid-email',
            apiKey: 'napi_test'
        })).rejects.toThrow();
    });
});

describe('Note Model', () => {
    let testUser;

    beforeEach(async () => {
        testUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            apiKey: 'napi_test123'
        });
    });

    it('should create a note with required fields', async () => {
        const note = await Note.create({
            userId: testUser._id,
            title: 'Test Note',
            content: 'Test Content'
        });

        expect(note.title).toBe('Test Note');
        expect(note.content).toBe('Test Content');
        expect(note.isSnippet).toBe(true);
        expect(note.favorited).toBe(false);
        expect(note.language).toBe('text');
    });

    it('should require title', async () => {
        await expect(Note.create({
            userId: testUser._id,
            content: 'Test Content'
        })).rejects.toThrow();
    });

    it('should require content', async () => {
        await expect(Note.create({
            userId: testUser._id,
            title: 'Test Title'
        })).rejects.toThrow();
    });

    it('should convert language to lowercase', async () => {
        const note = await Note.create({
            userId: testUser._id,
            title: 'Test Note',
            content: 'Test Content',
            language: 'JavaScript'
        });

        expect(note.language).toBe('javascript');
    });

    it('should convert tags to lowercase', async () => {
        const note = await Note.create({
            userId: testUser._id,
            title: 'Test Note',
            content: 'Test Content',
            tags: ['React', 'JAVASCRIPT']
        });

        expect(note.tags).toContain('react');
        expect(note.tags).toContain('javascript');
    });

    it('should create note with all optional fields', async () => {
        const note = await Note.create({
            userId: testUser._id,
            title: 'Full Note',
            content: 'Full Content',
            language: 'python',
            tags: ['python', 'backend'],
            isPublic: true,
            isSnippet: true,
            favorited: true
        });

        expect(note.language).toBe('python');
        expect(note.isPublic).toBe(true);
        expect(note.favorited).toBe(true);
    });
});
