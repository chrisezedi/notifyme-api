//import required modules
const express = require("express");
const router = express.Router();
const Channel = require("../models/channel");
const auth = require("../middlewares/auth");
const { uploads, dataUri } = require("../middlewares/multer");
const { cloudinary } = require("../middlewares/cloudinary-config");

//get channel categories
router.get("/categories",auth,async (req, res) => {
  try {
    const categories = Channel.channelCategories();
    res.status(200).send(categories);
  } catch (error) {
    res.status(500).send(error);
  }
});

//get channels
router.get("/", auth, async (req, res) => {
  const categories = req.query.cat;
  if(categories.length > 0){
	 try {
	    const channels = await Channel.find({
	      category: { $in: categories },
	    }).sort({ subscribercount: -1 });
	    res.status(200).json({ channels });
	  } catch (error) {
	    res.status(500).send(error);
	  }
  }else{
  	console.log("GET ALL CHANNELS")
  }
});

//get all user channels
router.get("/my-channels", auth, async (req, res) => {
  let userId = req.user.id;
  try {
    const channels = await Channel.find({ admin: userId });
    if (channels.length === 0) {
      return res.status(404).json({ msg: "You haven't created any channel yet" });
    }
    res.status(200).json({ success: true, channels });
  } catch (error) {
    res.status(500).json(error);
  }
});

//get specific channel
router.get("/:id", auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate(
      "admin",
      "firstname imgurl"
    );
    if (!channel) return res.status(404).send("channel not found");
    let subscribers = channel.subscribers;
    let payload;
    subscribers.includes(req.user.email) ? payload = {channel,isSubscribed:true} : payload = {channel,isSubscribed:false}
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Create channel
router.post("/", auth, async (req, res) => {
  try {
    //validate channel data
    const result = await Channel.validateChannel(req.body);
    const channel = new Channel(result);
    channel.admin = req.user.id;
    await channel.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ msg: error.details[0].message });
  }
});

//update channel
router.put("/:id", auth, async (req, res) => {
  try {
    const data = req.body;
    await Channel.findByIdAndUpdate(
      { _id: req.params.id, "admin._id": req.user.id },
      data,
      { new: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
});

//delete specific channel
router.delete("/:id", auth, async (req, res) => {
  try {
    await Channel.findByIdAndDelete({
      _id: req.params.id,
      "admin._id": req.user.id,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
});

//upload channel background
router.post("/upload/:id", auth, uploads.single("image"), async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (req.file) {
      const file = dataUri(req).content;
      return cloudinary.uploader
        .upload(file, {
          public_id: channel.public_id,
          invalidate: true,
        })
        .then((result) => {
          const image = result.secure_url;
          channel.public_id = result.public_id;
          channel.imgurl = result.secure_url;
          channel.save().then((event) => {
            res.status(200).json({ success: true, image });
          });
        })
        .catch((err) =>{
      res.status(500).json({ msg: "Something went wrong", err })
        }
        );
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

//export router
module.exports = router;
