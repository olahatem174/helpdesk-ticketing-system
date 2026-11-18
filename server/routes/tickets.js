const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/',    ctrl.getTickets);
router.post('/',   [body('title').trim().notEmpty(), body('description').trim().notEmpty()], validate, ctrl.createTicket);
router.get('/:id', ctrl.getTicketById);
router.put('/:id', ctrl.updateTicket);

router.put('/:id/status',
  authorize('admin','technician'),
  [body('status').isIn(['open','in_progress','resolved','closed'])],
  validate, ctrl.updateStatus);

router.put('/:id/assign',
  authorize('admin'),
  [body('technician_id').notEmpty()],
  validate, ctrl.assignTicket);

router.delete('/:id', authorize('admin'), ctrl.deleteTicket);

module.exports = router;
