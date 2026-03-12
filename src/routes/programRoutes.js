const express = require('express');
const programController = require('../controllers/programController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, programController.getPrograms);
router.get('/:id', protect, programController.getProgramById);
router.post('/', protect, restrictTo('ADMIN'), programController.createProgram);
router.put('/:id', protect, restrictTo('ADMIN'), programController.updateProgram);
router.delete('/:id', protect, restrictTo('ADMIN'), programController.deleteProgram);

module.exports = router;
