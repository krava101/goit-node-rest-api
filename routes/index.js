import contactsRouter from "../routes/contactsRouter.js";
import authMiddleware from "../middleware/auth.js";
import authRouter from "../routes/authRouter.js";
import express from 'express';
import path from 'node:path';

const router = express.Router();

router.use("/api/avatars/", authMiddleware, express.static(path.resolve("public/avatars")));
router.use("/api/contacts", authMiddleware, contactsRouter);
router.use("/api/users", authRouter);

export default router;