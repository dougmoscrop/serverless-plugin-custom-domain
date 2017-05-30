'use strict';

const addCustomResource = require('./lib/add-custom-resource');
const removeMapping = require('./lib/remove-mapping');
const utils = require('./lib/utils');

module.exports = class CustomDomain {

  constructor(serverless, options) {
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
    const custom = this.serverless.service.custom;

    if (custom && custom.domain && custom.domain.url) {
      const domainName = this.getDomainName(custom.domain.url);
      const basePath = this.getBasePath(custom.domain.basePath);

      if (domainName) {
        const deploymentId = this.getApiGatewayDeploymentId();

        if (deploymentId) {
          this.addCustomResource(domainName, basePath,deploymentId);
        } else {
          throw new Error('Could not find AWS::ApiGateway::Deployment resource in CloudFormation template!');
        }
      } else {
        throw new Error('custom.domain must either be a string or an object with a name property');
      }
    }
  }

  beforeRemove() {
    const domain = this.serverless.service.custom.domain;
    if (domain) {
      const domainName = this.getDomainName(domain.url);
      const basePath = this.getBasePath(domain.basePath);
      if (domainName) {
        return this.removeMapping(basePath, domainName);
      }
    }
  }

};
