import { Router } from "express";
import userAuthentication from "./userAuthentication.js"

const router = Router();

router.use([userAuthentication]);

export default router;