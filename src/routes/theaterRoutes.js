import { Router } from 'express';
import { getTheaters, getTheater, createTheater, updateTheater, deleteTheater } from '../controllers/theaterController.js';
import { protect, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import { validateCreateTheater, validateUpdateTheater } from '../validators/theaterValidator.js';

const router = Router();

router.get('/', getTheaters);
router.get('/:id', validateObjectId('id'), getTheater);

router.post('/', protect, authorize('admin'), validate(validateCreateTheater), createTheater);
router.put('/:id', protect, authorize('admin'), validateObjectId('id'), validate(validateUpdateTheater), updateTheater);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), deleteTheater);

export default router;
