import z from "zod";

export const SendMessageSchema = z.object({
    userId: z.int().positive(),
    groupId: z.int().positive(),
    fileId: z.int().positive().nullable().optional(),
    content: z.string().min(1).max(1000)
})