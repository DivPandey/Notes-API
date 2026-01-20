const Note = require('../models/Note');

/**
 * Get all notes with filtering and pagination
 * GET /api/notes
 */
exports.getAllNotes = async (req, res, next) => {
    try {
        const {
            tags,
            language,
            isSnippet,
            favorited,
            search,
            sort = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build filter query
        const filter = { userId: req.user._id };

        if (tags) {
            filter.tags = { $in: tags.split(',').map(t => t.trim().toLowerCase()) };
        }
        if (language) {
            filter.language = language.toLowerCase();
        }
        if (isSnippet !== undefined) {
            filter.isSnippet = isSnippet === 'true';
        }
        if (favorited !== undefined) {
            filter.favorited = favorited === 'true';
        }
        if (search) {
            filter.$text = { $search: search };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'asc' ? 1 : -1;

        // Validate sort field
        const allowedSortFields = ['createdAt', 'updatedAt', 'title'];
        const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';

        // Execute query
        const notes = await Note.find(filter)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const total = await Note.countDocuments(filter);

        res.json({
            success: true,
            data: notes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get single note by ID
 * GET /api/notes/:id
 */
exports.getNote = async (req, res, next) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).select('-__v');

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.json({
            success: true,
            data: note
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Create new note
 * POST /api/notes
 */
exports.createNote = async (req, res, next) => {
    try {
        const noteData = {
            ...req.body,
            userId: req.user._id
        };

        const note = await Note.create(noteData);

        res.status(201).json({
            success: true,
            data: note
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update note
 * PUT /api/notes/:id
 */
exports.updateNote = async (req, res, next) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        ).select('-__v');

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.json({
            success: true,
            data: note
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Delete note
 * DELETE /api/notes/:id
 */
exports.deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.json({
            success: true,
            message: 'Note deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Toggle favorite status
 * PATCH /api/notes/:id/favorite
 */
exports.toggleFavorite = async (req, res, next) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        note.favorited = !note.favorited;
        await note.save();

        res.json({
            success: true,
            data: note
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Search notes
 * GET /api/notes/search
 */
exports.searchNotes = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query (q) is required'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const notes = await Note.find({
            userId: req.user._id,
            $text: { $search: q }
        }, {
            score: { $meta: 'textScore' }
        })
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const total = await Note.countDocuments({
            userId: req.user._id,
            $text: { $search: q }
        });

        res.json({
            success: true,
            data: notes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        next(error);
    }
};
