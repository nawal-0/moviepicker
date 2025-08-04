# ADR 010 - Lambda Functions & SNS Messaging
Date: 22-08-2025

## Status
Accepted

## Summary
To manage the real-time event handling, we chose to use AWS Lambda functions in conjunction with SNS topics to manage the communication between users in the same session ID.

## Context
The main functionality of MoviePicker is sending movie match events to all users in the same session ID. To do this, we need some way to be able to:
- Send a movie match event containing the movie ID and session ID
- Have devices listening for incoming movie match events
- Extract the movie ID and find the corresponding movie data from TMDb

There are a range of different ways this could be done in AWS, such as:
- Eventbridge
- Lambda + SNS
- Lambda + SQS
- S3 Events

Of these, Megan as prior experience using Lambda, so we are leaning towards using this.

## Decision
We chose to use two lambda functions and one SNS topic. The first lambda function is triggered when the number of users who have liked a movie exceeds the specified threshold. This will then send a message via SNS to AWS. Then, when the message has been sent, this will trigger the second Lambda which will listen for the message and send the movie details to the front-end to be displayed.

## Consequences
Advantages
- Lambda and SNS works very well for a decoupled system, which is what this is
- Serverless: Lambda and SNS can be fully managed on AWS, we simply need to initialise the components using Terraform
- Allows for real-time event handling and being able to display movie matches as soon as they occur

Disadvantages
- Although we have some experience with Lambda, we may need to dedicate more time to fully understand how to integrate the SNS into Lambda as we have never done this before 