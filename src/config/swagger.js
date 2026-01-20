const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Notes/Snippets API',
            version: '1.0.0',
            description: 'A REST API for storing code snippets and notes with tags, search functionality, and API key-based authentication.',
            contact: {
                name: 'API Support',
                email: 'support@notesapi.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                    description: 'API key for authentication'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        username: { type: 'string', example: 'john_doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        apiKey: { type: 'string', example: 'napi_abc123...' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Note: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
                        userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        title: { type: 'string', example: 'React useState Hook Example' },
                        content: { type: 'string', example: 'const [count, setCount] = useState(0);' },
                        language: { type: 'string', example: 'javascript' },
                        tags: { type: 'array', items: { type: 'string' }, example: ['react', 'hooks'] },
                        isPublic: { type: 'boolean', example: false },
                        isSnippet: { type: 'boolean', example: true },
                        favorited: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                CreateNote: {
                    type: 'object',
                    required: ['title', 'content'],
                    properties: {
                        title: { type: 'string', maxLength: 200, example: 'My Code Snippet' },
                        content: { type: 'string', maxLength: 50000, example: 'console.log("Hello");' },
                        language: { type: 'string', example: 'javascript' },
                        tags: { type: 'array', items: { type: 'string' }, example: ['javascript', 'example'] },
                        isPublic: { type: 'boolean', example: false },
                        isSnippet: { type: 'boolean', example: true }
                    }
                },
                RegisterUser: {
                    type: 'object',
                    required: ['username', 'email'],
                    properties: {
                        username: { type: 'string', minLength: 3, maxLength: 30, example: 'john_doe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' }
                    }
                },
                PaginationResponse: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 50 },
                        totalPages: { type: 'integer', example: 5 }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
