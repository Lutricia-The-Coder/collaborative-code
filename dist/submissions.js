"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubmission = createSubmission;
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("./db"));
async function createSubmission(projectId, submitterId, title, filename, code, language) {
    const submissionId = (0, uuid_1.v4)();
    const result = await db_1.default.query(`INSERT INTO submissions
         (id, project_id, submitter_id, title, filename, code, language)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, project_id, submitter_id, title, filename, code, language, status`, [
        submissionId,
        projectId,
        submitterId,
        title,
        filename,
        code,
        language
    ]);
    return result.rows[0];
}
