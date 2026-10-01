import { v4 as uuidv4 } from "uuid";
import pool from "./db";

export async function createComment(
    submissionId: string,
    userId: string,
    content: string,
    lineNumber: number | null
) {
    const commentId = uuidv4();

    const result = await pool.query(
        `INSERT INTO comments
         (id, submission_id, user_id, content, line_number)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, submission_id, user_id, content, line_number`,
        [
            commentId,
            submissionId,
            userId,
            content,
            lineNumber
        ]
    );
    return result.rows[0];
}
//get commnets for a submission
export async function getCommentsBySubmission(
    submissionId: string
) {
    const result = await pool.query(
        `SELECT id, submission_id, user_id, content, line_number
         FROM comments
         WHERE submission_id = $1
         ORDER BY line_number NULLS FIRST`,
        [submissionId]
    );
    return result.rows;
}