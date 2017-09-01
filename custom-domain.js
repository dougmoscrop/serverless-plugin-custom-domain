'use strict';

const semver = require('semver');

const addCustomResource = require('./lib/add-custom-resource');
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

    if (domain) {
      const domainName = this.getDomainName(domain);
      const basePath = this.getBasePath(domain);
      const deploymentId = this.getApiGatewayDeploymentId();
      const stageName = this.getApiGatewayStageName();

      if (deploymentId) {
        this.addCustomResource(domainName, basePath, deploymentId, stageName);
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
