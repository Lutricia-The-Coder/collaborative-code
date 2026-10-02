"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            message: "Access token required"
        });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "Invalid authorization header"
        });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({
            message: "JWT secret is not configured"
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = {
            id: Number(decoded.id),
            role: decoded.role
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}
