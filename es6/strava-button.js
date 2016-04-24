'use strict';

const client_id = "2957";
const redirect_uri = "http://localhost:5000";
const response_type = "code";
const authUrl = `https://www.strava.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}`;

function createAuthorizeStravaButton() {
  const stravaButton = document.createElement('a');
  stravaButton.href = authUrl;
  const imageElement = document.createElement('img');
  imageElement.src = 'img/strava.png';
  stravaButton.appendChild(imageElement);
  return stravaButton;
}

export default createAuthorizeStravaButton;
