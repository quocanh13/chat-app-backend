import { Router } from "express";
import { postGroup, postMember, getGroup, deleteMember, putGroup, patchGroup, getMemberList } from "./group.controller.js";
import { verifyUser } from "auth";

const router = Router()
router.post("/groups", [verifyUser, postGroup])
router.post("/groups/:groupId/members", [verifyUser, postMember])

router.get("/groups/:groupId", [verifyUser, getGroup])
router.get("/groups/:groupId/members", [verifyUser, getMemberList])

router.put("/groups/:groupId", [verifyUser, putGroup])

router.patch("/groups/:groupId", [verifyUser, patchGroup])

router.delete("/groups/:groupId/members/:memberId", [verifyUser, deleteMember])

export default router