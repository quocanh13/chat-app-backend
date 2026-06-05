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