import { verifyUser } from "auth";
import { Router } from "express";
import { postMessage } from "./message.controller.js";

const router = Router()

router.post("/groups/:groupId/messages", [verifyUser, postMessage])

export default router