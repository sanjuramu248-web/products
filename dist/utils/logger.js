"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.logger = void 0;
exports.logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
    },
};
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        exports.logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
};
exports.requestLogger = requestLogger;
