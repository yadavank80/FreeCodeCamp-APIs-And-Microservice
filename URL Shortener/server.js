var express = require('express');
var bodyParser = require('body-parser');
var dns = require('dns');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlit.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

var table = "CREATE TABLE Short_URL_Table (IPAdd TEXT PRIMARY KEY, DOMAIN TEXT, Short_URL TEXT UNIQUE)";

db.serialize(function(){
  if (!exists) {
    db.run(table);
    console.log('New table Short_URL_Table created!');
  }
  else {
    console.log('Table exists');
    db.each('SELECT * from Short_URL_Table', function(err, row) {
      if(err){
          console.log("Error Occured");
      }
      else if ( row ) {
          console.log('record:', row);
      }
    });
  }
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/shorturl/new', function(req, res) {
  
  var count = 0;
  var url = req.body.url;

  dns.lookup(url, (err, address, family)=>{
    
    if(err){
      //Invalid URL entered.
      res.setHeader("Content-type", "application/json");
      res.send(JSON.stringify({error:"invalid URL"}));
    }
    else{
         db.get('SELECT MAX(Short_URL) from Short_URL_Table', function(err, row) {
          if(err){
              res.setHeader("Content-type", "application/json");
              res.send(JSON.stringify({error:"Database error!"}));
          }
          else if (row) {
            count = parseInt(row['MAX(Short_URL)']) + 1;
            if(!count) count = 1;
            var query = 'INSERT INTO Short_URL_Table (IPAdd, DOMAIN, Short_URL) VALUES ("' + address + '", "' + url + '", "' + count + '")'           
            //Insert new url.
            db.serialize(function() {
              db.run(query, function(err){
                if(err){
                  console.log("INSERTION ERROR");
                  console.log(err.message);
                }
                else{
                  console.log("INSERTED");
                }
              });
            });
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify({original_url: url, short_url: count}));      
          }    
        }); 
      } 
  });//End dns.lookup()
});

app.get('/api/shorturl/:shortenurl', (req, res)=>{

  var query = 'SELECT DOMAIN from Short_URL_Table WHERE Short_URL="' + req.params.shortenurl +'"';
  console.log(query);
  db.serialize(()=>{
    db.get(query, (err, row)=>{
      if(err){
        console.log(err.message);
      }
      else{
        var redURL = 'http://' + row["DOMAIN"];
        res.redirect(301, redURL);
      }

    });
  });
});

var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
