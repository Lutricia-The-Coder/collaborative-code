"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const middleware_1 = require("./middleware");
const users_1 = require("./users");
const projects_1 = require("./projects");
const submissions_1 = require("./submissions");
const comments_1 = require("./comments");
const reviews_1 = require("./reviews");
const notifications_1 = require("./notifications");
const stats_1 = require("./stats");
const webserver_1 = require("./webserver");
const validation_1 = require("./validation");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.json({ message: "Collaborative Code Review API" });
});
app.post("/api/auth/register", (0, validation_1.requireFields)(["name", "email", "password"]), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await (0, auth_1.registerUser)(name, email, password, role);
        res.status(201).json({ message: "User registered successfully", user });
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error && error.message === "Email already registered") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error" });
    }
});
//login
app.post("/api/auth/login", (0, validation_1.requireFields)(["email", "password"]), async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const result = await (0, auth_1.loginUser)(email, password);
        res.status(200).json({ message: "Login successful", ...result });
    }
    catch (error) {
        if (error instanceof Error && error.message === "Invalid email or password") {
            return res.status(401).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//autentication
app.get("/api/auth/me", middleware_1.authenticateToken, (req, res) => {
    res.json({ message: "Authentication successful", user: req.user });
});
app.get("/api/users/:id", middleware_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.id !== req.params.id) {
            return res.status(403).json({ message: "You can only access your own profile" });
        }
        const user = await (0, users_1.getUserById)(req.params.id);
        res.json({ user });
    }
    catch (error) {
        if (error instanceof Error && error.message === "User not found") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//update user profile
app.put("/api/users/:id", middleware_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.id !== req.params.id) {
            return res.status(403).json({ message: "You can only update your own profile" });
        }
        const { name, email, password, profile_picture } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }
        const user = await (0, users_1.updateUser)(req.params.id, name, email, password, profile_picture);
        res.json({ message: "User updated successfully", user });
    }
    catch (error) {
        if (error instanceof Error && error.message === "User not found") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//delete user
app.delete("/api/users/:id", middleware_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.id !== req.params.id) {
            return res.status(403).json({ message: "You can only delete your own account" });
        }
        await (0, users_1.deleteUser)(req.params.id);
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        if (error instanceof Error && error.message === "User not found") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//create and list projects
app.post("/api/projects", middleware_1.authenticateToken, (0, validation_1.requireFields)(["name"]), async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Project name is required" });
        }
        const project = await (0, projects_1.createProject)(name, description || null, req.user.id);
        res.status(201).json({ message: "Project created successfully", project });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
app.get("/api/projects", middleware_1.authenticateToken, async (req, res) => {
    try {
        const projects = await (0, projects_1.getProjects)();
        res.json({ projects });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//add project member
app.post("/api/projects/:id/members", middleware_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }
        const projectId = req.params.id;
        const member = await (0, projects_1.addProjectMember)(projectId, userId);
        res.status(201).json({ message: "Member added successfully", member });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//deleteproject member
app.delete("/api/projects/:id/members/:userId", middleware_1.authenticateToken, async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.params.userId;
        const member = await (0, projects_1.removeProjectMember)(projectId, userId);
        res.json({ message: "Member removed successfully", member });
    }
    catch (error) {
        if (error instanceof Error && error.message === "Project member not found") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//create submissions
app.post("/api/projects/:projectId/submissions", middleware_1.authenticateToken, (0, validation_1.requireFields)(["title", "code"]), async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { title, filename, code, language } = req.body;
        if (!title || !code) {
            return res.status(400).json({ message: "Title and code are required" });
        }
        const submission = await (0, submissions_1.createSubmission)(projectId, req.user.id, title, filename || null, code, language || null);
        res.status(201).json({ message: "Submission created successfully", submission });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//list submisssions
app.get("/api/projects/:projectId/submissions", middleware_1.authenticateToken, async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const submissions = await (0, submissions_1.getSubmissionsByProject)(projectId);
        res.json({ submissions });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//get 1 submission
app.get("/api/submissions/:id", middleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const submission = await (0, submissions_1.getSubmissionById)(id);
        res.json({ submission });
    }
    catch (error) {
        if (error instanceof Error && error.message === "Submission not found") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//pdating status
app.put("/api/submissions/:id/status", middleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const allowedStatuses = [
            "pending",
            "in_review",
            "approved",
            "changes_requested"
        ];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid submission status" });
        }
        const submission = await (0, submissions_1.updateSubmissionStatus)(id, status);
        res.json({ message: "Submission status updated successfully", submission });
    }
    catch (error) {
        if (error instanceof Error && error.message === "Submission not found") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error"
        });
    }
});
//delete submission
app.delete("/api/submissions/:id", middleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const submission = await (0, submissions_1.deleteSubmission)(id);
        res.json({ message: "Submission deleted successfully", submission });
    }
    catch (error) {
        if (error instanceof Error && error.message === "Submission not found") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}); //create comments
app.post("/api/submissions/:submissionId/comments", middleware_1.authenticateToken, (0, validation_1.requireFields)(["content"]), async (req, res) => {
    try {
        if (req.user?.role !== "reviewer") {
            return res.status(403).json({ message: "Only reviewers can comment" });
        }
        const submissionId = req.params.submissionId;
        const { content, line_number } = req.body;
        if (!content) {
            return res.status(400).json({ message: "Comment content is required" });
        }
        const comment = await (0, comments_1.createComment)(submissionId, req.user.id, content, line_number ?? null);
        res.status(201).json({ message: "Comment created successfully", comment });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//get comments by a submission
app.get("/api/submissions/:submissionId/comments", middleware_1.authenticateToken, async (req, res) => {
    try {
        const submissionId = req.params.submissionId;
        const comments = await (0, comments_1.getCommentsBySubmission)(submissionId);
        res.json({ comments });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}); //update comments
app.put("/api/comments/:id", middleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { content, line_number } = req.body;
        if (!content) {
            return res.status(400).json({ message: "Comment content is required" });
        }
        const comment = await (0, comments_1.updateComment)(id, req.user.id, content, line_number ?? null);
        res.json({ message: "Comment updated successfully", comment });
    }
    catch (error) {
        if (error instanceof Error && error.message === "Comment not found") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//delete comments
app.delete("/api/comments/:id", middleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const comment = await (0, comments_1.deleteComment)(id, req.user.id);
        res.json({ message: "Comment deleted successfully", comment });
    }
    catch (error) {
        if (error instanceof Error && error.message === "Comment not found") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}); //approve or requuest changes 
app.put("/api/submissions/:id/review", middleware_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== "reviewer") {
            return res.status(403).json({ message: "Only reviewers can review submissions" });
        }
        const submissionId = req.params.id;
        const { status } = req.body;
        if (status !== "approved" && status !== "changes_requested") {
            return res.status(400).json({ message: "Status must be approved or changes_requested" });
        }
        const review = await (0, reviews_1.reviewSubmission)(submissionId, req.user.id, status);
        (0, webserver_1.broadcastMessage)({
            type: "review_update",
            submission_id: submissionId,
            reviewer_id: req.user.id,
            status: status
        });
        res.json({ message: "Submission reviewed successfully", review });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}); //review history
app.get("/api/submissions/:id/reviews", middleware_1.authenticateToken, async (req, res) => {
    try {
        const submissionId = req.params.id;
        const reviews = await (0, reviews_1.getReviewHistory)(submissionId);
        res.json({ reviews });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//notifications
app.post("/api/activities", middleware_1.authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({
                message: "Activity message is required"
            });
        }
        const activity = await (0, notifications_1.createActivity)(req.user.id, message);
        res.status(201).json({
            message: "Activity created successfully",
            activity
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});
app.get("/api/activities", middleware_1.authenticateToken, async (req, res) => {
    try {
        const activities = await (0, notifications_1.getActivityFeed)(req.user.id);
        res.json({ activities });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
app.get("/api/projects/:projectId/stats", middleware_1.authenticateToken, async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const stats = await (0, stats_1.getProjectStats)(projectId);
        res.json({ stats });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = app;
