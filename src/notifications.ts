import pool from "./db";

export async function createActivity(
    userId: string,
    message: string
) {
    const result = await pool.query(
        `INSERT INTO activity_feed
         (user_id, message)
         VALUES ($1, $2)
         RETURNING id, user_id, message, created_at`,
        [userId, message]
    );

    return result.rows[0];
}

export async function getActivityFeed(
    userId: string
) {
    const result = await pool.query(
        `SELECT id, user_id, message, created_at
         FROM activity_feed
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows;
}