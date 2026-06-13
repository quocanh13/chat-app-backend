export type UserFields = "id" | "username" | "passwordHash" | "name" | "email" | "avatarFileId" | "createdAt"
export type FileFields = "id" | "name" | "mimeType" | "type" | "size" | "userId" | "uploadedAt"

export type User = {
    id: number
    username: string,
    passwordHash: string,
    email: string,
    name: string,
    avatarFileId: number,
    createdAt: Date
}

export type FilePermission = {
    read: boolean,
    update: boolean,
    delete: boolean
}
export type File = {
    id: number,
    name: string,
    mimeType: string,
    type: string,
    size: number,
    userId: number,
    uploadedAt: Date
}

export type ErrorResponse = {
    error: string,
    detail?: Record<string, unknown>,
    message?: string
}

export type RepoResponse<Code = undefined, Data = undefined> = {
    success: boolean,
    code?: Code,
    data?: Data
}

export type ServiceResponse<Code = undefined, Data = undefined> = {
    success: boolean,
    code?: Code,
    data?: Data
}

export type JWTPayload = {
    username: string,
    id: number
}

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export {};