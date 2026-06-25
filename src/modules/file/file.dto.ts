import z from "zod";

export const PostFileSchema = z.object({
    name: z.string().min(1).max(255),
    storedName: z.string().length(36),
    mimeType: z.string(),
    type: z.enum(["USER_AVATAR" , "GROUP_AVATAR" , "MESSAGE"]),
    size: z.int().positive(),
    userId: z.int().positive()
})

export const GetFileInformationSchema = z.object({
    fileId : z.number().positive(),
    userId : z.number().positive()
})