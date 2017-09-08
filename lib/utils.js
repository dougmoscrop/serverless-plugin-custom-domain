'use strict';

module.exports = {

  getApiGatewayDeploymentId() {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    return Object.keys(template.Resources).find(id => {
      return template.Resources[id].Type === 'AWS::ApiGateway::Deployment';
    });
  },

  getApiGatewayStage(deploymentId) {
    const service = this.serverless.service;
    const resources = service.resources;
    const template = service.provider.compiledCloudFormationTemplate;
    const deployment = template.Resources[deploymentId];

    const stage = {
      name: deployment.Properties.StageName
    };

    if (resources && resources.Resources) {
      Object.keys(resources.Resources).forEach(key => {
        const resource = resources.Resources[key];

        if (resource.Type === 'AWS::ApiGateway::Stage') {
          if (resource.Properties.DeploymentId.Ref === deploymentId) {
            stage.name = resource.Properties.StageName;
            stage.id = key;
          }
        }
      });
    }

    return stage;
  },

  log(msg) {
    this.serverless.cli.log(`[serverless-plugin-custom-domain]: ${msg}`);
  },

  getDomainName(domain) {
    if (typeof domain === 'string') {
      return domain;
    } else if (domain && domain.name && typeof domain.name === 'string') {
      return domain.name
    }

    throw new Error('custom.domain must either be a string or an object with a name property');
  },

  getBasePath(domain) {
    if (domain && domain.basePath && typeof domain.basePath === 'string') {
      return domain.basePath;
    }

    return '(none)';
  }

};
