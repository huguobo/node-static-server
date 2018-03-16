const hasTrailingSlash = (string) =>{
  return /\/$/g.test(string);
}

module.exports = hasTrailingSlash;