'use strict';

module.exports = function removeMapping(basePath, domainName) {
    if(!basePath){
    basePath = '(none)'
  }
  return this.provider.request('APIGateway', 'deleteBasePathMapping', {
      basePath: basePath,
      domainName
    })
    .promise()
    .catch(e => {
      if (e.statusCode === 404 || e.code === 'NotFoundException') {
        return Promise.resolve();
      }
      throw e;
    })
    .then(() => {
      this.log('Cleaned up BasePathMapping');
    });
};
