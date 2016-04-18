'use strict';

const fs         = require('fs');
const express    = require('express');
const strava     = require('strava-v3');
const promisify  = require("es6-promisify");
const bodyParser = require('body-parser');
const q          = require('q');
const lazy       = require('lazy.js');
const moment     = require('moment');

const getToken             = promisify(strava.oauth.getToken);
const getAthleteActivities = (access_token) => {
  let deferred = q.defer();
  strava.athlete.listActivities({access_token, per_page: 15}, (error, activities) => {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(activities);
    }
  });
  return deferred.promise;
}

const normalizeActivity = (activity) => {
  let start_date = moment.parseZone(activity.start_date_local);
  let end_date = start_date.add( activity.elapsed_time, 'seconds' );
  let date = start_date.format('DD/MM/YYYY');
  let normalized = {
    id: activity.id,
    distance: activity.distance,
    moving_time: activity.moving_time,
    start_date,
    end_date,
    date,
    start: activity.start_latlng,
    end: activity.end_latlng,
    achievement_count: activity.achievement_count,
    average_speed: activity.average_speed,
    max_speed: activity.max_speed,
    average_watts: activity.average_watts,
    kilojoules: activity.kilojoules
  };
  return normalized;
}

const getCommutes = (activities) =>
  lazy(activities)
  .filter( (activity) => activity.commute )
  .map(normalizeActivity)
  .groupBy('date')
  .filter( (activities) => activities.length === 2 ) // filtrar 2 actividades por día
  /*
  .map( (activities) => {
    console.log('activities = ', activities);
    return activities.sort( (a1,a2) => {
      let duration = moment.duration(a1.start_date.diff(a2.start_date));
      let h = duration.asHours();
      console.log('diff = ',h)
      return h
    })
  })
  */
  .toArray()

const getAthleteAndActivities = (auth_code) =>
  getToken(auth_code).then( (response) =>
    getAthleteActivities(response.access_token).then( (activities) =>
      ({ activities , athlete : response.athlete })
    )
 )

var app = express();
app.use(bodyParser.json());

app.get('/my-commutes', (req, res) => {
  var code = req.query && req.query.code;
  if(!code) {
    res.status(404)
       .json({ msg: 'Must send query parameter "code"' })
  } else {
    getAthleteAndActivities( code ).then( (response) => {
      console.log(getCommutes(response.activities));
//      console.log(response.athlete);
    }, (err) => console.log(err));
    res.json({ok:true});
  }
});

app.get('/', (req, res) => {
  var path = __dirname + '/index.html';
  var stat = fs.statSync(path);
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=0');
  res.setHeader('Content-Length', stat.size);
  var stream = fs.createReadStream(path);
  stream.pipe(res);
});

app.use('/dist', express.static(__dirname + '/dist'));
app.use('/img', express.static(__dirname + '/img'));

var port = process.env.PORT || 5000;
app.listen(port, () => console.log("Listening on " + port) );
