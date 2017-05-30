'use strict';

const escapeJson = require('escape-json-node');

module.exports = function addCustomResource(domainName, basePath ,deploymentId) {
  if(!basePath){
    basePath = '(none)'
  }
  const sourceCodeLines = this.getSourceCodeLines('custom-resource.js');

  const stage = this.options.stage;

  this.template = this.serverless.service.provider.compiledCloudFormationTemplate;

  this.template.Resources.CustomApiGatewayBasePathMappingFunction = {
    Type: 'AWS::Lambda::Function',
    Properties: {
      Runtime: 'nodejs6.10',
      Timeout: 60,
      Handler: 'index.handler',
      Role: {
        'Fn::GetAtt': [
          'CustomApiGatewayBasePathMappingRole',
          'Arn'
        ]
      },
      Code: {
        ZipFile: {
          'Fn::Join': [' ',
            sourceCodeLines.map(line => escapeJson(line))
          ]
        }
      },
    },
    DependsOn: [
      'CustomApiGatewayBasePathMappingRole'
    ]
  };

  this.template.Resources.CustomApiGatewayBasePathMappingLogGroup = {
    Type: 'AWS::Logs::LogGroup',
    Properties: {
      LogGroupName: {
        'Fn::Join': ['', [
            '/aws/lambda',
            { Ref: 'CustomApiGatewayBasePathMappingFunction' }
          ]
        ]
      }
    },
    DependsOn: []
  };

  this.template.Resources.CustomApiGatewayBasePathMapping = {
    Type: 'Custom::ApiGatewayBasePathMapping',
    Properties: {
      ServiceToken: {
        'Fn::GetAtt': ['CustomApiGatewayBasePathMappingFunction', 'Arn']
      },
      BasePath: basePath,
      DomainName: domainName,
      Stage: stage,
      RestApi: {
        Ref: 'ApiGatewayRestApi'
      }
    },
    DependsOn: [
      'ApiGatewayRestApi',
      'CustomApiGatewayBasePathMappingFunction',
      deploymentId
    ]
  };

  this.template.Resources.CustomApiGatewayBasePathMappingRole = {
    Type: 'AWS::IAM::Role',
    Properties: {
      AssumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com'
          },
          Action: 'sts:AssumeRole'
        }]
      },
      Policies: [{
        PolicyName: 'apigateway-permissions',
        PolicyDocument: {
          Version: '2012-10-17',
          Statement: [{
            Effect: 'Allow',
            Action: ['apigateway:*'],
            Resource: 'arn:aws:apigateway:*:*:*'
          }]
        }
      }, {
        PolicyName: 'logs-permissions',
        PolicyDocument: {
          Version: '2012-10-17',
          Statement: [{
            Effect: 'Allow',
            Action: [
              'logs:*'
            ],
            Resource: 'arn:aws:logs:*:*:*'
          }]
        }
      }],
      Path: '/',
      RoleName: {
        'Fn::Join': [
          '-', [
            this.serverless.service.service,
            this.options.stage,
            this.options.region
          ]
        ]
      }
    }
  };
};
