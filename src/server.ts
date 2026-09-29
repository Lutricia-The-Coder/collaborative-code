import dotenv from "dotenv";
import app from "./app";
import pool from "./db";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

pool.query("SELECT NOW()")
    .then(() => {
        console.log("Database connected");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed");
        console.error(error);
    });