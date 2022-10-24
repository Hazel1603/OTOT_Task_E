// todoModel.js

var mongoose = require('mongoose');

// Setup schema
var toDoSchema = mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        required: true
    },
});

// Export Todo model
var Todo = module.exports = mongoose.model('todo', toDoSchema);
module.exports.get = function (callback, limit) {
    Todo.find(callback).limit(limit);
}
