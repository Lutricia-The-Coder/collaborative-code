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
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.json({ message: "Collaborative Code Review API" });
});
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }
        if (role && role !== "submitter" && role !== "reviewer") {
            return res.status(400).json({ message: "Role must be submitter or reviewer" });
        }
        const user = await (0, auth_1.registerUser)(name, email, password, role || "submitter");
        res.status(201).json({ message: "User registered successfully", user });
    }
    catch (error) {
        if (error instanceof Error && error.message === "Email already registered") {
            return res.status(409).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//login
app.post("/api/auth/login", async (req, res) => {
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
app.post("/api/projects", middleware_1.authenticateToken, async (req, res) => {
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
app.post("/api/projects/:projectId/submissions", middleware_1.authenticateToken, async (req, res) => {
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
exports.default = app;
