import express from "express";
import Inbox from "../models/Inbox.js";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";
export let io;

export function setSocketIO(socketInstance) {
    io = socketInstance;
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 4, 
    standardHeaders: 'draft-8', 
    legacyHeaders: false, 
});

const router  = express.Router();

router.post("/receive", async (req, res)=>{
    const emailId = req.body.recipient?.split("@")[0];
    const inbox = await Inbox.findOne({emailId});
    if(!inbox || new Date() > inbox.expiresAt) {
        console.log("Expired or invalid inbox: ", emailId);
        return res.status(406).send("Inbox expired");
    }
    const emailContent = {
        from : req.body.sender  || "",
        subject:req.body.subject || "",
        text: req.body["body-plain"] || "",
        html: req.body["body-html"] || "",
        receivedAt: new Date(),
    }
    inbox.emails.push(emailContent);
    await inbox.save();
    const latestEmail = inbox.emails.at(-1);
    io?.to(emailId).emit("new_email", {
        email: latestEmail,
    });
    res.status(200).send("Email stored");
});

router.post("/inbox", async (req, res) => {
    const { email } = req.body;
    if(!email) return res.json({success : false});
    const emailId = email.split("@")[0];
    try {
        const inbox = await Inbox.findOne({emailId});
        if(!inbox) return res.json({success : false});
        // console.log(inbox.reverse());
        return res.json({success: true, data : inbox});
    } catch(err) {
        return res.json({success: false});
    }
});

router.post("/isValid", async (req, res)=> {
    const { email } = req.body;
    if(!email) return res.json({isValid : false});
    const emailId = email.split("@")[0];
    if(!emailId) return res.json({isValid : false});
    const inbox = await Inbox.findOne({emailId});
    if(!inbox || new Date() > inbox.expiresAt) {
        return res.json({isValid:false});
    }
    return res.json({isValid:true});
});

function generateRandomId(length=6) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}


router.post("/create-inbox", limiter , async (req, res) => {
  const emailId = generateRandomId();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Inbox.create({ emailId, expiresAt, emails: [] });
  res.json({ address: `${emailId}@mg.tempmails.today` });
});

export default router