function shallowCloneObject(obj) {
  const result = {};
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      result[k] = obj[k];
    }
  }
  return result;
}

export default shallowCloneObject;
