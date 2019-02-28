//https://stackoverflow.com/questions/4224606/how-to-check-whether-a-script-is-running-under-node-js#comment92529277_35813135

const isNodejs = () => (
  typeof "process" !== "undefined"
  && process
  && process.versions
  && process.versions.node
);

module.exports = isNodejs;
