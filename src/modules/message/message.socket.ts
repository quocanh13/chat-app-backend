import { Socket } from "socket.io";
import { SendMessageSchema } from "./message.dto.js";
import * as MessageService from "./message.service.js"
import { SocketResponse } from "../../shared/types.js";

type AckFunction = (data: object) => void

async function handleSendMessage(
    socket: Socket, 
    data: any,
    ack: AckFunction
){
    let socketResponse : SocketResponse
    const input = {...data, userId: socket.user?.id}
    const dto = SendMessageSchema.safeParse(input)
    const action = "message:send"
    
    if(!dto.success){
        socketResponse = {
            success : false,
            action,
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {
                ...dto.error.flatten().fieldErrors,
                ...dto.error.flatten().formErrors
            }
        }
        return ack(socketResponse) 
    }

    const sendMessageResult = await MessageService.sendMessage(dto.data)
    if(sendMessageResult.success){
        socketResponse = {
            success : true,
            action
        }
        return ack(socketResponse) 
    }

    if(sendMessageResult.code == "USER_NOT_MEMBER"){
        socketResponse = {
            success : false,
            action,
            error : "USER_NOT_MEMBER",
            message : `You are not a member of the group with id = ${dto.data.groupId}`
        }
        return ack(socketResponse) 
    }

    if(sendMessageResult.code == "FILE_ACCESS_DENIED"){
        socketResponse = {
            success : false,
            action,
            error : "FILE_ACCESS_DENIED",
            message : `User with id = ${dto.data.userId} does not have permission to access file with id = ${dto.data.fileId}`
        }
        return ack(socketResponse) 
    }

    if(sendMessageResult.code == "FILE_NOT_FOUND"){
        socketResponse = {
            success : false,
            action,
            error : "FILE_NOT_FOUND",
            message : `File with id = ${dto.data.fileId} not found`
        }
        return ack(socketResponse) 
    }

    socketResponse = {
        success : false,
        action,
        error : "SERVER_ERROR",
        message : "Server Error"
    }
    return ack(socketResponse) 
}

export default function registerHandleSend(socket : Socket){
    socket.on("message:send", (data, ack) => handleSendMessage(socket, data, ack))
}