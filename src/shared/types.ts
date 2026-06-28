export type UserFields = "id" | "username" | "passwordHash" | "name" | "email" | "avatarFileId" | "createdAt"
export type FileFields = "id" | "name" | "storedName" | "mimeType" | "type" | "size" | "userId" | "uploadedAt"
export type GroupFields = "id" | "name" | "avatarFileId" | "lastMessageId" | "createdAt"
export type UserInGroupFields = "userId" | "groupId" | "role" | "joinedAt"

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
    delete: boolean,
    owner: boolean
}
export type File = {
    id: number,
    name: string,
    storedName: string,
    mimeType: string,
    type: "USER_AVATAR" | "GROUP_AVATAR" | "MESSAGE",
    size: number,
    userId: number,
    uploadedAt: Date
}
export type Group = {
    id: number
    name: string,
    avatarFileId : number | null,
    lastMessageId : number,
    createdAt: Date
}
export type UserInGroup = {
    userId : number,
    groupId : number,
    role : "member" | "host",
    joinedAt : Date
}


export type ErrorResponse = {
    error: string,
    detail?: Record<string, unknown>,
    message?: string
}
export type SocketResponse = {
    action?: string,
    success: boolean,
    error?: string,
    detail?: Record<string, unknown>,
    message?: string
}
export class SocketAuthError extends Error{
    public code: string
    constructor(code : string, message : string){
        super(message)
        this.code = code
    }
}

export type RepoResult<Code = undefined, Data = undefined> = {
    success: boolean,
    code?: Code,
    data?: Data
}

export type ServiceResult<Code = undefined, Data = undefined> = {
    success: boolean,
    code?: Code,
    data?: Data
}

export type JWTPayload = {
    username: string,
    id: number
}





export {};