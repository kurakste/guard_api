const decoder = require('google-geo-decoder');
const dotenv = require('dotenv');

dotenv.config();
const key = process.env.GGKEY;
// const [lat, lon] = [69.355930, 88.187606];
// const [lat, lon] = [48.720762, 44.508472];
const [lat, lon] = [48.651774, 43.171773];

decoder(lat, lon, key)
  .then(data => console.log(data))
  .catch(err => console.log(err));
