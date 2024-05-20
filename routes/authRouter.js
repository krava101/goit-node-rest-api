import AuthController from '../controllers/authControllers.js';
import authMiddleware from '../middleware/auth.js'
import express from "express";

const router = express.Router();
const jsonParser = express.json();

router.post('/register', jsonParser, AuthController.register);
router.post('/login', jsonParser, AuthController.login);
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/current', authMiddleware, AuthController.current);

export default router;