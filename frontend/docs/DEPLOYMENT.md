# Novamind Digital Twin - AWS Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Novamind Digital Twin frontend to AWS using Amplify, our recommended solution for HIPAA-compliant, premium psychiatric applications.

## Deployment Strategy Summary

| Aspect | Recommendation |
|--------|---------------|
| **Primary Platform** | AWS Amplify |
| **CI/CD Integration** | GitHub Actions |
| **CDN** | CloudFront (built into Amplify) |
| **SSL/TLS** | AWS Certificate Manager |
| **Authentication** | AWS Cognito |
| **Runtime Environment** | Node.js 18+ |

## AWS Amplify Deployment

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured locally
- Node.js 18+ and npm 8+
- Git repository with frontend code

### Step 1: Install and Configure AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify with AWS credentials
amplify configure
```

During the configuration process:
- Specify your preferred AWS Region (e.g., us-east-1, us-west-2)
- Create or choose an IAM user with appropriate permissions
- Save the access key and secret key

### Step 2: Initialize Amplify in Your Project

Navigate to your project directory and initialize Amplify:

```bash
cd novamind-digitaltwin/frontend
amplify init
```

Follow the prompts:
- Enter a name for the project: `novamind-digitaltwin`
- Choose your default editor
- Choose the type of app: `javascript`
- Select the framework: `react`
- Select the source directory path: `src`
- Select the distribution directory path: `build`
- Select the build command: `npm run build`
- Select the start command: `npm start`
- Choose your AWS profile

### Step 3: Add Hosting with Amplify

```bash
amplify add hosting
```

Select the following options:
- Choose `Hosting with Amplify Console (Managed hosting with custom domains, CI/CD, etc.)`
- Choose `Continuous deployment (Git-based deployments)`

Follow the prompts to connect your repository.

### Step 4: Configure Environment Variables

In the Amplify Console, navigate to your app and set up environment variables:

1. Go to AWS Amplify Console
2. Select your app
3. Click on "Environment Variables"
4. Add the following variables:
   - `REACT_APP_API_URL` (Backend API URL)
   - `REACT_APP_COGNITO_USER_POOL_ID` (Cognito User Pool ID)
   - `REACT_APP_COGNITO_CLIENT_ID` (Cognito App Client ID)
   - `REACT_APP_STAGE` (e.g., prod, dev, staging)

### Step 5: Configure Amplify Build Settings

Create an `amplify.yml` file at the root of your project:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - $(npm config get cache)
```

### Step 6: Configure Custom Domain (Optional but Recommended)

1. In the Amplify Console, go to "Domain Management"
2. Click "Add Domain"
3. Enter your domain name (e.g., app.novamind.com)
4. Follow the instructions to verify domain ownership
5. Configure SSL/TLS certificate

### Step 7: Deploy Your Application

Commit and push to your repository:

```bash
git add .
git commit -m "Configure Amplify deployment"
git push origin main
```

Amplify will automatically build and deploy your application.

## GitHub Actions Workflow for Automated Deployment

Create `.github/workflows/amplify-deploy.yml`:

```yaml
name: Deploy to AWS Amplify

on:
  push:
    branches:
      - main  # Production deployment
      - develop  # Staging deployment

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Amplify CLI
        run: npm install -g @aws-amplify/cli
        
      - name: Configure Amplify
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: 'us-east-1'  # Update to your region
        run: |
          amplify configure --headless --provider aws \
            --accessKeyId $AWS_ACCESS_KEY_ID \
            --secretAccessKey $AWS_SECRET_ACCESS_KEY \
            --region $AWS_REGION
          
      - name: Deploy to Amplify
        run: amplify publish --yes
```

## Performance Optimization for AWS

### CloudFront CDN Settings

AWS Amplify automatically configures CloudFront. To optimize its settings:

1. In the AWS Management Console, navigate to CloudFront
2. Select the distribution created by Amplify
3. Edit the default cache behavior:
   - Set Time To Live (TTL):
     - Minimum TTL: 0 seconds
     - Default TTL: 86400 seconds (1 day)
     - Maximum TTL: 31536000 seconds (1 year)
   - Enable compression
   - Set Viewer Protocol Policy to "Redirect HTTP to HTTPS"
   - Forward Headers: None (improves cache hit ratio)
   - Query String Forwarding: None (unless needed)

### S3 Cache Control Headers

Configure proper cache control headers for your assets:

```typescript
// In your build script or as part of your GitHub workflow
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Set long cache time for static assets
const staticAssetParams = {
  Bucket: 'your-amplify-bucket',
  Prefix: 'static/',
  CacheControl: 'public, max-age=31536000'
};

// Set short cache time for HTML files
const htmlParams = {
  Bucket: 'your-amplify-bucket',
  Prefix: '',
  CacheControl: 'public, max-age=0, must-revalidate'
};

// Update the cache control headers
s3.setBucketCors(params).promise();
```

## Security Configuration for HIPAA Compliance

### 1. Enable WAF (Web Application Firewall)

1. In AWS console, navigate to WAF & Shield
2. Create or use an existing Web ACL
3. Add the following rules:
   - AWS Managed Rules for common vulnerabilities
   - Rate-based rule to prevent DDoS
   - IP-based restrictions for admin access
4. Associate the Web ACL with your CloudFront distribution

### 2. Configure Security Headers

Create a Lambda@Edge function to add security headers:

```javascript
exports.handler = (event, context, callback) => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  // Set security headers
  headers['strict-transport-security'] = [{
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubdomains; preload'
  }];
  
  headers['content-security-policy'] = [{
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self'; object-src 'none'; upgrade-insecure-requests;"
  }];
  
  headers['x-content-type-options'] = [{
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }];
  
  headers['x-frame-options'] = [{
    key: 'X-Frame-Options',
    value: 'DENY'
  }];
  
  headers['x-xss-protection'] = [{
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }];
  
  headers['referrer-policy'] = [{
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }];

  callback(null, response);
};
```

### 3. Configure AWS Cognito for Authentication

```bash
# Add Authentication to your Amplify project
amplify add auth

# Choose manual configuration
# Enable advanced security features
# Configure MFA as required (recommended for HIPAA)
# Configure password policy to meet HIPAA standards
```

### 4. Enable CloudTrail for Auditing

1. In AWS Console, navigate to CloudTrail
2. Create a new trail:
   - Name: `novamind-audit-trail`
   - Apply to all regions: Yes
   - Log all event types
   - Create a new S3 bucket for logs
   - Enable log file validation
   - Enable CloudWatch Logs integration

## Monitoring and Maintenance

### CloudWatch Alarms Setup

Create alarms to monitor your application:

```bash
# Install AWS CDK
npm install -g aws-cdk

# Create a CDK app for your alarms
mkdir -p infrastructure/monitoring
cd infrastructure/monitoring
cdk init app --language typescript

# Implement CloudWatch alarms
```

Example CDK code for alarms:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';

export class MonitoringStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an SNS topic for alerts
    const alertTopic = new sns.Topic(this, 'NovamindAlertTopic', {
      displayName: 'Novamind Alerts'
    });

    // Create a 5xx error rate alarm
    new cloudwatch.Alarm(this, 'ErrorRateAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: '5xxErrorRate',
        dimensionsMap: {
          DistributionId: 'YOUR_DISTRIBUTION_ID'
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(1)
      }),
      evaluationPeriods: 5,
      threshold: 5,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'Alarm when 5xx error rate exceeds 5%',
      alarmName: 'NovamindErrorRateAlarm',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      actionsEnabled: true,
      alarmActions: [alertTopic.topicArn]
    });
  }
}
```

### Setup a Health Check Lambda Function

Create a Lambda function to periodically check your application's health:

```javascript
const AWS = require('aws-sdk');
const https = require('https');
const sns = new AWS.SNS();

exports.handler = async (event) => {
  const endpoint = 'https://app.novamind.com/';
  const topicArn = 'YOUR_SNS_TOPIC_ARN';
  
  try {
    const healthStatus = await checkEndpoint(endpoint);
    
    if (!healthStatus.healthy) {
      await sendAlert(topicArn, `Novamind Digital Twin is unhealthy: ${healthStatus.status}`);
      return { statusCode: 500, body: 'Health check failed' };
    }
    
    return { statusCode: 200, body: 'Health check successful' };
  } catch (error) {
    await sendAlert(topicArn, `Health check error: ${error.message}`);
    return { statusCode: 500, body: error.message };
  }
};

function checkEndpoint(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ healthy: true, status: res.statusCode });
      } else {
        resolve({ healthy: false, status: res.statusCode });
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function sendAlert(topicArn, message) {
  const params = {
    TopicArn: topicArn,
    Subject: 'Novamind Health Alert',
    Message: message
  };
  
  return sns.publish(params).promise();
}
```

## Cost Optimization Strategies

### 1. Set Up AWS Budgets

1. In AWS Console, navigate to Budgets
2. Create a new budget:
   - Name: `Novamind-Frontend-Budget`
   - Period: Monthly
   - Start: First day of the current month
   - Budget amount: Your maximum budget
   - Alert threshold: 80%
   - Email recipients: Your team's emails

### 2. Use Resource Tags for Cost Tracking

Tag all resources with appropriate labels:

```typescript
// In your infrastructure as code
const amplifyApp = new amplify.App(this, 'NovamindApp', {
  // ...configuration
  tags: {
    Environment: 'Production',
    Project: 'Novamind',
    Component: 'Frontend',
    Team: 'WebDevelopment'
  }
});
```

### 3. Enable Lifecycle Policies for S3 Backups

Create lifecycle policies for S3 buckets storing backups or logs:

```yaml
Rules:
  - ID: TransitionToInfrequentAccess
    Status: Enabled
    Prefix: logs/
    Transitions:
      - Days: 30
        StorageClass: STANDARD_IA
  - ID: ExpireOldLogs
    Status: Enabled
    Prefix: logs/
    Expiration:
      Days: 365
```

## Disaster Recovery Plan

### 1. Configure Cross-Region Replication for Critical Assets

Set up cross-region replication for S3 buckets:

```yaml
ReplicationConfiguration:
  Role: arn:aws:iam::123456789012:role/replication-role
  Rules:
    - Status: Enabled
      Destination:
        Bucket: arn:aws:s3:::destination-bucket
        StorageClass: STANDARD
```

### 2. Automated Backups

Create a Lambda function to automatically back up your Amplify configuration:

```javascript
const AWS = require('aws-sdk');
const amplify = new AWS.Amplify();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const appId = 'YOUR_AMPLIFY_APP_ID';
  const backupBucket = 'novamind-backups';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // Get Amplify app configuration
    const appData = await amplify.getApp({ appId }).promise();
    
    // Store in S3
    await s3.putObject({
      Bucket: backupBucket,
      Key: `amplify-backups/${timestamp}-amplify-config.json`,
      Body: JSON.stringify(appData),
      ContentType: 'application/json'
    }).promise();
    
    return { statusCode: 200, body: 'Backup successful' };
  } catch (error) {
    console.error('Backup failed:', error);
    return { statusCode: 500, body: error.message };
  }
};
```

## Conclusion

This deployment guide provides a comprehensive blueprint for deploying the Novamind Digital Twin frontend to AWS using Amplify. This implementation ensures a secure, scalable, and HIPAA-compliant solution that delivers a premium experience for concierge psychiatry practices.

For questions or support, contact the Novamind DevOps team.