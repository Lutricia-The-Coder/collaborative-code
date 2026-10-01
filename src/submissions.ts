import { v4 as uuidv4 } from "uuid";
import pool from "./db";

export async function createSubmission(
    projectId: string,
    submitterId: string,
    title: string,
    filename: string | null,
    code: string,
    language: string | null
) {
    const submissionId = uuidv4();

    const result = await pool.query(
        `INSERT INTO submissions
         (id, project_id, submitter_id, title, filename, code, language)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, project_id, submitter_id, title, filename, code, language, status`,
        [
            submissionId,
            projectId,
            submitterId,
            title,
            filename,
            code,
            language
        ]
    );

    return result.rows[0];
}
//listing submissions for a project
export async function getSubmissionsByProject(projectId: string) {
    const result = await pool.query(
        `SELECT id, project_id, submitter_id, title, filename, code, language, status
         FROM submissions
         WHERE project_id = $1
         ORDER BY title`,
        [projectId]
    );

    return result.rows;
}
//view one submission
export async function getSubmissionById(id: string) {
    const result = await pool.query(
        `SELECT id, project_id, submitter_id, title, filename, code, language, status
         FROM submissions
         WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new Error("Submission not found");
    }
    return result.rows[0];
}
//update submission status
export async function updateSubmissionStatus(
    id: string,
    status: string
) {
    const result = await pool.query(
        `UPDATE submissions
         SET status = $1
         WHERE id = $2
         RETURNING id, project_id, submitter_id, title, filename, code, language, status`,
        [status, id]
    );

    if (result.rows.length === 0) {
        throw new Error("Submission not found");
    }
    return result.rows[0];
}