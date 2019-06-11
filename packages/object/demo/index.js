const {remap} = require('../');

const source = { origin: { lat:1, lng:2 } };
const mapping = { 'origin.lat': 'lat', 'origin.lng': 'lng' };
// const options = { defaultCopy: true }; // not implemented yet

result = remap(source, mapping);

console.log(result);
// { lat: 1, lng: 2 }
