import {email, z} from "zod";

export const GetUserByIdSchema = z.object({
    id: z.coerce.number().int().positive()
})

export const PutUserSchema = z.object({
    id : z.int().positive(),
    username: z.string().min(1).max(30).regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters (a-z, A-Z) and numbers (0-9)"),
    name: z.string().trim().min(1).max(50).regex(/^[\p{L}\s]+$/u, "Name must not contain digit (0-9) and special symbol"),
    email : z.email().max(255),
    avatarFileId : z.int().positive()
})

export const PatchUserSchema = z.object({
    id : z.int().positive(),
    username: z.string().min(1).max(30).regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters (a-z, A-Z) and numbers (0-9)").optional(),
    name: z.string().trim().min(1).max(50).regex(/^[\p{L}\s]+$/u, "Name must not contain digit (0-9) and special symbol").optional(),
    email : z.email().max(255).optional(),
    avatarFileId : z.int().positive().optional()
})
