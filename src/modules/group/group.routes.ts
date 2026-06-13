import { Router } from "express";
import { postGroup } from "./group.controller.js";
import { verifyUser } from "auth";

const router = Router()
router.post("/groups", [verifyUser, postGroup])

export default router