import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

export default class AuthService {
    static async register(nome: string, email: string, senha: string){
        const existing = await prisma.user.findUnique({where: {email}});
        if(existing) throw new Error("Email já cadastrado.");

        const hashed = await bcrypt.hash(senha, 10);
        const user = await prisma.user.create({
            data: {nome, email, senha: hashed},
        });

        const token = generateToken({userId: user.id});
        return { user: { id: user.id, nome: user.nome, email: user.email}, token };
    }

    static async login(email: string, senha: string){
        const user = await prisma.user.findUnique({where: {email}});
        if(!user) throw new Error("Credenciais inválidas.");

        const match = await bcrypt.compare(senha, user.senha);
        if(!match) throw new Error("Credenciais inválidas.");

        const token = generateToken({userId: user.id});
        return { user: {id: user.id, nome: user.nome, email: user.email}, token };
    }
}