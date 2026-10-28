"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();

app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));

const parseAllowedOrigins = () => {
    const configured = env_1.env.FRONTEND_URL ? env_1.env.FRONTEND_URL.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (env_1.isProduction) {
        return configured.length > 0 ? configured : ['https://micro-logistics.vercel.app'];
    }
    return [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        ...configured
    ];
};

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowed = parseAllowedOrigins();
        if (!env_1.isProduction) {
            if (allowed.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
                return callback(null, true);
            }
        }
        if (allowed.includes(origin)) {
            return callback(null, true);
        }
        try {
            const host = new URL(origin).hostname;
            if (env_1.isProduction && (host.endsWith('.vercel.app') || host.endsWith('onrender.com'))) {
                return callback(null, true);
            }
        } catch {}
        return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role']
};

app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '1mb' }));

// Mount routers for all potential path prefixes from serverless rewrites
app.use('/api/v1', index_1.default);
app.use('/v1', index_1.default);
app.use('/api', index_1.default);

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.url}`
    });
});

app.use(error_middleware_1.errorHandler);
exports.default = app;
