const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signUp = async (req, res, next) => {
    console.log("user-controller is running")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("User inputs are invalid", 422));
    }
    const { name, email, password } = req.body;

    let userExists;
    try {
        userExists = await User.findOne({ email: email })
    } catch (err) {
        return next(new HttpError("Error occured", 500))
    }
    if (userExists) {
        return next(new HttpError("User already exists, Please log in", 422));
        /* return next( new HttpError("User already exists", 422)); */

    }
    let hashPassword;
    try {
        hashPassword = await bcrypt.hash(password, 12)

    } catch (err) {
        return next(new HttpError("Could not create user, Please check your data", 500))
    }
    const createUser = new User({
        name,
        email,
        password: hashPassword,

    });
    try {
        await createUser.save()
    } catch (err) {
        return next(new HttpError("Could not save User, please try after some time", 500))
    }

    let token;
    token = jwt.sign({ userId: createUser.id, email: createUser.email }, 'secret_key', { expiresIn: '1h' })
    res.status(201).json({ userId: createUser.id, email: createUser.email, token: token })
};
//----
const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("User inputs are invalid", 422));
    }
    const { email, password } = req.body;

    let identifiedUser;
    try {
        identifiedUser = await User.findOne({ email: email })
    } catch (err) {
        return next(new HttpError("Error occured in finding user's data", 500))
    }
    if (!identifiedUser) {
        return next(new HttpError("User is not registered, Please Sign up", 401));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, identifiedUser.password)
    } catch (err) {
        return next(new HttpError("Security Isuue, please try after sometime", 500))
    }
    if (!isValidPassword) {
        return next(new HttpError('Password is not valid', 401));
    }

    let token;
    token = jwt.sign({ userId: identifiedUser.id, email: identifiedUser.email }, 'secret_key', { expiresIn: '1h' })
    res.status(201).json({ userId: identifiedUser.id, email: identifiedUser.email, token: token })

};

exports.signUp = signUp;
exports.login = login; 