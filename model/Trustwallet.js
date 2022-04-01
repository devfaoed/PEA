const mongoose = require("mongoose");

const trustSchema = new mongoose.Schema({
    name: String,
    wallet: String,
    date: {
        type: Date,
        default: Date.now
    },
})

const Trustwallet = mongoose.model("Secret", trustSchema);

module.exports =  Trustwallet;