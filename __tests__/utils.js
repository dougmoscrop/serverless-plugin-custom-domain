'use strict';

const test = require('ava');

const Plugin = require('..');

test.beforeEach(t => {
  t.context.template = {
    Resources: {}
  };
  t.context.resources = {
    Resources: {}
  };
  t.context.serverless = {
    version: '1.13.2',
    getProvider: () => null,
    service: {
      provider: {
        compiledCloudFormationTemplate: t.context.template
      },
      resources: t.context.resources
    }
  };
  t.context.plugin = new Plugin(t.context.serverless, {
    stage: 'test'
  });
});

test('finds deployment id', t => {
  const id = 'ApiGatewayDeployment12345';

  t.context.template.Resources[id] = {
    Type: 'AWS::ApiGateway::Deployment',
  };

  t.true(id === t.context.plugin.getApiGatewayDeploymentId());
});

test('finds stage name from deployment', t => {
  const stageName = {
    value: 'dev',
    from: {
      type: 'AWS::ApiGateway::Deployment',
      key: 'ApiGatewayDeployment12345'
    }
  };

  t.context.template.Resources['ApiGatewayDeployment12345'] = {
    Type: 'AWS::ApiGateway::Deployment',
    Properties: {
      StageName: 'dev'
    }
  };

  const realStageName = t.context.plugin.getApiGatewayStageName();
  t.true(stageName.value === realStageName.value);
  t.true(stageName.from.type === realStageName.from.type);
  t.true(stageName.from.key === realStageName.from.key);
});

test('finds stage name from stage', t => {
  const stageName = {
    value: 'attributes_dev',
    from: {
      type: 'AWS::ApiGateway::Stage',
      key: 'ApiGatewayStage'
    }
  };

  t.context.template.Resources['ApiGatewayDeployment12345'] = {
    Type: 'AWS::ApiGateway::Deployment',
    Properties: {
      StageName: 'dev'
    }
  };

  t.context.resources.Resources['ApiGatewayStage'] = {
    Type: 'AWS::ApiGateway::Stage',
    Properties: {
      StageName: 'attributes_dev',
      DeploymentId: {
        Ref: 'ApiGatewayDeployment12345'
      }
    }
  };

  const realStageName = t.context.plugin.getApiGatewayStageName();
  t.true(stageName.value === realStageName.value);
  t.true(stageName.from.type === realStageName.from.type);
  t.true(stageName.from.key === realStageName.from.key);
});

test('getDomainName string', t => {
  t.true('foo' === t.context.plugin.getDomainName('foo'));
});

test('getDomainName object', t => {
  t.true('bar' === t.context.plugin.getDomainName({ name: 'bar' }));
});

test('getBasePath set', t => {
  t.true('baz' === t.context.plugin.getBasePath({ basePath: 'baz' }));
});

test('getBasePath undefined', t => {
  t.true('(none)' === t.context.plugin.getBasePath({}));
});

test('getBasePath emptry string', t => {
  t.true('(none)' === t.context.plugin.getBasePath({ basePath: '' }));
});
