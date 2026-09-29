import express from "express";
import { registerUser, loginUser } from "./auth";
import { authenticateToken, AuthRequest } from "./middleware";
import { getUserById, updateUser, deleteUser } from "./users";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Collaborative Code Review API"
    });
});

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (role && role !== "submitter" && role !== "reviewer") {
            return res.status(400).json({
                message: "Role must be submitter or reviewer"
            });
        }

        const user = await registerUser(
            name,
            email,
            password,
            role || "submitter"
        );

        res.status(201).json({
            message: "User registered successfully",
            user
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Email already registered") {
            return res.status(409).json({
                message: error.message
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await loginUser(email, password);

        res.status(200).json({
            message: "Login successful",
            ...result
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Invalid email or password"
        ) {
            return res.status(401).json({
                message: error.message
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res) => {
    res.json({
        message: "Authentication successful",
        user: req.user
    });
});
export default app;