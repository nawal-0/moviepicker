# ADR 009 - WebSocket for Realtime Communication
Date: 28-05-2025

## Status
Accepted

# Summary
We decided to use WebSockets to enable real-time communication between the frontend and AWS Lambda Function. This allows us to instantly push movie match results to all users in the same session.

## Context
A core feature of MoviePicker is real-time session updates. Users like/dislike movies and need to see when a movie has been matched across all users instantly. We have implemented an AWS Lambda Function 'SNS Listener' which receives info when a movie match has occurred. The problem for us is figuring out how to get that info to the frontend so a Movie Match notification can be displayed.
The requirements for this are:
-  Real-time updates (users need to get an update as soon as they like a movie)
-  Can integrate well with AWS Lambda
-  Scalable for multiple sessions and users
  
Other alternatives considered:
- Polling: Client regularly queries the Server for any updates. This is an inefficient method and there will be a delay for results to appear.

## Decision
We chose to use WebSocket connections, where each client maintains a persistent connection to the server. This solves our problem as it allows:
- AWS Lambda to send messages to the client using the websocket connection ids
- Integrates well with AWS Websocket API Gateway
- All of these resources can be managed with terraform

## Consequences
Positives
- Near instant updates for all users in a session
- More efficient than polling

Neutral
- Had to create an additional database table, 'websocketsessions', to store websocket connection ids and session ids.
  
Negatives
- More complex to implement
- Harder to debug
