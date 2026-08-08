import { Router } from 'express';
import * as messagesController from '../controllers/messages.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/users', messagesController.getUsers);
router.get('/conversations', messagesController.getConversations);
router.get('/:userId', messagesController.getConversationMessages);
router.post('/', messagesController.postMessage);

export default router;