import express from "express";
import Inbox from "../models/Inbox.js";
import crypto from "crypto";

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

function generateRandomId(length=6) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}

router.post("/create-inbox", async (req, res) => {
  const emailId = generateRandomId();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Inbox.create({ emailId, expiresAt, emails: [] });
  res.json({ address: `${emailId}@mg.tempmail.today` });
});

export default router