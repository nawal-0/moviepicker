#!/bin/bash

set -e

echo "Starting Terraform deployment..."
terraform init
terraform apply -auto-approve
echo "Terraform deployment completed successfully."

# Get URLs
API_URL=$(cat api.txt)
WEBSOCKET_URL=$(cat websocket.txt)
FRONTEND_URL=$(cat frontend_url.txt)

# Update .env.production file
ENV_FILE="../frontend/.env.production"
echo "Updating .env.production file..."
echo "REACT_APP_API_URL=$API_URL" > "$ENV_FILE"
echo "REACT_APP_WEBSOCKET_URL=$WEBSOCKET_URL" >> "$ENV_FILE"
echo "REACT_APP_GOOGLE_CLIENT_ID=830212927991-cfehdl4njfqn1n7oami8uiln507ju0bk.apps.googleusercontent.com" >> "$ENV_FILE"



# define variables for frontend deployment
FRONTEND_DIR="../frontend"
BUILD_DIR="$FRONTEND_DIR/build"
AWS_CREDENTIALS_FILE="./credentials"
AWS_PROFILE_NAME="654654226779_CSSE6400-LabRole"

DOMAIN=${FRONTEND_URL#http://}
BUCKET_NAME=${DOMAIN%%.s3*}


# build the frontend
echo "Building React App..."
cd "$FRONTEND_DIR"
export NODE_ENV=production
npm install
npm run build
cd -

# upload the build to S3
echo "Uploading build to S3..."
export AWS_SHARED_CREDENTIALS_FILE="${AWS_CREDENTIALS_FILE}"
export AWS_PROFILE="${AWS_PROFILE_NAME}" 
aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME/"

echo -e "\nFrontend deployed at: $FRONTEND_URL"
