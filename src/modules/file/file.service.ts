import { FilePermission } from "../../shared/types.js";
import * as FileRepo from "./file.repository.js"

export async function getFilePermission(userId : number, fileId: number) : Promise<FilePermission> {
    const permission : FilePermission = {
        read : false, update : false, delete : false
    }
    const repo = await FileRepo.getFileById(fileId, ["userId"])
    if(repo.success){
        if(repo.data?.userId == userId){
            permission.read = true;
            permission.update = true;
            permission.delete = true;
        }
    }
    return permission
}