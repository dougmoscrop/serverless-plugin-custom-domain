'use strict';

const test = require('ava');
const sinon = require('sinon');

const Plugin = require('..');

test.beforeEach(t => {
  t.context.template = {
    Resources: {}
  };
  t.context.serverless = {
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

test('addCustomResource adds resources', t => {
  const getSourceCodeLines = sinon.stub(t.context.plugin, 'getSourceCodeLines').returns(['foo']);

  t.context.plugin.addCustomResource();

  t.true(getSourceCodeLines.called);
  t.deepEqual(Object.keys(t.context.template.Resources), [
    'CustomApiGatewayBasePathMappingFunction',
    'CustomApiGatewayBasePathMappingLogGroup',
    'CustomApiGatewayBasePathMapping',
    'CustomApiGatewayBasePathMappingRole'
  ]);
});
