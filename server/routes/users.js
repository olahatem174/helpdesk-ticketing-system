const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/',     ctrl.getUsers);
router.put('/:id',  ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);
module.exports = router;
