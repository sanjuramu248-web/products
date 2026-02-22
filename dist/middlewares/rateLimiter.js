"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const store = {};
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        if (!store[ip] || now > store[ip].resetTime) {
            store[ip] = {
                count: 1,
                resetTime: now + windowMs,
            };
            return next();
        }
        store[ip].count++;
        if (store[ip].count > maxRequests) {
            return res.status(429).json({
                status: 'error',
                message: 'Too many requests, please try again later',
                retryAfter: Math.ceil((store[ip].resetTime - now) / 1000),
            });
        }
        next();
    };
};
exports.rateLimiter = rateLimiter;
