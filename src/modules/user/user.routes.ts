import { Router } from "express";
import { getUserById, patchUser, putUser, verifyUser } from "./user.controller.js";

const router = Router()

router.all("/users/:id", verifyUser)
router.get("/users/:id", getUserById)
router.put("/users/:id", putUser)
router.patch("/users/:id", patchUser)

export default router