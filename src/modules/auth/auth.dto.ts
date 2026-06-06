import {z} from "zod";

export const RegisterSchema = z.object({
    username: z.string().min(1).max(30).regex(/^[a-zA-Z0-9]+$/),
    password: z.string().min(1).max(30),
    name: z.string().trim().min(1).max(50).regex(/^[\p{L}\s]+$/u, "There is an invalid letter in name"),
})