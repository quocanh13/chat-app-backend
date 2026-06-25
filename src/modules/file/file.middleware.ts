import path from "path"
import multer from "multer";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../../shared/types.js";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "./storage");
    },

    filename(req, file, cb) {
        const ext = path.extname(file.originalname)
        file.storedName = randomUUID()
         
        cb(null, file.storedName);
    }
});

export function multerError(err: multer.MulterError, req: Request, res: Response, next: NextFunction){
    let errorResponse : ErrorResponse
    if(err.code == "LIMIT_FILE_SIZE"){
        errorResponse = {
            error : "FILE_TOO_LARGE",
            message : "Maximum file size is 10 MB"
        }
        return res.status(413).json(errorResponse)
    }

    console.log(err)
    errorResponse = {
        error : "SERVER_ERROR",
        message : "Server error"
    }
    return res.status(500).json(errorResponse)
}

export const uploadFile = multer({ 
    storage, 
    limits : {
        fileSize : 10 * 1024**2
    }
});