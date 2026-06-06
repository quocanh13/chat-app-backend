import {z} from "zod";

export const GetUserByIdSchema = z.object({
    id: z.coerce.number().int().positive()
})