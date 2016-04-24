'use strict';

import axios from 'axios';
import queryString from 'query-string';
import averageSpeedChart from './avg-speed-chart';
import createAuthorizeStravaButton from './strava-button';

const appElem = document.getElementById('app');
const queryParams = queryString.parse(location.search);

const code = queryParams.code;
if(!code) {
  const stravaButton = createAuthorizeStravaButton();
  appElem.appendChild(stravaButton);
} else {
  axios.get('my-commutes', { params : { code } } ).then( response => {
    response.data.forEach(d => console.log(d.commuteActivities[0].average_speed));
    averageSpeedChart(response.data, '#graphs')
  },
    (err) =>
      console.log(err)
  )
}

console.log('done!!');
