"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubmission = createSubmission;
exports.getSubmissionsByProject = getSubmissionsByProject;
exports.getSubmissionById = getSubmissionById;
exports.updateSubmissionStatus = updateSubmissionStatus;
exports.deleteSubmission = deleteSubmission;
const db_1 = __importDefault(require("./db"));
async function createSubmission(projectId, submitterId, title, filename, code, language) {
    const result = await db_1.default.query(`INSERT INTO submissions
         ( project_id, submitter_id, title, filename, code, language)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, project_id, submitter_id, title, filename, code, language, status`, [
        projectId,
        submitterId,
        title,
        filename,
        code,
        language
    ]);
    return result.rows[0];
}
//listing submissions for a project
async function getSubmissionsByProject(projectId) {
    const result = await db_1.default.query(`SELECT id, project_id, submitter_id, title, filename, code, language, status
         FROM submissions
         WHERE project_id = $1
         ORDER BY title`, [projectId]);
    return result.rows;
}
//view one submission
async function getSubmissionById(id) {
    const result = await db_1.default.query(`SELECT id, project_id, submitter_id, title, filename, code, language, status
         FROM submissions
         WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
        throw new Error("Submission not found");
    }
    return result.rows[0];
}
//update submission status
async function updateSubmissionStatus(id, status) {
    const result = await db_1.default.query(`UPDATE submissions
         SET status = $1
         WHERE id = $2
         RETURNING id, project_id, submitter_id, title, filename, code, language, status`, [status, id]);
    if (result.rows.length === 0) {
        throw new Error("Submission not found");
    }
    return result.rows[0];
}
//delete submission
async function deleteSubmission(id) {
    const result = await db_1.default.query(`DELETE FROM submissions
         WHERE id = $1
         RETURNING id`, [id]);
    if (result.rows.length === 0) {
        throw new Error("Submission not found");
    }
    return result.rows[0];
}
