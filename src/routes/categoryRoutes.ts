import { Router } from "express";
import CategoryController from "../controllers/CategoryController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", CategoryController.create);
router.get("/", CategoryController.list);
router.put("/:id", CategoryController.update);
router.delete("/:id", CategoryController.delete);

export default router;
