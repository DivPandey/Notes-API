const Note = require('../models/Note');

/**
 * Get user statistics
 * GET /api/stats
 */
exports.getStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get counts
        const [totalNotes, totalSnippets, totalFavorites, publicNotes] = await Promise.all([
            Note.countDocuments({ userId }),
            Note.countDocuments({ userId, isSnippet: true }),
            Note.countDocuments({ userId, favorited: true }),
            Note.countDocuments({ userId, isPublic: true })
        ]);

        // Get languages distribution
        const languageStats = await Note.aggregate([
            { $match: { userId } },
            { $group: { _id: '$language', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get recent activity (notes created in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentNotes = await Note.countDocuments({
            userId,
            createdAt: { $gte: sevenDaysAgo }
        });

        res.json({
            success: true,
            data: {
                totalNotes,
                totalSnippets,
                totalFavorites,
                publicNotes,
                privateNotes: totalNotes - publicNotes,
                recentNotesLast7Days: recentNotes,
                topLanguages: languageStats.map(l => ({
                    language: l._id || 'text',
                    count: l.count
                }))
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get most used tags
 * GET /api/stats/tags
 */
exports.getTagStats = async (req, res, next) => {
    try {
        const { limit = 20 } = req.query;
        const userId = req.user._id;

        const tagStats = await Note.aggregate([
            { $match: { userId } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: parseInt(limit) }
        ]);

        res.json({
            success: true,
            data: tagStats.map(t => ({
                tag: t._id,
                count: t.count
            }))
        });

    } catch (error) {
        next(error);
    }
};
