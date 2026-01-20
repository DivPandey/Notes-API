const Joi = require('joi');

const noteSchema = Joi.object({
  title: Joi.string().max(200).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  content: Joi.string().max(50000).required().messages({
    'string.empty': 'Content is required',
    'string.max': 'Content cannot exceed 50000 characters',
    'any.required': 'Content is required'
  }),
  language: Joi.string().max(50).optional().default('text'),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  isPublic: Joi.boolean().optional().default(false),
  isSnippet: Joi.boolean().optional().default(true),
  favorited: Joi.boolean().optional().default(false)
});

const noteUpdateSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  content: Joi.string().max(50000).optional(),
  language: Joi.string().max(50).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  isPublic: Joi.boolean().optional(),
  isSnippet: Joi.boolean().optional(),
  favorited: Joi.boolean().optional()
}).min(1);

const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).alphanum().required().messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username cannot exceed 30 characters',
    'string.alphanum': 'Username can only contain alphanumeric characters',
    'any.required': 'Username is required'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  })
});

module.exports = {
  noteSchema,
  noteUpdateSchema,
  userSchema
};
