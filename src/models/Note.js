const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [50000, 'Content cannot exceed 50000 characters']
  },
  language: {
    type: String,
    default: 'text',
    lowercase: true,
    trim: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isSnippet: {
    type: Boolean,
    default: true
  },
  favorited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Text index for search (language_override: 'none' prevents conflict with our 'language' field)
noteSchema.index({ title: 'text', content: 'text' }, { language_override: 'searchLanguage' });

// Compound index for user's notes sorted by date
noteSchema.index({ userId: 1, createdAt: -1 });

// Index for tag filtering
noteSchema.index({ tags: 1 });

module.exports = mongoose.model('Note', noteSchema);
