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
      const bpData = JSON.parse(str).items;

      const indexedPaths = bpData.reduce((acc, cur) => { acc[cur.id] = cur; return acc;}, {});
      const ids = Object.keys(indexedPaths);
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        const segment = indexedPaths[id];
        if (segment) {
          const lastPoint = segment.geometry.coordinates[0][segment.geometry.coordinates[0].length - 1];
          const segmentWithStartingFirstPoint = Object.values(indexedPaths)
            .filter((x) =>
            !!x &&
            x.network === segment.network &&
            x.geometry.coordinates[0][0][0] === lastPoint[0] &&
            x.geometry.coordinates[0][0][1] === lastPoint[1])[0];
          if (segmentWithStartingFirstPoint) {
            segmentWithStartingFirstPoint.geometry.coordinates[0]
            segmentWithStartingFirstPoint.geometry.coordinates[0] = [
              ...segment.geometry.coordinates[0],
              ...segmentWithStartingFirstPoint.geometry.coordinates[0]
            ];
            indexedPaths[segment.id] = undefined;
          }
        }
      }

      const filteredData = Object.values(indexedPaths).filter((x) => !!x).map((x) => ({
        geometry: x.geometry,
        id: x.id,
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
