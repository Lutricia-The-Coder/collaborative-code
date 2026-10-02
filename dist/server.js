"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./db"));
const webserver_1 = require("./webserver");
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 5000;
const WS_PORT = 5001;
db_1.default.query("SELECT NOW()")
    .then(() => {
    console.log("Database connected");
    app_1.default.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        (0, webserver_1.startWebSocketServer)(WS_PORT);
    });
})
    .catch((error) => {
    console.error("Database connection failed");
    console.error(error);
});
