const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Note = require('../../models/Note');

describe('Notes API', () => {
    let testUser;
    let apiKey;

    beforeEach(async () => {
        testUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            apiKey: 'napi_' + 'a'.repeat(64)
        });
        apiKey = testUser.apiKey;
    });

    describe('POST /api/notes', () => {
        it('should create a new note with valid data', async () => {
            const noteData = {
                title: 'Test Note',
                content: 'console.log("Hello World");',
                language: 'javascript',
                tags: ['test', 'javascript']
            };

            const res = await request(app)
                .post('/api/notes')
                .set('x-api-key', apiKey)
                .send(noteData)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data.title).toBe(noteData.title);
            expect(res.body.data.content).toBe(noteData.content);
            expect(res.body.data.userId.toString()).toBe(testUser._id.toString());
        });

        it('should return 401 without API key', async () => {
            const res = await request(app)
                .post('/api/notes')
                .send({ title: 'Test', content: 'Test content' })
                .expect(401);

            expect(res.body.success).toBe(false);
        });

        it('should return 400 with missing title', async () => {
            const res = await request(app)
                .post('/api/notes')
                .set('x-api-key', apiKey)
                .send({ content: 'Test content' })
                .expect(400);

            expect(res.body.success).toBe(false);
        });

        it('should return 400 with missing content', async () => {
            const res = await request(app)
                .post('/api/notes')
                .set('x-api-key', apiKey)
                .send({ title: 'Test Title' })
                .expect(400);

            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/notes', () => {
        beforeEach(async () => {
            await Note.create([
                {
                    userId: testUser._id,
                    title: 'JavaScript Note',
                    content: 'Content 1',
                    language: 'javascript',
                    tags: ['javascript', 'frontend']
                },
                {
                    userId: testUser._id,
                    title: 'Python Note',
                    content: 'Content 2',
                    language: 'python',
                    tags: ['python', 'backend'],
                    favorited: true
                },
                {
                    userId: testUser._id,
                    title: 'React Note',
                    content: 'Content 3',
                    language: 'javascript',
                    tags: ['javascript', 'react']
                }
            ]);
        });

        it('should get all user notes', async () => {
            const res = await request(app)
                .get('/api/notes')
                .set('x-api-key', apiKey)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(3);
            expect(res.body.pagination.total).toBe(3);
        });

        it('should filter notes by tags', async () => {
            const res = await request(app)
                .get('/api/notes?tags=python')
                .set('x-api-key', apiKey)
                .expect(200);

            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].tags).toContain('python');
        });

        it('should filter notes by language', async () => {
            const res = await request(app)
                .get('/api/notes?language=javascript')
                .set('x-api-key', apiKey)
                .expect(200);

            expect(res.body.data).toHaveLength(2);
        });

        it('should filter favorited notes', async () => {
            const res = await request(app)
                .get('/api/notes?favorited=true')
                .set('x-api-key', apiKey)
                .expect(200);

            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].favorited).toBe(true);
        });

        it('should paginate results', async () => {
            const res = await request(app)
                .get('/api/notes?page=1&limit=2')
                .set('x-api-key', apiKey)
                .expect(200);

            expect(res.body.data).toHaveLength(2);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.limit).toBe(2);
            expect(res.body.pagination.totalPages).toBe(2);
        });
    });

    describe('GET /api/notes/:id', () => {
        let testNote;

        beforeEach(async () => {
            testNote = await Note.create({
                userId: testUser._id,
                title: 'Test Note',
                content: 'Test Content'
            });
        });

        it('should get a single note', async () => {
            const res = await request(app)
                .get(`/api/notes/${testNote._id}`)
                .set('x-api-key', apiKey)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Test Note');
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .get(`/api/notes/${fakeId}`)
                .set('x-api-key', apiKey)
                .expect(404);

            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid ID format', async () => {
            const res = await request(app)
                .get('/api/notes/invalid-id')
                .set('x-api-key', apiKey)
                .expect(400);

            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/notes/:id', () => {
        let testNote;

        beforeEach(async () => {
            testNote = await Note.create({
                userId: testUser._id,
                title: 'Original Title',
                content: 'Original Content'
            });
        });

        it('should update a note', async () => {
            const res = await request(app)
                .put(`/api/notes/${testNote._id}`)
                .set('x-api-key', apiKey)
                .send({ title: 'Updated Title' })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Updated Title');
            expect(res.body.data.content).toBe('Original Content');
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .put(`/api/notes/${fakeId}`)
                .set('x-api-key', apiKey)
                .send({ title: 'Updated' })
                .expect(404);

            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/notes/:id', () => {
        let testNote;

        beforeEach(async () => {
            testNote = await Note.create({
                userId: testUser._id,
                title: 'To Delete',
                content: 'Delete me'
            });
        });

        it('should delete a note', async () => {
            const res = await request(app)
                .delete(`/api/notes/${testNote._id}`)
                .set('x-api-key', apiKey)
                .expect(200);

            expect(res.body.success).toBe(true);

            const deletedNote = await Note.findById(testNote._id);
            expect(deletedNote).toBeNull();
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .delete(`/api/notes/${fakeId}`)
                .set('x-api-key', apiKey)
                .expect(404);

            expect(res.body.success).toBe(false);
        });
    });

    describe('PATCH /api/notes/:id/favorite', () => {
        let testNote;

        beforeEach(async () => {
            testNote = await Note.create({
                userId: testUser._id,
                title: 'Test Note',
                content: 'Test Content',
                favorited: false
            });
        });

        it('should toggle favorite to true', async () => {
            const res = await request(app)
                .patch(`/api/notes/${testNote._id}/favorite`)
                .set('x-api-key', apiKey)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.favorited).toBe(true);
        });

        it('should toggle favorite back to false', async () => {
            testNote.favorited = true;
            await testNote.save();

            const res = await request(app)
                .patch(`/api/notes/${testNote._id}/favorite`)
                .set('x-api-key', apiKey)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.favorited).toBe(false);
        });
    });
});
