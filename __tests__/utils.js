'use strict';

const test = require('ava');

const Plugin = require('..');

test.beforeEach(t => {
  t.context.template = {
    Resources: {}
  };
  t.context.serverless = {
    version: '1.13.2',
    getProvider: () => null,
    service: {
      provider: {
        compiledCloudFormationTemplate: t.context.template
      }
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
