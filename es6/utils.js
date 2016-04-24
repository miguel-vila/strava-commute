'use strict';

function applyPath(path,object) {
  let value = object;
  path.forEach( field => {
    value = value[field]
  });
  return value;
}

export default {
  applyPath
}
