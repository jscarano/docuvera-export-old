# CDK Three Tier Serverless

Sample application demonstrating a three-tier web application using serverless, React and AWS CDK V2.

## Useful commands

 * `npm i`            install dependencies
 * `npm t`            run tests
 * `npm run deploy`   deploy to your credentialed account
 * `npx cdk destroy`  clean up when you're done


### Create a certificate
    openssl req -x509 -newkey rsa:2048 -sha256 -days 720 -keyout docuvera-export.key -out docuvera-export.crt -subj "/CN=joe-tech.net"

### Convert a pfx file into pem.
    .\openssl pkcs12 -in .\scarano-sample.pfx -out .\scarano-sample.pem