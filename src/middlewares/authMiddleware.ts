import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET || "";

export interface AuthRequest extends Request { 
    userId?: number;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({message: "No token provided"});

    const parts = authHeader.split(" ");
    const token = parts[1];

    if(!token) return res.status(401).json({message: "No token provided"});

    try{
        const decoded = jwt.verify(token, SECRET) as unknown as { userId: number };
        req.userId = decoded.userId;
        return next();
    } catch (error){
        return res.status(401).json({message: "Invalid token"});
    }
}