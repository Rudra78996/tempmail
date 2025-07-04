import express from "express";
import Inbox from "../models/Inbox.js";

const router  = express.Router();

router.post("/receive", async (req, res)=>{
    const emailId = req.body.recipient?.split("@")[0];
    const inbox = await Inbox.findOne({emailId});
    if(!inbox || new Date() > inbox.expiresAt) {
        console.log("Expired or invalid inbox: ", emailId);
        return res.status(406).send("Inbox expired");
    }
    inbox.emails.push({
        from : req.body.sender,
        subject:req.body.subject,
        text: req.body["body-plain"],
        html: req.body["body-html"],
        receivedAt: new Date(),
    });
    await inbox.save();
    res.status(200).send("Email stored");
});

export default router