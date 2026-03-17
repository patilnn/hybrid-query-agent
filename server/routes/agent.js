import { Router } from "express";
import { generateQueries } from "../controllers/agentController.js";

const router = Router();

router.post("/queries", generateQueries);

export default router;
