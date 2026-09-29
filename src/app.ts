import express from "express";
import { registerUser } from "./auth";

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

export default app;