import { Router } from 'express';
import {
  getShowtimes,
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getSeatMap
} from '../controllers/showtimeController.js';
import { protect, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import { validateCreateShowtime, validateUpdateShowtime } from '../validators/showtimeValidator.js';

const router = Router();

router.get('/', getShowtimes);
router.get('/:id', validateObjectId('id'), getShowtime);

router.get('/:id/seats', protect, validateObjectId('id'), getSeatMap);

router.post('/', protect, authorize('admin'), validate(validateCreateShowtime), createShowtime);
router.put('/:id', protect, authorize('admin'), validateObjectId('id'), validate(validateUpdateShowtime), updateShowtime);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), deleteShowtime);

export default router;
