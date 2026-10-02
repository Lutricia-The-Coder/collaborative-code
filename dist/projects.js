"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.getProjects = getProjects;
exports.addProjectMember = addProjectMember;
exports.removeProjectMember = removeProjectMember;
const db_1 = __importDefault(require("./db"));
async function createProject(name, description, ownerId) {
    const result = await db_1.default.query(`INSERT INTO projects ( name, description, owner_id)
         VALUES ($1, $2, $3)
         RETURNING id, name, description, owner_id`, [name, description, ownerId]);
    return result.rows[0];
}
async function getProjects() {
    const result = await db_1.default.query(`SELECT id, name, description, owner_id
         FROM projects
         ORDER BY name`);
    return result.rows;
}
//add project memmber
async function addProjectMember(projectId, userId) {
    const result = await db_1.default.query(`INSERT INTO project_members (project_id, user_id)
         VALUES ($1, $2)
         RETURNING project_id, user_id`, [projectId, userId]);
    return result.rows[0];
}
//remove project member
async function removeProjectMember(projectId, userId) {
    const result = await db_1.default.query(`DELETE FROM project_members
         WHERE project_id = $1 AND user_id = $2
         RETURNING project_id, user_id`, [projectId, userId]);
    if (result.rows.length === 0) {
        throw new Error("Project member not found");
    }
    return result.rows[0];
}
