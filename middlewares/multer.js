const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const uploads  = multer({storage});

const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();
  
const dataUri = (req)=>{
    return parser.format(path.extname(req.file.originalname).toString(), req.file.buffer);
};

module.exports = {uploads,dataUri};