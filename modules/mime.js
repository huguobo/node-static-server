const path = require('path');

const mimeTypes = {
  "txt": "text/plain",
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": 'image/x-icon',
  "jepg": 'image/jepg',
  "png": 'image/png',
}

const lookup = (pathName) => {
  let ext = path.extname(pathName);
  ext = ext.split('.').pop();
  return mimeTypes[ext] || mimeTypes['txt']
}

module.exports = { lookup };