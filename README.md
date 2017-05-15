# serverless-plugin-custom-domain

This is a plugin for Serverless that injects a [CloudFormation Custom Resource](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html) in your deployed stack that sets up a base path mapping between the `ApiGateway::Deployment` that Serverless creates, and an [API Gateway Custom Domain](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html).

## Usage

```yaml

service: my-service

plugins:
  - serverless-plugin-custom-domain

custom:
  domain: "${opt:region}.myservice.foo.com"
```

## Notes

### Why a Custom Resource?

CloudFormation supports `ApiGateway::BasePathMapping` resources but I found they frequently fail to update correctly. Implementing the (relatively simple) logic to get-and-update-or-create combined with a `remove` hook for cleanup has proven to be more reliable.

### Setting up the Custom Domain

These take a long time to provision and are long-lived persistent resources that have Route53 entires pointing at them as well as ACM certificates that have to be requested and approved. You should manage these outside of Serverless, either via CloudFormation or something like Terraform.
