import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Collaborative Code Review API"
    });
});

export default app;