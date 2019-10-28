const decoder = require('google-geo-decoder');
const dotenv = require('dotenv');

dotenv.config();
const key = process.env.GGKEY;
const [lat, lon] = [48.651774, 43.171773];

decoder(lat, lon, key)
  .then(data => console.log(data))
  .catch(err => console.log(err));
