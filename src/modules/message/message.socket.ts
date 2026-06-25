import { Socket } from "socket.io";
import { SendMessageSchema } from "./message.dto.js";
import * as MessageService from "./message.service.js"
import { ErrorResponse, SocketResponse } from "../../shared/types.js";

async function handleSendMessage(
    socket: Socket, 
    data: any
){
    let socketResponse : SocketResponse
    const input = {...data, userId: socket.user?.id}
    const dto = SendMessageSchema.safeParse(input)
    const action = "message:send"
    
    if(!dto.success){
        socketResponse = {
            success : false,
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {
                ...dto.error.flatten().fieldErrors,
                ...dto.error.flatten().formErrors
            }
        }
        socket.send(socketResponse)
        return 
    }

    const sendMessageResult = await MessageService.sendMessage(dto.data)
    if(sendMessageResult.success){
        socketResponse = {
            success : true,
            action,
            requestId: dto.data.requestId
        }
        socket.send(socketResponse)
        return 
    }

    if(sendMessageResult.code == "USER_NOT_MEMBER"){
        socketResponse = {
            success : false,
            action,
            error : "USER_NOT_MEMBER",
            message : `You are not a member of the group with id = ${dto.data.groupId}`
        }
    }
}

export default function registerHandleSend(socket : Socket){
    socket.on("message:send", (data) => handleSendMessage(socket, data))
}