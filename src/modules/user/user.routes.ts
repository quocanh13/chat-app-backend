import { Router } from "express";
import { getGroupList, getUserById, patchUser, putUser } from "./user.controller.js";
import { verifyUser } from "../auth/index.js"

const router = Router()

router.get("/users/:id", [verifyUser, getUserById])
router.get("/users/:id/groups", [verifyUser, getGroupList])

router.put("/users/:id", [verifyUser, putUser])

router.patch("/users/:id", [verifyUser, patchUser])

export default router