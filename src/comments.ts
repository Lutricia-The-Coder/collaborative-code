
import pool from "./db";

export async function createComment(
    submissionId: string,
    userId: string,
    content: string,
    lineNumber: number | null
) {

    const result = await pool.query(
        `INSERT INTO comments
         (submission_id, user_id, content, line_number)
         VALUES ($1, $2, $3, $4)
         RETURNING id, submission_id, user_id, content, line_number`,
        [
    
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
}//updating commnets 
export async function updateComment(
    id: string,
    userId: string,
    content: string,
    lineNumber: number | null
) {
    const result = await pool.query(
        `UPDATE comments
         SET content = $1,
             line_number = $2
         WHERE id = $3 AND user_id = $4
         RETURNING id, submission_id, user_id, content, line_number`,
        [
            content,
            lineNumber,
            id,
            userId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error("Comment not found");
    }
    return result.rows[0];
}
//delete comment
export async function deleteComment(
    id: string,
    userId: string
) {
    const result = await pool.query(
        `DELETE FROM comments
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
    );

    if (result.rows.length === 0) {
        throw new Error("Comment not found");
    }

    return result.rows[0];
}