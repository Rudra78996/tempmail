import mongoose from "mongoose";

    const emailSchema = new mongoose.Schema({
        from : String,
        subject : String,
        text : String,
        html : String,
        receivedAt : Date
});

const inboxSchema = new mongoose.Schema({
    emailId : String,
    expiresAt : Date,
    emails : [emailSchema],
});

inboxSchema.index({expiresAt:1}, {expireAfterSeconds:0});

export default mongoose.model("Inbox", inboxSchema);