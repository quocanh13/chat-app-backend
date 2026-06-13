import z from "zod";

export const CreateRoomSchema = z.object({
    name: z.string().min(1).max(50),
    type: z.enum(["direct", "group"])
})