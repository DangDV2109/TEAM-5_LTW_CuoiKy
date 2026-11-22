import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { validateRegister, validateLogin } from '../validators/userValidator.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Thử quá nhiều lần, vui lòng quay lại sau 15 phút' }
});

router.post('/register', authLimiter, validate(validateRegister), register);
router.post('/login', authLimiter, validate(validateLogin), login);
router.get('/me', protect, getMe);

export default router;
