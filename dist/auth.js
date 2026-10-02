"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("./db"));
async function registerUser(name, email, password, role = "submitter") {
    const existingUser = await db_1.default.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
        throw new Error("Email already registered");
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const result = await db_1.default.query(`INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, profile_picture`, [name, email, passwordHash, role]);
    return result.rows[0];
}
async function loginUser(email, password) {
    const result = await db_1.default.query(`SELECT id, name, email, password_hash, role, profile_picture
         FROM users
         WHERE email = $1`, [email]);
    if (result.rows.length === 0) {
        throw new Error("Invalid email or password");
    }
    const user = result.rows[0];
    const passwordMatch = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT secret is not configured");
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        role: user.role
    }, secret, {
        expiresIn: "1h"
    });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile_picture: user.profile_picture
        }
    };
}
