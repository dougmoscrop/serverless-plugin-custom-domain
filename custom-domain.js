'use strict';

const addCustomResource = require('add-custom-resource');
const path = require('path');
const semver = require('semver');

const removeMapping = require('./lib/remove-mapping');
const utils = require('./lib/utils');

module.exports = class CustomDomain {

  constructor(serverless, options) {
    if (!semver.satisfies(serverless.version, '>= 1.13')) {
      throw new Error('serverless-plugin-custom-domain requires serverless 1.13 or higher!');
    }

    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');

    Object.assign(this,
      { addCustomResource },
      { removeMapping },
      utils
    );

    this.hooks = {
      'before:aws:package:finalize:mergeCustomProviderResources': this.beforePackage.bind(this),
      'before:remove:remove': this.beforeRemove.bind(this),
    };
  }

  beforePackage() {
    const domain = this.serverless.service.custom.domain;
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    if (domain) {
      const domainName = this.getDomainName(domain);
      const basePath = this.getBasePath(domain);
      const deploymentId = this.getApiGatewayDeploymentId();

      console.log('deployent', deploymentId);
      if (deploymentId) {
        const stage = this.getApiGatewayStage(deploymentId);
        const dependencies = ['ApiGatewayRestApi', deploymentId];

        console.log('stage', stage);
        if (stage.id) {
          dependencies.push(stage.id);
        }

        return addCustomResource(template, {
          name: 'ApiGatewayBasePathMapping',
          sourceCodePath: path.join(__dirname, 'lib/custom-resource.js'),
          resource: {
            properties: {
              DomainName: domainName,
              BasePath: basePath,
              Stage: stage.name,
              RestApi: {
                Ref: 'ApiGatewayRestApi'
              }
            },
            dependencies
          },
          role: {
            policies: [{
              PolicyName: 'apigateway-permissions',
              PolicyDocument: {
                Version: '2012-10-17',
                Statement: [{
                  Effect: 'Allow',
                  Action: ['apigateway:*'],
                  Resource: 'arn:aws:apigateway:*:*:*'
                }]
              }
            }]
          }
        });
      } else {
        throw new Error('Could not find AWS::ApiGateway::Deployment resource in CloudFormation template!');
      }
    }
  }

  beforeRemove() {
    const domain = this.serverless.service.custom.domain;

    if (domain) {
      const domainName = this.getDomainName(domain);
      const basePath = this.getBasePath(domain);

      return this.removeMapping(basePath, domainName);
    }
  }

};
