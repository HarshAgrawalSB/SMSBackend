const express = require('express');
const { body, validationResult } = require('express-validator');
const leadController = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

const router = express.Router();

const validateLead = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone is required')
];

router.post(
  '/',
  validateLead,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  leadController.createLead
);

router.use(protect);
router.get('/', restrictTo('ADMIN', 'ADVISOR', 'MANAGEMENT'), leadController.getLeads);
router.get('/:id', restrictTo('ADMIN', 'ADVISOR', 'MANAGEMENT'), leadController.getLeadById);
router.put('/:id', restrictTo('ADMIN', 'ADVISOR'), leadController.updateLead);
router.delete('/:id', restrictTo('ADMIN'), leadController.deleteLead);
router.post('/:id/enroll', restrictTo('ADMIN', 'ADVISOR'), leadController.enrollLead);

module.exports = router;
