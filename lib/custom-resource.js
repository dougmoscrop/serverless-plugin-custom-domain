'use strict';

const aws = require('aws-sdk');
const response = require('cfn-response');

exports.handler = function(event, context) {
  Promise.resolve()
    .then(() => {
      const apiGateway = new aws.APIGateway();

      const basePath = event.ResourceProperties.BasePath;
      const domainName = event.ResourceProperties.DomainName;
      const restApiId = event.ResourceProperties.RestApi;
      const stage = event.ResourceProperties.Stage;

      switch (event.RequestType) {
        case 'Create':
        case 'Update':
          return apiGateway.getBasePathMapping({
            basePath,
            domainName
          })
          .promise()
          .then(() => {
            return apiGateway.updateBasePathMapping({
              basePath,
              domainName,
              patchOperations: [{
                op: 'replace',
                path: '/restapiId',
                value: restApiId
              }, {
                op: 'replace',
                path: '/stage',
                value: stage
              }]
            })
            .promise()
            .then(() => 'updated')
          })
          .catch(e => {
            if (e.statusCode === 404 || e.code === 'NotFoundException') {
              return apiGateway.createBasePathMapping({
                basePath,
                domainName,
                restApiId,
                stage
              })
              .promise()
              .then(() => 'created');
            }
            throw e;
          });
        default:
          return Promise.resolve('no action matched')
      }
  })
  .then((msg) => {
    /* eslint-disable no-console */
    console.log('completed: ', msg);
    response.send(event, context, response.SUCCESS, {});
  })
  .catch(e => {
    /* eslint-disable no-console */
    console.log(e);
    response.send(event, context, response.FAILED, {});
  });
};
