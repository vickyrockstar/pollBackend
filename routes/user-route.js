const userController = require('../controllers/user-controller');
const express = require('express');
const { check } = require('express-validator');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

//router.use(checkAuth);

router.post('/signup', [check('name').not().isEmpty(), check('email').normalizeEmail().isEmail(), check('password').isLength({min:6})],
userController.signUp);

router.post('/login', userController.login);

module.exports = router;