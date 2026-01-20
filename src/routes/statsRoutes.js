const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Statistics]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalNotes:
 *                       type: integer
 *                     totalSnippets:
 *                       type: integer
 *                     totalFavorites:
 *                       type: integer
 *                     publicNotes:
 *                       type: integer
 *                     privateNotes:
 *                       type: integer
 *                     recentNotesLast7Days:
 *                       type: integer
 *                     topLanguages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           language:
 *                             type: string
 *                           count:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, statsController.getStats);

/**
 * @swagger
 * /api/stats/tags:
 *   get:
 *     summary: Get most used tags
 *     tags: [Statistics]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of tags to return
 *     responses:
 *       200:
 *         description: Tag statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tag:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/tags', authenticate, statsController.getTagStats);

module.exports = router;
