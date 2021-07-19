//import required modules
const express = require("express");
const router = express.Router();
const Channel = require("../models/channel");

//get channel categories
router.get("/categories", auth, async (req, res) => {
  try {
    const categories = Channel.channelCategories();
    res.status(200).send(categories);
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});

//export router
module.exports = router;
