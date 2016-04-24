'use strict';

const fs         = require('fs');
const express    = require('express');
const strava     = require('strava-v3');
const promisify  = require("es6-promisify");
const bodyParser = require('body-parser');
const q          = require('q');
const lazy       = require('lazy.js');
const moment     = require('moment');

const dateFormat = 'DD/MM/YYYY';

function compareMoments(a,b) {
	return a - b;
}

const getToken             = promisify(strava.oauth.getToken);
const getAthleteActivities = (access_token) => {
  let deferred = q.defer();
  strava.athlete.listActivities({access_token, per_page: 200}, (error, activities) => {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(activities);
    }
  });
  return deferred.promise;
}

const toKmPerHour = mtPerSecond => 3.6 * mtPerSecond

const normalizeActivity = (activity) => {
  let start_date = moment.parseZone(activity.start_date_local);
  let end_date = start_date.add( activity.elapsed_time, 'seconds' );
  let date = start_date.format( dateFormat );
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
    average_speed: toKmPerHour( activity.average_speed ),
    max_speed: toKmPerHour( activity.max_speed ),
    average_watts: activity.average_watts,
    kilojoules: activity.kilojoules
  };
  return normalized;
}

const getCommutes = (activities) =>
  lazy(activities)
	.filter( activity => activity.commute )
  .map(normalizeActivity)
  .groupBy('date')
  .filter( activities => activities.length === 2 ) // filtrar 2 actividades por día
  .sort( (t1,t2) => {
    let d1 = t1[0];
    let d2 = t2[0];
    let m1 = moment(d1, dateFormat);
    let m2 = moment(d2, dateFormat);
    return compareMoments(m1,m2);
  }, false)
  .toArray()
  .map( t => {
    let date = t[0];
    let commuteActivities = t[1].sort( (a1,a2) => compareMoments(a1.start_date, a2.start_date) );
    return {date, commuteActivities};
  })

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
      let activities = getCommutes(response.activities);
      res.json(activities);
    }).catch( (err) => {
      console.log(err); res.json(err)
    });
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
app.use('/css', express.static(__dirname + '/css'));

var port = process.env.PORT || 5000;
app.listen(port, () => console.log("Listening on " + port) );
