import { Request, Response, NextFunction } from "express";

export function requireFields(
    fields: string[]
) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        for (const field of fields) {
            if (
                req.body[field] === undefined ||
                req.body[field] === null ||
                req.body[field] === ""
            ) {
                return res.status(400).json({
                    message: `${field} is required`
                });
            }
        }

        next();
    };
}