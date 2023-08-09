const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator')
const pollSchema = new Schema({
    question: { type: String, required: true },
    option1: {
        content: { type: String, required: true },
        vote: { type: Array, default: []}
    },
    option2: {
        content: { type: String, required: true },
        vote: { type: Array, default: []}
    },
    option3: {
        content: { type: String, required: true },
        vote: { type: Array,default: [] }
    },
    option4: {
        content: { type: String, required: true },
        vote: { type: Array,default: [] }
    },
    owner: { type: mongoose.Types.ObjectId, required: true, ref: "User" }


})
pollSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Pollitem', pollSchema);