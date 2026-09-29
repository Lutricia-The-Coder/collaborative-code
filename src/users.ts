import bcrypt from "bcryptjs";
import pool from "./db";

export async function getUserById(id: string) {
    const result = await pool.query(
        `SELECT id, name, email, role, profile_picture
         FROM users
         WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new Error("User not found");
    }

    return result.rows[0];
}

export async function updateUser( id: string, name: string,email: string,password?: string,profilePicture?: string
) {
    let query: string;
    let values: any[];

    if (password) {
        const passwordHash = await bcrypt.hash(password, 10);

        query = `
            UPDATE users
            SET name = $1,
                email = $2,
                password_hash = $3,
                profile_picture = $4
            WHERE id = $5
            RETURNING id, name, email, role, profile_picture
        `;

        values = [name, email, passwordHash, profilePicture || null, id];
    } else {
        query = `
            UPDATE users
            SET name = $1,
                email = $2,
                profile_picture = $3
            WHERE id = $4
            RETURNING id, name, email, role, profile_picture
        `;

        values = [name, email, profilePicture || null, id];
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
        throw new Error("User not found");
    }

    return result.rows[0];
}

export async function deleteUser(id: string) {
    const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [id]
    );

    if (result.rows.length === 0) {
        throw new Error("User not found");
    }
}