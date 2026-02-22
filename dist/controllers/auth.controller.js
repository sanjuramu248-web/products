"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_schema_1 = require("../validation/auth.schema");
const register = async (req, res) => {
    try {
        const validationResult = auth_schema_1.registerSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        const { email, password, name } = validationResult.data;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: { email, password: hashedPassword, name },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validationResult = auth_schema_1.loginSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        const { email, password } = validationResult.data;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.login = login;
