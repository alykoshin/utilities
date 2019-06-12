const {remap} = require('../');

const source = {
  origin: {
    lat: 1,
    lng: 2,
  }
};

const mapping = {
  'origin.lat': 'lat',
  'origin.lng': 'lng',
};

result = remap(source, mapping);

console.log(result);
// { lat: 1, lng: 2 }

const mappingInverted = {
  'lat': 'origin.lat',
  'lng': 'origin.lng',
};
result = remap(source, mappingInverted, { inverted: true });

console.log(result);
// { lat: 1, lng: 2 }
