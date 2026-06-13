import { Router } from "express";
import { postGroup } from "./group.controller.js";

const router = Router()
router.post("/groups", postGroup)

export default router