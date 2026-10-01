import { v4 as uuidv4 } from "uuid";
import pool from "./db";

export async function reviewSubmission(
    submissionId: string,
    reviewerId: string,
    status: string
) {
    const submission = await pool.query(
        `SELECT id
         FROM submissions
         WHERE id = $1`,
        [submissionId]
    );

    if (submission.rows.length === 0) {
        throw new Error("Submission not found");
    }

    const reviewId = uuidv4();

    await pool.query(
        `UPDATE submissions
         SET status = $1
         WHERE id = $2`,
        [status, submissionId]
    );

    const result = await pool.query(
        `INSERT INTO review_history
         (id, submission_id, reviewer_id, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, submission_id, reviewer_id, status, created_at`,
        [
            reviewId,
            submissionId,
            reviewerId,
            status
        ]
    );

    return result.rows[0];
}

export async function getReviewHistory(
    submissionId: string
) {
    const result = await pool.query(
        `SELECT id, submission_id, reviewer_id, status, created_at
         FROM review_history
         WHERE submission_id = $1
         ORDER BY created_at DESC`,
        [submissionId]
    );

    return result.rows;
}