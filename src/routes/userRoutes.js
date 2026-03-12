const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

router.post('/', restrictTo('ADMIN'), userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', restrictTo('ADMIN'), userController.deleteUser);

module.exports = router;
