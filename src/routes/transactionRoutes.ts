import { Router } from "express";
import TransactionController from "../controllers/TransactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", TransactionController.create);
router.get("/", TransactionController.list);
router.get("/summary", TransactionController.summary);
router.get("/:id", TransactionController.get);
router.put("/:id", TransactionController.update);
router.delete("/:id", TransactionController.delete);

export default router;