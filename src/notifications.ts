import { v4 as uuidv4 } from "uuid";
import pool from "./db";

export async function createActivity(
    userId: string,
    message: string
) {
    const activityId = uuidv4();
    const result = await pool.query(
        `INSERT INTO activity_feed
         (id, user_id, message)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, message, created_at`,
        [
            activityId,
            userId,
            message
        ]
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