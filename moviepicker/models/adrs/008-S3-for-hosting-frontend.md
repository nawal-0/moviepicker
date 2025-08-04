# ADR 008 - S3 for Hosting Frontend 
Date: 21-05-2025

## Status
Accepted

# Summary
Decision was made to use AWS S3 Bucket to deploy the MoviePicker frontend. This was because S3 is easy to setup and allows us to have a lightweight and scalable frontend.

## Context
Our frontend is a simple static React Web App. Our requirements for the hosting tool are: 
-  Scalable for varying amounts of users (quality attribute)
-  Easy to integrate with our backend hosted on ECS and AWS Lambda
-  Cost-effective for a static app

## Decision
AWS S3 was chosen to host our frontend. It supports static website hosting with minimal configuration needed. We considered other options such as EC2, but found that they were overkill for a simple app like ours, which has few web pages. S3 is autoscaling, it does not require any autoscaling policies to be written. This makes our deployment simple and easier, allowing to focus more on the backend features.

## Consequences
Positives
- Auto-scaling
- High availability and high performance
- Easy to setup in terraform
- Once build files uploaded, changes are available instantly

Negatives
- Deployment is a bit more manual - terraform can't upload the build files. It needs to be done on CLI ```aws s3 sync...```
- env variables have to be set during run-time

## Next Steps
The next steps are to create the deploy script to make deploying the frontend as we develop easier. It needs to (1) set the env variables, (2) build the React app and (3) upload build files to s3.