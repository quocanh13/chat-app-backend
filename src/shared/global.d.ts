import {JWTPayload} from "./types.ts"

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
        
        namespace Multer {
            interface File {
                storedName?: string;
            }
        } 
    }

   
}


declare module "socket.io" {
    interface Socket {
        user?: JWTPayload;
    }
}