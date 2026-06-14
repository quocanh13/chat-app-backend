import z from "zod";

export const CreateGroupSchema = z.object({
    name: z.string().min(1).max(50),
    hostId: z.int().positive(),
})

export const GetGroupSchema = z.object({
    groupId : z.int().positive(),
    userId: z.int().positive(),
    includeMember : z.boolean()
})

export const AddMemberSchema = z.object({
    groupId : z.int().positive(),
    userId : z.int().positive(),
    hostId : z.int().positive()
})

export const DeleteMemberSchema = z.object({
    groupId : z.int().positive(),
    memberId : z.int().positive(),
    hostId : z.int().positive()
})