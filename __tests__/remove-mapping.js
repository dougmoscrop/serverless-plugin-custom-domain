'use strict';

const test = require('ava');
const sinon = require('sinon');

const Plugin = require('..');

test.beforeEach(t => {
  t.context.provider = {
    request: Function.prototype
  };
  t.context.serverless = {
    version: '1.13.2',
    getProvider: () => t.context.provider,
    service: {
      provider: {
        compiledCloudFormationTemplate: t.context.template
      }
    }
  };
  t.context.plugin = new Plugin(t.context.serverless, {
    stage: 'test'
  });
  t.context.plugin.log = sinon.spy();
});

test('removeMapping calls remove', t => {
  const mock = sinon.mock(t.context.provider)

  mock.expects('request').returns(Promise.resolve());

  return t.context.plugin.removeMapping('(none)', 'foo.com')
    .then(() => {
      mock.verify();
      t.true(t.context.plugin.log.calledOnce);
    });
});
