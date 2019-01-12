require('dotenv').config();
const https = require('https');
const fs = require('fs-extra');
const path = require('path');

const BICYCLE_PATHS_DATA = 'src/data/bicycle-paths.json';

const downloadBicyclePaths = () => {
  fs.ensureDirSync(path.dirname(BICYCLE_PATHS_DATA));
  https.get(`https://s3.ca-central-1.amazonaws.com/amavm-vdh-dev-assets/bicycle-paths.json`, (response) => {
    let str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function () {
      fs.writeFileSync(BICYCLE_PATHS_DATA, str, { flags: 'w' });
    });
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
