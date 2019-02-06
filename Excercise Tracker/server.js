var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

var fs = require('fs');
var dbFile = './.data/tracker.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE excercise_tracker (userid TEXT PRIMARY KEY, description TEXT, duration TEXT, date TEXT )');
    console.log('New table created!');
    // db.serialize(function() {
    //   db.run('INSERT INTO excercise_tracker (userid, description, duration, date) VALUES ("qwerty123", "Test descrpition", "45mins", "2019-02-05")');
    // });
  }
  else {
    db.each('SELECT * from excercise_tracker', function(err, row) {
      if ( row ) {
        // console.log('record:', row);
      }
    });
  }
});

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


app.post('/api/exercise/new-user', function(req, res) {
  var username = req.body.username;
  registerUser(req, res, username);
});

app.post('/api/exercise/add', function(req, res) {
  var excercise = {
    userid: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  }
  addxcercise(req, res, excercise)
});

app.get('/api/exercise/users', (req, res)=>{
  var query = 'SELECT userid from excercise_tracker';
  db.serialize(()=>{
    db.all(query, (err, rows)=>{
      if(err){
        console.error(err.message);
        res.setHeader("Content-type", "application/json");
        res.json({error: "No user found! consider regestring."});
      }
      else{
        res.setHeader("Content-type", "application/json");
        res.json(rows);
      }
    })  
  });
});

app.get('/api/exercise/log/:user', (req, res)=>{
  var query = 'SELECT * from excercise_tracker where userid = "' + req.params.user + '"';
  getUserExcercise(req, res, query)
});

function registerUser(req, res, username){
  db.serialize(()=>{
    db.get("SELECT userid from excercise_tracker where userid = '"+ username +"'", (err, row)=>{
      if(err){
        res.send("Some error occured!");
      }
      if(row){
        res.json("Username already registered, try another username");
      }
      else{
        db.serialize(()=>{
          var query = 'INSERT INTO excercise_tracker (userid) VALUES ("' + username + '")';
          db.run(query, (err)=>{
            if(err){
              console.error(err.message);
            }
            else{
              res.setHeader("Content-type", "application/json");
              res.json({username: username, userID: username});
            }
          });
        });        
      }
    });
  });
}

function addxcercise(req, res, excercise){
  db.serialize(()=>{
    db.get("SELECT * from excercise_tracker where userid = '"+ excercise.userid +"'", (err, row)=>{
      if(err){
        res.send("Some error occured!");
      }
      if(row){
        console.log(row);
        
        if(row.description == undefined)          excercise.description = req.body.description; 
        else          excercise.description = row.description + "|" + req.body.description;
        
        if(row.duration == undefined)          excercise.duration = req.body.duration + " mins";
        else          excercise.duration = row.duration + "|" + req.body.duration + " mins";
        
        if(row.date == undefined)          excercise.date = req.body.date;
        else          excercise.date = row.date + "|" + req.body.date;
      
        var query =  'UPDATE \
                      excercise_tracker\
                      SET\
                      description = "'+ excercise.description + '",\
                      duration = "'+ excercise.duration + '",\
                      date = "'+ excercise.date + '"\
                      WHERE userid = "' + excercise.userid + '"';      
        db.serialize(()=>{
          db.run(query, (err)=>{
            if(err){
              console.error(err.message);
            }
            else{
              res.setHeader("Content-type", "application/json");
              res.json(excercise);
            }
          });
        });  
      }
      else{
        res.json("User ID not found!");      
      }
    });
  });
}

function getUserExcercise(req, res, query){
  db.serialize(()=>{
    db.get(query, (err, row)=>{
      
      if(err) console.error(err.message);
      else{
        var data = {
          userid: row.userid,
          username: row.userid,
          excercise: []
        }
        var durationArr = row.duration.split("|");
        var descriptionArr = row.description.split("|");
        var dateArr = row.date.split("|");
        
        for(var i = 0; i<dateArr.length; i++){
          var ex = {
            description: descriptionArr[i],
            duration: durationArr[i],
            date : dateArr[i]
          }
          data.excercise.push(ex);
        }
        res.setHeader("Content-type", "application/json");
        res.json(data);
      }
    });
  });
}

var listener = app.listen(process.env.PORT, function() {
  // console.log('Your app is listening on port ' + listener.address().port);
});
