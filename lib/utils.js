'use strict';

const path = require('path');
const fs = require('fs');

module.exports = {

  getApiGatewayDeploymentId() {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    return Object.keys(template.Resources).find(id => {
      return template.Resources[id].Type === 'AWS::ApiGateway::Deployment';
    });
  },

  getApiGatewayStageName() {
    let stageName = {};
    let stageNameStage, stageNameDeploy, keyStage, keyDeploy, keyDeployFromStage;

    const serviceTemplate = this.serverless.service.resources;
    if (serviceTemplate) {
      Object.keys(serviceTemplate.Resources).forEach(function(key){
        if (serviceTemplate.Resources[key]['Type'] == 'AWS::ApiGateway::Stage') {
          keyStage = key;
          stageNameStage = serviceTemplate.Resources[key].Properties.StageName;
          keyDeployFromStage = serviceTemplate.Resources[key].Properties.DeploymentId.Ref;
        }
      });
    }

    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    Object.keys(template.Resources).forEach(function(key){
      if (template.Resources[key]['Type'] == 'AWS::ApiGateway::Deployment') {
        keyDeploy = key;
        stageNameDeploy = template.Resources[key].Properties.StageName;
      }
      else if (template.Resources[key]['Type'] == 'AWS::ApiGateway::Stage') {
        if (typeof stageNameStage === 'undefined') {
          keyStage = key;
          stageNameStage = template.Resources[key].Properties.StageName;
          keyDeployFromStage = template.Resources[key].Properties.DeploymentId.Ref;
        }
      }
    });

    if (stageNameStage && keyDeployFromStage && keyDeployFromStage === keyDeploy) {
      stageName.value = stageNameStage;
      stageName.from = {
        type: 'AWS::ApiGateway::Stage',
        key: keyStage
      };
    } else {
      stageName.value = stageNameDeploy;
      stageName.from = {
        type: 'AWS::ApiGateway::Deployment',
        key: keyDeploy
      };
    }

    return stageName;
  },

  getSourceCodeLines(fileName) {
    const filePath = path.join(__dirname, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const sourceCode = fileContents.toString().replace(/[\r\n]/g, '\n');

    return sourceCode.split('\n');
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
