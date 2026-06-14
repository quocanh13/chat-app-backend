import jwt from "jsonwebtoken"
import z from "zod";

const payloadSchema = z.object({
    id: z.int().positive(),
    username: z.string().min(1).max(30).regex(/^[a-zA-Z0-9]+$/)
})

export function sign<T extends object>(payload: T){
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not defined");
    }
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {expiresIn: "1y"})
}

export function verify(token: string) : "INVALID_TOKEN" | "TOKEN_EXPIRED" | {id: number, username: string}{
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not defined");
    }
    try{
        const payload = jwt.verify(token, secret)
        if(typeof(payload) == "string")
            return "INVALID_TOKEN"
        else{
            const zpayload = payloadSchema.safeParse(payload)
            if(!zpayload.success)
                return "INVALID_TOKEN"
            else
                return zpayload.data
        }
    }catch(err : any){
        if(err.name === "TokenExpiredError")
            return "TOKEN_EXPIRED"
        else
            return "INVALID_TOKEN"
    }
}