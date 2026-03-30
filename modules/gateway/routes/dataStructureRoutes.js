import { Router } from "express";
import { runDataStructureScan } from "../controllers/dataStructureController.js";

const router = Router();

// POST /data-structure/scan
router.post("/scan", runDataStructureScan);

export default router;
