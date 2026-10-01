import express from "express";
import { registerUser, loginUser } from "./auth";
import { authenticateToken, AuthRequest } from "./middleware";
import { getUserById, updateUser, deleteUser } from "./users";
import {createProject, getProjects, addProjectMember, removeProjectMember} from "./projects";
import { createSubmission,getSubmissionsByProject, getSubmissionById,updateSubmissionStatus, deleteSubmission} from "./submissions";
import { createComment, getCommentsBySubmission } from "./comments";
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
//list submisssions
app.get(
    "/api/projects/:projectId/submissions",
    authenticateToken,
    async (req: AuthRequest, res) => {
        try {
            const projectId = req.params.projectId as string;
            const submissions = await getSubmissionsByProject(projectId);
            res.json({submissions});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Server error"});
        }
    }
);
//get 1 submission
app.get(
    "/api/submissions/:id",
    authenticateToken,
    async (req: AuthRequest, res) => {
        try {
            const id = req.params.id as string;
            const submission = await getSubmissionById(id);
            res.json({submission});
        } catch (error) {
            if (error instanceof Error &&error.message === "Submission not found"
            ) {
                return res.status(404).json({message: error.message});
            }
            console.error(error);
            res.status(500).json({message: "Server error"});
        }
    }
);
//pdating status
app.put(
    "/api/submissions/:id/status",
    authenticateToken,
    async (req: AuthRequest, res) => {
        try {
            const id = req.params.id as string;
            const { status } = req.body;

            const allowedStatuses = [
                "pending",
                "in_review",
                "approved",
                "changes_requested"
            ];

            if (!status || !allowedStatuses.includes(status)) {
                return res.status(400).json({message: "Invalid submission status"});
            }

            const submission = await updateSubmissionStatus(id,status);
            res.json({message: "Submission status updated successfully",submission});
        } catch (error) {
            if (error instanceof Error &&error.message === "Submission not found"
            ) {
                return res.status(404).json({message: error.message});
            }
            console.error(error);
            res.status(500).json({message: "Server error"
            });
        }
    }
);
//delete submission
app.delete(
    "/api/submissions/:id",
    authenticateToken,
    async (req: AuthRequest, res) => {
        try {
            const id = req.params.id as string;
            const submission = await deleteSubmission(id);

            res.json({message: "Submission deleted successfully",submission});
        } catch (error) {
            if (error instanceof Error && error.message === "Submission not found") {
                return res.status(404).json({message: error.message});
            }
            console.error(error);
            res.status(500).json({message: "Server error"});
        }
    }
);//create comments
app.post(
    "/api/submissions/:submissionId/comments",
    authenticateToken,
    async (req: AuthRequest, res) => {
        try {
            const submissionId = req.params.submissionId as string;
            const { content, line_number } = req.body;

            if (!content) {
                return res.status(400).json({message: "Comment content is required"});
            }
            const comment = await createComment(
                submissionId,
                req.user!.id,
                content,
                line_number ?? null
            );
            res.status(201).json({message: "Comment created successfully",comment});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Server error"});
        }
    }
);
//get comments by a submission
app.get(
    "/api/submissions/:submissionId/comments",
    authenticateToken,
    async (req: AuthRequest, res) => {
        try {
            const submissionId =req.params.submissionId as string;
            const comments = await getCommentsBySubmission(submissionId);
            res.json({comments});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Server error"});
        }
    }
);
export default app;
