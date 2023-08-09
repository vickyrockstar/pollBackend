const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const pollController = require('../controllers/poll-controller');
const checkAuth = require('../middleware/check-auth');


router.get('/', pollController.getAllPoll)
router.patch('/', pollController.updatePoll)
router.get('/results', pollController.getResults);
router.use(checkAuth);

router.post('/', 
[check('question').not().isEmpty(), check('option1').not().isEmpty(), check('option2').not().isEmpty(),check('option3').not().isEmpty(),check('option4').not().isEmpty(),check('owner').not().isEmpty()], 
pollController.createPoll);

router.patch('/', pollController.updatePoll)
router.delete('/', pollController.deletePoll)


router.get('/', (req, res, next) => {
    console.log("Get request");
    res.json({ message: "It works!" })
})
module.exports = router;