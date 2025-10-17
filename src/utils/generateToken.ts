import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "";

export function generateToken(payload: object){
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '22h'});
}