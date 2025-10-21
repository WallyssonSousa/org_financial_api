import { Router } from "express";
import TransactionController from "../controllers/TransactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", TransactionController.create);
router.put("/:id", TransactionController.update);
router.delete("/:id", TransactionController.delete);
router.get("/", TransactionController.list);



export default router;