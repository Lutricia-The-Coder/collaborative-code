import express from "express";
import { registerUser, loginUser } from "./auth";
import { authenticateToken, AuthRequest } from "./middleware";
import { getUserById, updateUser, deleteUser } from "./users";
import {createProject, getProjects, addProjectMember, removeProjectMember} from "./projects";
import { createSubmission } from "./submissions";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Collaborative Code Review API"});
});

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({message: "Name, email and password are required"});
        }

        if (role && role !== "submitter" && role !== "reviewer") {
 return res.status(400).json({message: "Role must be submitter or reviewer"});
        }

 const user = await registerUser(name, email,password,role || "submitter");
res.status(201).json({message: "User registered successfully",user});
    } catch (error) {
        if (error instanceof Error && error.message === "Email already registered") {
 return res.status(409).json({ message: error.message});
        }

        console.error(error);
        res.status(500).json({ message: "Server error"});
    }
});
//login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
    return res.status(400).json({message: "Email and password are required" });
        }

        const result = await loginUser(email, password);

    res.status(200).json({ message: "Login successful", ...result});
    } catch (error) {
        if ( error instanceof Error &&error.message === "Invalid email or password") {
            return res.status(401).json({message: error.message});
        }

        console.error(error);
        res.status(500).json({ message: "Server error"});
    }
});

//autentication
app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res) => {
    res.json({ message: "Authentication successful", user: req.user });
});

app.get("/api/users/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        if (req.user?.id !== req.params.id) {
            return res.status(403).json({ message: "You can only access your own profile"});
        }

        const user = await getUserById(req.params.id);
        res.json({user});
    } catch (error) {
        if (error instanceof Error && error.message === "User not found") {
            return res.status(404).json({ message: error.message});
        }

        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//update user profile
app.put("/api/users/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        if (req.user?.id !== req.params.id) {
        return res.status(403).json({ message: "You can only update your own profile"});
        }

        const {name,email,password,profile_picture} = req.body;
        if (!name || !email) {
            return res.status(400).json({message: "Name and email are required" });
        }

        const user = await updateUser(req.params.id, name,email,password,profile_picture);
        res.json({ message: "User updated successfully",user});
    } catch (error) {
        if (error instanceof Error && error.message === "User not found") {
            return res.status(404).json({ message: error.message});
        }

        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});
//delete user
app.delete("/api/users/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        if (req.user?.id !== req.params.id) {
return res.status(403).json({message: "You can only delete your own account"});
        }

        await deleteUser(req.params.id);
        res.json({message: "User deleted successfully" });
    } catch (error) {
        if (error instanceof Error && error.message === "User not found") {
   return res.status(404).json({message: error.message});
        }

        console.error(error);
        res.status(500).json({ message: "Server error"});
    }
});
//create and list projects
app.post("/api/projects", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
     return res.status(400).json({ message: "Project name is required"});
        }

        const project = await createProject(name,description || null,req.user!.id);

        res.status(201).json({message: "Project created successfully", project});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});

app.get("/api/projects", authenticateToken, async (req, res) => {
    try {
        const projects = await getProjects();
        res.json({projects});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});
//add project member
app.post(
    "/api/projects/:id/members",
    authenticateToken,
    async (req: AuthRequest, res) => {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ message: "userId is required"});
            }

           const projectId = req.params.id as string;
const member = await addProjectMember(projectId,userId);
            res.status(201).json({message: "Member added successfully",member});
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error"});
        }
    }
);
//deleteproject member
app.delete(
    "/api/projects/:id/members/:userId",
    authenticateToken,
    async (req: AuthRequest, res) => {
        try {
            const projectId = req.params.id as string;
            const userId = req.params.userId as string;
            const member = await removeProjectMember(projectId,userId);

            res.json({message: "Member removed successfully",member});
        } catch (error) {
            if (error instanceof Error &&error.message === "Project member not found") {
                return res.status(404).json({message: error.message});
            }
            console.error(error);
            res.status(500).json({message: "Server error"});
        }
    }
);
//create submissions
app.post(
    "/api/projects/:projectId/submissions",
    authenticateToken,
    async (req: AuthRequest, res) => {
        try {
            const projectId = req.params.projectId as string;
            const {title,filename,code,language} = req.body;

            if (!title || !code) {
     return res.status(400).json({message: "Title and code are required"});
            }

            const submission = await createSubmission(
                projectId,
                req.user!.id,
                title,
                filename || null,
                code,
                language || null
            );

            res.status(201).json({message: "Submission created successfully",submission });
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Server error"});
        }
    }
);
export default app;