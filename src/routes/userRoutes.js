import { Router } from 'express';
import { updateMyProfile, changeMyPassword, getUsers } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { validateUpdateProfile, validateChangePassword } from '../validators/userValidator.js';

const router = Router();

router.use(protect);

router.patch('/me', validate(validateUpdateProfile), updateMyProfile);
router.patch('/me/password', validate(validateChangePassword), changeMyPassword);

router.get('/', authorize('admin'), getUsers);

export default router;
