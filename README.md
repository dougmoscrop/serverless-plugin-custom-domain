# serverless-plugin-custom-domain

This is a plugin for Serverless that injects a [CloudFormation Custom Resource](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html) in your deployed stack that sets up a base path mapping between the `ApiGateway::Deployment` that Serverless creates, and an [API Gateway Custom Domain](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html).

## 3.0.0

This release brings in a new version of add-custom-resource that updates the runtime version of Lambda.  This means your custom resources may re-execute, and should be idempotent.  No actual changes in this library have been made, but this is just to be cautious.

## Upgrading from 1.x

A bug in 1.x caused an extra, unused LogGroup to be created, called `/aws/lambdaservice-stage-CustomBasePathMa--` instead of `/aws/lambda/service-stage-CustomBasePathMa--`. However, AWS automatically creates a LogGroup for your functions with the correct name. This means that any deployments using 1.x have two LogGroups. After upgrading to 2.x+, deployments *may* fail due to a CloudFormation error that "the log group already exists". Sorry about this! It doesn't always happen, but thankfully, the fix is pretty straightforward if it does and it should only happen the one time.

- **delete** the log group (it's the 'correctly' named one, e.g. `/aws/lambda/service-stage-CustomBasePathMa--`)
- redeploy!
- feel free to delete the other, incorrectly named log group, it was never used too

## Usage

```yaml

service: my-service

plugins:
  - serverless-plugin-custom-domain

custom:
  domain: "${opt:region}.myservice.foo.com"
```

## Advanced Usage

`custom.domain` can also be an object, with the following propeties:

- `name`: the domain name, same as the above string e.g. `${opt:region}.myservice.foo.com`
- `basePath:` a custom base path, instead of the default `(none)` - a base path is a prefix e.g. `/v1`

## Notes

### Why a Custom Resource?

CloudFormation supports `ApiGateway::BasePathMapping` resources but I found they frequently fail to update correctly. Implementing the (relatively simple) logic to get-and-update-or-create combined with a `remove` hook for cleanup has proven to be more reliable.

### Setting up the Custom Domain

These take a long time to provision and are long-lived persistent resources that have Route53 entires pointing at them as well as ACM certificates that have to be requested and approved. You should manage these outside of Serverless, either via CloudFormation or something like Terraform.
