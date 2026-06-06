import { Router } from "express";
import { create } from "./auth.controllder.js";

const router = Router()

router.post("/auth/register", create)

export default router