//import required modules
const express = require("express");
const router = express.Router();
const Channel = require("../models/channel");
const auth = require("../middlewares/auth");

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

//export router
module.exports = router;
