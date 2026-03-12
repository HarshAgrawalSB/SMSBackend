const express = require('express');
const studentController = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('ADMIN', 'ADVISOR', 'MANAGEMENT', 'STUDENT'), studentController.getStudents);
router.get('/:id', restrictTo('ADMIN', 'ADVISOR', 'MANAGEMENT', 'STUDENT'), studentController.getStudentById);
router.post('/', restrictTo('ADMIN', 'ADVISOR'), studentController.createStudent);
router.put('/:id', restrictTo('ADMIN', 'ADVISOR'), studentController.updateStudent);
router.delete('/:id', restrictTo('ADMIN', 'ADVISOR'), studentController.deleteStudent);
router.post('/:id/create-user', restrictTo('ADMIN'), studentController.createPortalUser);

module.exports = router;
