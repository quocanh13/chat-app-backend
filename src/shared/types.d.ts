export type ErrorResponse = {
    error: string,
    detail: object
}

export type RepoResponse<Code = undefined, Data = undefined> = {
    success: boolean,
    code: Code,
    data: Data
}

export type ServiceResponse<Code = undefined, Data = undefined> = {
    success: boolean,
    code: Code,
    data: Data
}

interface JWTPayload {
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