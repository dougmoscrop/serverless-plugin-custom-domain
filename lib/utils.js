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
    } else {
      return domain.name
    }
  },

  getBasePath(basePath){
    if(typeof basePath === 'string'){
      return basePath;
    }
    else{
      return basePath.name;
    }
  }

};
