import type {Request, Response} from "express";
import AuthService from "../services/AuthService.js";

export default class AuthController {
    static async register(req: Request, res: Response){
      try { 
            const {nome, email, senha} = req.body;
            const result = await AuthService.register(nome, email, senha);
            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(400).json({message: error.message});
        }   
    }     

    static async login (req: Request, res: Response){
        try{
            const {email, senha} = req.body;
            const result = await AuthService.login(email, senha);
            return res.status(200).json(result);
        } catch (error: any){
            return res.status(400).json({message: error.message});
        }
    }
} 