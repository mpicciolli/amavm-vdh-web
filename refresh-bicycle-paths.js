require('dotenv').config();
const https = require('https');
const fs = require('fs-extra');
const path = require('path');

const BICYCLE_PATHS_DATA = 'src/data/bicycle-paths.json';

const downloadBicyclePaths = () => {
  fs.ensureDirSync(path.dirname(BICYCLE_PATHS_DATA));
  https.get(`${process.env.REACT_APP_API_URL}/api/v1/bicycle-paths?&limit=10000`, (response) => {
    let str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function () {
      const bpData = JSON.parse(str);
      const filteredData = bpData.items.map((x) => ({
        geometry: x.geometry,
        network: x.network,
      }));
      fs.writeFileSync(BICYCLE_PATHS_DATA, JSON.stringify(filteredData), { flags: 'w' });
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
