import axios from 'axios';

const client_id = "2957";
const redirect_uri = "http://localhost:5000";
const response_type = "code";

const stravaButton = document.getElementById('strava-button');
const authUrl = `https://www.strava.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}`;
stravaButton.href = authUrl;
/*
axios.get('http://jsonplaceholder.typicode.com/posts').then(function (resp) {
  console.log(resp)
});
*/

console.log('done!!');
