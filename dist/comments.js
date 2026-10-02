"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = createComment;
exports.getCommentsBySubmission = getCommentsBySubmission;
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
const db_1 = __importDefault(require("./db"));
async function createComment(submissionId, userId, content, lineNumber) {
    const result = await db_1.default.query(`INSERT INTO comments
         (submission_id, user_id, content, line_number)
         VALUES ($1, $2, $3, $4)
         RETURNING id, submission_id, user_id, content, line_number`, [
        submissionId,
        userId,
        content,
        lineNumber
    ]);
    return result.rows[0];
}
//get commnets for a submission
async function getCommentsBySubmission(submissionId) {
    const result = await db_1.default.query(`SELECT id, submission_id, user_id, content, line_number
         FROM comments
         WHERE submission_id = $1
         ORDER BY line_number NULLS FIRST`, [submissionId]);
    return result.rows;
} //updating commnets 
async function updateComment(id, userId, content, lineNumber) {
    const result = await db_1.default.query(`UPDATE comments
         SET content = $1,
             line_number = $2
         WHERE id = $3 AND user_id = $4
         RETURNING id, submission_id, user_id, content, line_number`, [
        content,
        lineNumber,
        id,
        userId
    ]);
    if (result.rows.length === 0) {
        throw new Error("Comment not found");
    }
    return result.rows[0];
}
//delete comment
async function deleteComment(id, userId) {
    const result = await db_1.default.query(`DELETE FROM comments
         WHERE id = $1 AND user_id = $2
         RETURNING id`, [id, userId]);
    if (result.rows.length === 0) {
        throw new Error("Comment not found");
    }
    return result.rows[0];
}
