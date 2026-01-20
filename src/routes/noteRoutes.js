const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { authenticate } = require('../middleware/auth');
const { validateNote, validateNoteUpdate, validateObjectId } = require('../middleware/validation');
const { searchLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes with filtering and pagination
 *     tags: [Notes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by programming language
 *       - in: query
 *         name: isSnippet
 *         schema:
 *           type: boolean
 *         description: Filter code snippets only
 *       - in: query
 *         name: favorited
 *         schema:
 *           type: boolean
 *         description: Filter favorited notes only
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title]
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of notes with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, noteController.getAllNotes);

/**
 * @swagger
 * /api/notes/search:
 *   get:
 *     summary: Search notes by text
 *     tags: [Notes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results with pagination
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Unauthorized
 */
router.get('/search', authenticate, searchLimiter, noteController.searchNotes);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get a single note by ID
 *     tags: [Notes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note details
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, validateObjectId('id'), noteController.getNote);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNote'
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validateNote, noteController.createNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNote'
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticate, validateObjectId('id'), validateNoteUpdate, noteController.updateNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticate, validateObjectId('id'), noteController.deleteNote);

/**
 * @swagger
 * /api/notes/{id}/favorite:
 *   patch:
 *     summary: Toggle favorite status of a note
 *     tags: [Notes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Favorite status toggled
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/favorite', authenticate, validateObjectId('id'), noteController.toggleFavorite);

module.exports = router;
