"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewSubmission = reviewSubmission;
exports.getReviewHistory = getReviewHistory;
const db_1 = __importDefault(require("./db"));
async function reviewSubmission(submissionId, reviewerId, status) {
    const submission = await db_1.default.query(`SELECT id
         FROM submissions
         WHERE id = $1`, [submissionId]);
    if (submission.rows.length === 0) {
        throw new Error("Submission not found");
    }
    await db_1.default.query(`UPDATE submissions
         SET status = $1
         WHERE id = $2`, [status, submissionId]);
    const result = await db_1.default.query(`INSERT INTO review_history
         (id, submission_id, reviewer_id, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, submission_id, reviewer_id, status, created_at`, [
        submissionId,
        reviewerId,
        status
    ]);
    return result.rows[0];
}
async function getReviewHistory(submissionId) {
    const result = await db_1.default.query(`SELECT id, submission_id, reviewer_id, status, created_at
         FROM review_history
         WHERE submission_id = $1
         ORDER BY created_at DESC`, [submissionId]);
    return result.rows;
}
