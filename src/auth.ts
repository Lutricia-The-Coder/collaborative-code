import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import pool from "./db";

export async function registerUser(
    name: string,
    email: string,
    password: string,
    role: string = "submitter"
) {
    const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const result = await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, role, profile_picture`,
        [userId, name, email, passwordHash, role]
    );

    return result.rows[0];
}

export async function loginUser(
    email: string,
    password: string
) {
    const result = await pool.query(
        `SELECT id, name, email, password_hash, role, profile_picture
         FROM users
         WHERE email = $1`,
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT secret is not configured");
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        secret,
        {
            expiresIn: "1h"
        }
    );

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