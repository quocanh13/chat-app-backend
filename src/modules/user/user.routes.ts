import { Router } from "express";
import { create, getUserById } from "./user.controller.js";

const router = Router()

router.post("/users", create)
router.get("/users/:id", getUserById)

export default router