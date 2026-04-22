// ============================================================
// middleware/validate.js
// ============================================================
// Middleware functions that run BEFORE the main controller.
// They check if the incoming data is valid.
// If invalid → they stop the request and send an error.
// If valid   → they call next() to pass to the controller.
// ============================================================

const { body, param, validationResult } = require('express-validator');

// ============================================================
// Helper: checkValidationResult
// After running validation rules, this checks if any errors
// were found and returns them as a formatted JSON response.
// ============================================================
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Map errors to a clean array of messages
    const errorMessages = errors.array().map(e => e.msg);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next(); // no errors, continue to controller
};

// ============================================================
// validateCreate
// Rules for creating a new weather record
// ============================================================
const validateCreate = [
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required.')
    .isLength({ min: 1, max: 200 }).withMessage('Location must be between 1 and 200 characters.'),

  body('date_range_start')
    .optional({ checkFalsy: true })
    .isDate().withMessage('Start date must be a valid date (YYYY-MM-DD).'),

  body('date_range_end')
    .optional({ checkFalsy: true })
    .isDate().withMessage('End date must be a valid date (YYYY-MM-DD).')
    .custom((endDate, { req }) => {
      // End date must be after start date
      if (req.body.date_range_start && endDate) {
        const start = new Date(req.body.date_range_start);
        const end   = new Date(endDate);
        if (end < start) {
          throw new Error('End date must be on or after start date.');
        }
      }
      return true;
    }),

  checkValidationResult
];

// ============================================================
// validateUpdate
// Rules for updating an existing weather record
// ============================================================
const validateUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('Record ID must be a positive integer.'),

  body('location')
    .optional()
    .trim()
    .notEmpty().withMessage('Location cannot be empty if provided.')
    .isLength({ max: 200 }).withMessage('Location must be under 200 characters.'),

  body('date_range_start')
    .optional({ checkFalsy: true })
    .isDate().withMessage('Start date must be a valid date (YYYY-MM-DD).'),

  body('date_range_end')
    .optional({ checkFalsy: true })
    .isDate().withMessage('End date must be a valid date (YYYY-MM-DD).'),

  checkValidationResult
];

// ============================================================
// validateId
// Just checks that a URL :id param is a valid positive integer
// ============================================================
const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Record ID must be a positive integer.'),
  checkValidationResult
];

module.exports = { validateCreate, validateUpdate, validateId };
