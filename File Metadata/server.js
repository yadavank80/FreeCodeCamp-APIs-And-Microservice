var express = require('express');
var multer = require('multer');

var app = express();
var router = express.Router();

app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './myfile')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

var uploader = multer({ storage: storage });

app.get('/upload', (req, res, next) => {
  res.statusCode = 200;
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write( "<h1 style='font-family: \"Benton Sans\", \"Helvetica Neue\", helvetica, arial, sans-serif;'>Ah! GET request no supported</h1><br>\
              <h2 style='font-family: \"Benton Sans\", \"Helvetica Neue\", helvetica, arial, sans-serif;'>Use homepage of API to upload a file and see its metadata.</h2>");
});

app.post('/upload', uploader.single('myfile'), (req, res, next) => {
  
  console.log(req.file);
  
  res.statusCode = 200;
  res.setHeader("Content-type", "application/json");
  res.json({
    "name": req.file.originalname,
    "type": req.file.mimetype,
    "size": req.file.size  });
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
