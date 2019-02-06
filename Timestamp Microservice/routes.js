var express = require('express');

const router = express.Router();

router.route('/timestamp')
.all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        next();
    })
.get(function(request, response) {

    var date = new Date();
    console.log("Date not given");
    response.json({"unix": date.getTime(), "utc" : date.toUTCString() });

});

router.route('/timestamp/:date_string?')
.get( function(request, response) {

    var date = new Date(request.params.date_string);
    if(date != "Invalid Date")  response.json({"unix": date.getTime(), "utc" : date.toUTCString() });
  
    else{

        response.json({"error" : "Invalid Date" });
    }
});

module.exports = router;