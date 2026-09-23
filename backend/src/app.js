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
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL || '*'
}));
app.use(express_1.default.json());

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
