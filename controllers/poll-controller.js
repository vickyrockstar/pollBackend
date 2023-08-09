const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const Poll = require('../models/poll');
const User = require('../models/user');
const mongoose = require('mongoose');
const poll = require('../models/poll');


const createPoll = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
       return  next (new HttpError("Invalid inputs passed", 422));
    }
    const { question, option1, option2, option3, option4, owner } = req.body;

    const createdpollObj = new Poll({
        question,
        option1: { content: option1, vote: [] },
        option2: { content: option2, vote: []},
        option3: { content: option3, vote: [] },
        option4: { content: option4, vote: [] },
        owner,
    });
    let user;
    try {
        user = await User.findById(owner);
    } catch (err) {
        return next(new HttpError("creating poll failed", 500))
    }
    if (!user) {
        return next(new HttpError("could not find User of given ID", 404))
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdpollObj.save({ session: sess });
        user.poll.push(createdpollObj);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError("Adding product failed", 500);
        return next(error);
    }
    res.status(201).json({ poll: createdpollObj })

}

const deletePoll = async(req, res, next) =>{
    const {deletePollId} = req.body;
    console.log("pollID",deletePollId)
    let pollToDelete;
    try{
    pollToDelete = await Poll.findById(deletePollId)
}catch(err){
    return next(new HttpError("error in findind item", 500));
}
if(!pollToDelete){
return next (new HttpError("couls not find pool in data"), 404)
}
try{
   await Poll.deleteOne({_id: pollToDelete})
}
catch(err){
    return next(new HttpError("could not delete item", 500));

}
res.json({deletedPoll: pollToDelete})
}
const getAllPoll = async (req, res, next) => {
    let allPoll;
    try {
        allPoll = await Poll.find({}).populate('owner');
    } catch (err) {
        return next(new HttpError("failed in getting data with populate", 500));
    }
    if (!allPoll) {
        return next(new HttpError("could not find any poll ", 404));
    }
    res.json({ allPolls: allPoll });

}
const updatePoll = async (req, res, next) => {
    const { votedPollId, voterId, optionContent } = req.body;
    let pollObject;
    try {
        pollObject = await Poll.findById(votedPollId)
    } catch (err) {
        return next(new HttpError("Error in finding poll", 500))
    }
    if (!pollObject) {
        return next(new HttpError("Poll with ID not found", 404))
    }
    if (voterId) {
        pollObject.option1.vote = pollObject.option1.vote.filter(item => item !== voterId.toString());
        pollObject.option2.vote = pollObject.option2.vote.filter(item => item !== voterId.toString());
        pollObject.option3.vote = pollObject.option3.vote.filter(item => item !== voterId.toString());
        pollObject.option4.vote = pollObject.option4.vote.filter(item => item !== voterId.toString());
    }
    if (optionContent === 1 && voterId) {

        pollObject.option1.vote = [...pollObject.option1.vote, voterId]
    }
    else if (optionContent === 2 && voterId) {

        pollObject.option2.vote = [...pollObject.option2.vote, voterId]
    }
    else if (optionContent === 3 && voterId) {

        pollObject.option3.vote = [...pollObject.option3.vote, voterId]
    }
    else if (optionContent === 4 && voterId) {

        pollObject.option4.vote = [...pollObject.option4.vote, voterId]
    }

    try {
        await pollObject.save();
    } catch (err) {
        return next(new HttpError("could not save Changes into Mongo", 500))
    }
    let pollList;
    try {
        pollList = await Poll.find({});

    } catch (err) {
        return next(new HttpError("error finding polls", 500))

    }
    if (!pollList) {
        return next(new HttpError("could not find poll ", 404))
    }
    res.json({ allPolls: pollList });

}
const getResults = async (req, res, next) => {
    let allPolls;
    try {
        allPolls = await Poll.find({});
    } catch (err) {
        return next(new HttpError("error in finding polls results", 500))
    }
    if (!allPolls) {
        return next(new HttpError("could not find polls", 404))

    }
    const votes = allPolls.map((item) => {
        return {
            'question': item.question,
            'pollId': item._id,
            'option1': {"content":item.option1.content, "voteCount": item.option1.vote.length},
            'option2': {"content":item.option2.content, "voteCount": item.option2.vote.length},
            'option3':  {"content":item.option3.content, "voteCount":item.option3.vote.length},
            'option4':  {"content":item.option4.content, "voteCount":item.option4.vote.length},
        }
    })
    
    res.json({ allId: votes })
    res.status(200)
}

exports.createPoll = createPoll;
exports.getAllPoll = getAllPoll;
exports.updatePoll = updatePoll;
exports.getResults = getResults;
exports.deletePoll = deletePoll;