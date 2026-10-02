"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivity = createActivity;
exports.getActivityFeed = getActivityFeed;
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("./db"));
async function createActivity(userId, message) {
    const activityId = (0, uuid_1.v4)();
    const result = await db_1.default.query(`INSERT INTO activity_feed
         (id, user_id, message)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, message, created_at`, [
        activityId,
        userId,
        message
    ]);
    return result.rows[0];
}
async function getActivityFeed(userId) {
    const result = await db_1.default.query(`SELECT id, user_id, message, created_at
         FROM activity_feed
         WHERE user_id = $1
         ORDER BY created_at DESC`, [userId]);
    return result.rows;
}
