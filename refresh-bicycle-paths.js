require('dotenv').config();
const https = require('https');
const fs = require('fs-extra');
const path = require('path');

const BICYCLE_PATHS_DATA = 'src/data/bicycle-paths.json';

const downloadBicyclePaths = () => {
  fs.ensureDirSync(path.dirname(BICYCLE_PATHS_DATA));
  const file = fs.createWriteStream(BICYCLE_PATHS_DATA, { flags: 'w' });
  https.get(`${process.env.REACT_APP_API_URL}/api/v1/bicycle-paths?&limit=6000`, (response) => {
    response.pipe(file);
  });
};

try {
  fs.accessSync(BICYCLE_PATHS_DATA)
  if (process.argv.includes('--force')) {
    throw new Error();
  }
} catch (error) {
  downloadBicyclePaths();
}
