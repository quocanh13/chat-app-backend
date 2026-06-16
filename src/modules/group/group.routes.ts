import { Router } from "express";
import { postGroup, postMember, getGroup, deleteMember, putGroup, patchGroup } from "./group.controller.js";
import { verifyUser } from "auth";

const router = Router()
router.post("/groups", [verifyUser, postGroup])
router.get("/groups/:groupId", [verifyUser, getGroup])
router.put("/groups/:groupId", [verifyUser, putGroup])
router.patch("/groups/:groupId", [verifyUser, patchGroup])
router.post("/groups/:groupId/members", [verifyUser, postMember])
router.delete("/groups/:groupId/members/:memberId", [verifyUser, deleteMember])

export default router