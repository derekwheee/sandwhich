var request = require('request');
var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');

require('dotenv').load();

var app = express();

var hbs = exphbs.create({
    defaultLayout: '_layout',
    layoutsDir: 'dist/views/shared/',
    partialsDir: 'dist/views/shared/partials/',
    extname: '.hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/static'));

app.get('/', function (req, res) {
    res.render('home', { title: 'What\'s For Lunch?', controller: 'home' });
});

app.get('/which', function (req, res) {

    var params = {
        latitude : req.query.latitude,
        longitude : req.query.longitude,
        radius : req.query.radius || 200
    };

    var postData = {
        'api_key' : process.env.LOCU_API_KEY,
        'fields' : [ 'name', 'location', 'contact', 'menus' ],
        'venue_queries' : [
            {
                'location' : {
                    'geo' : {
                        '$in_lat_lng_radius' : [params.latitude, params.longitude, params.radius]
                    }
                }
            }
        ]
    };

    request.post({url:'https://api.locu.com/v2/venue/search', form: JSON.stringify(postData)}, function(err, httpResponse, body){
        res.send(body);
    });


});

app.listen(app.get('port'));
