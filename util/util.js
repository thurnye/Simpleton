const request = require('request');
const fs = require('fs');


function base64_encode(image) {
    // read binary data
    var bitmap = fs.readFileSync(image);
    // convert binary data to base64 encoded string
    return bitmap.toString('base64');
  }