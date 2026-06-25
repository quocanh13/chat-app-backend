import { Request, Response } from "express";
import { GetFileInformationSchema, PostFileSchema } from "./file.dto.js";
import { ErrorResponse } from "../../shared/types.js";
import * as FileService from "./file.service.js"

export async function postFile(req: Request, res: Response) {
    let errorResponse: ErrorResponse
    const input = {
        name : req.file?.originalname,
        mimeType : req.file?.mimetype,
        storedName : req.file?.storedName,
        size : req.file?.size,
        type : req.body.type,
        userId : req.user?.id
    }

    const dto = PostFileSchema.safeParse(input)
    if(!dto.success){
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(errorResponse)
    }
    
    const createFileResult = await FileService.createFile(dto.data)
    if(createFileResult.success)
        return res.status(201).json(createFileResult.data)
    
    return res.sendStatus(500)
}

export async function getFileInformation(req: Request, res: Response) {
    let errorResponse: ErrorResponse
    const input = {
        fileId : Number(req.params.fileId),
        userId : req.user?.id
    }

    const dto = GetFileInformationSchema.safeParse(input)
    if(!dto.success){
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(errorResponse)
    }

    const getFileInformationResult = await FileService.getFileInformation(dto.data)
    if(getFileInformationResult.success)
        return res.status(200).json(getFileInformationResult.data)

    if(getFileInformationResult.code == "FILE_NOT_FOUND"){
        errorResponse = {
            error : "FILE_NOT_FOUND",
            message : `File with id = ${dto.data.fileId} not found`
        }
        return res.status(404).json(errorResponse)
    }

    if(getFileInformationResult.code == "ACCESS_DENIED"){
        errorResponse = {
            error : "ACCESS_DENIED",
            message : `User with id = ${dto.data.userId} does not have permission to read file with id = ${dto.data.fileId}`
        }
        return res.status(403).json(errorResponse)
    }

    errorResponse = {
        error : "SERVER_ERROR",
        message : `Server error`
    }
    return res.status(500).json(errorResponse)
}