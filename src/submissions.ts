import pool from "./db";

export async function createSubmission(
    projectId: number,
    submitterId: number,
    title: string,
    filename: string | null,
    code: string,
    language: string | null
) {

    const result = await pool.query(
        `INSERT INTO submissions
         ( project_id, submitter_id, title, filename, code, language)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, project_id, submitter_id, title, filename, code, language, status`,
        [
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
//delete submission
export async function deleteSubmission(id: string) {
    const result = await pool.query(
        `DELETE FROM submissions
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new Error("Submission not found");
    }
    return result.rows[0];
}