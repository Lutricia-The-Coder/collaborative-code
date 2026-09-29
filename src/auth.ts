import bcrypt from "bcryptjs";
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