import { Router } from "express";
import { getUserById, patchUser, putUser } from "./user.controller.js";
import { verifyUser } from "../auth/index.js"

const router = Router()

router.all("/users/:id", verifyUser)
router.get("/users/:id", getUserById)
router.put("/users/:id", putUser)
router.patch("/users/:id", patchUser)

export default router