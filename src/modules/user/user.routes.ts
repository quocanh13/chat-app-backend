import { Router } from "express";
import { getUserById, verifyUser } from "./user.controller.js";

const router = Router()

router.all("/users/:id", verifyUser)
router.get("/users/:id", getUserById)

export default router