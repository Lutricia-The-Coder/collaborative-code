import { v4 as uuidv4 } from "uuid";
import pool from "./db";

export async function createProject(
    name: string,
    description: string,
    ownerId: string
) {
    const projectId = uuidv4();

    const result = await pool.query(
        `INSERT INTO projects (id, name, description, owner_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, owner_id`,
        [projectId, name, description, ownerId]
    );

    return result.rows[0];
}

export async function getProjects() {
    const result = await pool.query(
        `SELECT id, name, description, owner_id
         FROM projects
         ORDER BY name`
    );

    return result.rows;
}
//add project memmber
export async function addProjectMember(
    projectId: string,
    userId: string
) {
    const result = await pool.query(
        `INSERT INTO project_members (project_id, user_id)
         VALUES ($1, $2)
         RETURNING project_id, user_id`,
        [projectId, userId]
    );
    return result.rows[0];
}
//remove project member
export async function removeProjectMember(
    projectId: string,
    userId: string
) {
    const result = await pool.query(
        `DELETE FROM project_members
         WHERE project_id = $1 AND user_id = $2
         RETURNING project_id, user_id`,
        [projectId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error("Project member not found");
    }

    return result.rows[0];
}