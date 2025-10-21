import { Router } from "express"
import { AccountController } from "../controllers/AccountController"
import { authMiddleware } from "../../src/middlewares/authMiddleware"

const router = Router()
const controller = new AccountController()

router.use(authMiddleware)

router.get("/", controller.list)
router.get("/:id", controller.get)
router.post("/", controller.create)
router.put("/:id", controller.update)
router.delete("/:id", controller.delete)

export default router
