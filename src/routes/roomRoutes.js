import { Router } from 'express';
import { getRooms, getRoom, createRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { protect, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import { validateCreateRoom, validateUpdateRoom } from '../validators/roomValidator.js';

const router = Router();

router.get('/', getRooms);
router.get('/:id', validateObjectId('id'), getRoom);

router.post('/', protect, authorize('admin'), validate(validateCreateRoom), createRoom);
router.put('/:id', protect, authorize('admin'), validateObjectId('id'), validate(validateUpdateRoom), updateRoom);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), deleteRoom);

export default router;
