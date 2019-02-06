var express = require('express');
var app = express();

app.use(express.static('public'));


app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
  //console.log(request);
});

app.get('/api/whoami', (req, res)=>{
  var xfwd = req.headers['x-forwarded-for'].split(',');
  var ip = xfwd[0];
  
  
  var id = {"ipaddress": ip,
            "language": req.headers['accept-language'],
            "software": req.headers['user-agent']};
  res.json(id);
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
