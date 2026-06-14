import { Router } from "express";
import { postGroup, postMember, getGroup } from "./group.controller.js";
import { verifyUser } from "auth";

const router = Router()
router.post("/groups", [verifyUser, postGroup])
router.get("/groups/:groupId", [verifyUser, getGroup])
router.post("/groups/:groupId/members", [verifyUser, postMember])

export default router