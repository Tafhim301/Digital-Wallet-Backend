import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { userController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userController.createUser
);
router.get(
  "/all-users",
  checkAuth(Role.ADMIN),

  userController.getAllUsers
);
router.get(
  "/me",
  checkAuth(...Object.values(Role)),

  userController.getMe
);
router.post(
  "/checkPassword",
  checkAuth(...Object.values(Role)),

  userController.checkPassword
);


export const userRoutes = router;
