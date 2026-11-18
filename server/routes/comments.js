const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);
router.get('/:id/comments', ctrl.getComments);
router.post('/:id/comments', [body('body').trim().notEmpty()], validate, ctrl.addComment);
router.delete('/:id/comments/:commentId', ctrl.deleteComment);
module.exports = router;
