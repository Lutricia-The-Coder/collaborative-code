"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFields = requireFields;
function requireFields(fields) {
    return (req, res, next) => {
        for (const field of fields) {
            if (req.body[field] === undefined ||
                req.body[field] === null ||
                req.body[field] === "") {
                return res.status(400).json({
                    message: `${field} is required`
                });
            }
        }
        next();
    };
}
