const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../../middlewares/auth.verificate');

// Only admin should manage courses — auth middleware verifies, further role-check in controller could be added
router.get('/', authMiddleware, courseController.getCourses);
router.post('/', authMiddleware, courseController.createCourse);
router.delete('/:id', authMiddleware, courseController.deleteCourse);
router.post('/:id/unidades', authMiddleware, courseController.addUnit);
router.delete('/:id/unidades/:unidade', authMiddleware, courseController.removeUnit);

module.exports = router;
