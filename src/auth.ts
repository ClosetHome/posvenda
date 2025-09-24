import bcrypt from 'bcryptjs';
import jwt, { VerifyOptions } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';


const privateKey = fs.readFileSync(path.join(process.cwd(),`/keys/private.key`), 'utf8');
const publicKey = fs.readFileSync(path.join(process.cwd(),`/keys/public.key`), 'utf8');

const jwtExpires = parseInt(process.env.JWT_EXPIRE || "90000");
const jwtAlgorithm = "RS256";

function hashPassword(password: any) {
    const hashed = bcrypt.hashSync(password, 10);
    return hashed;
}

function comparePassword(password: any, hashPassword: any) {
    const isMatch = bcrypt.compareSync(password, hashPassword);
    return isMatch;
}

type Token = { userId: number }

function sign(userId: number) {
    const token: Token = { userId };
    return jwt.sign(token, privateKey, { expiresIn: jwtExpires, algorithm: jwtAlgorithm });
}

async function verify(token: string) {
    try {
        const decoded: Token = await jwt.verify(token, publicKey, { algorithm: [jwtAlgorithm] } as VerifyOptions) as Token;
        return { userId: decoded.userId };
    } catch (error) {
        console.log(`verify:${error}`);
        return null;
    }
}

// Configuração do Passport para Google OAuth 2.0

export default { hashPassword, comparePassword, sign, verify };