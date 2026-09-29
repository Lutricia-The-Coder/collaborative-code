"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("./db"));
async function getUserById(id) {
    const result = await db_1.default.query(`SELECT id, name, email, role, profile_picture
         FROM users
         WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
        throw new Error("User not found");
    }
    return result.rows[0];
}
async function updateUser(id, name, email, password, profilePicture) {
    let query;
    let values;
    if (password) {
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        query = `
            UPDATE users
            SET name = $1,
                email = $2,
                password_hash = $3,
                profile_picture = $4
            WHERE id = $5
            RETURNING id, name, email, role, profile_picture
        `;
        values = [name, email, passwordHash, profilePicture || null, id];
    }
    else {
        query = `
            UPDATE users
            SET name = $1,
                email = $2,
                profile_picture = $3
            WHERE id = $4
            RETURNING id, name, email, role, profile_picture
        `;
        values = [name, email, profilePicture || null, id];
    }
    const result = await db_1.default.query(query, values);
    if (result.rows.length === 0) {
        throw new Error("User not found");
    }
    return result.rows[0];
}
async function deleteUser(id) {
    const result = await db_1.default.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
        throw new Error("User not found");
    }
}
