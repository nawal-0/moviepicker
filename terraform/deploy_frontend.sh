#!/bin/bash

set -e

# define variables
FRONTEND_DIR="../frontend"
BUILD_DIR="$FRONTEND_DIR/build"
BUCKET_NAME="moviepicker-frontend-480dac16"
AWS_CREDENTIALS_FILE="./credentials"
AWS_PROFILE_NAME="654654226779_CSSE6400-LabRole"


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

echo "Frontend deployed successfully to S3 bucket: http://moviepicker-frontend-480dac16.s3-website-us-east-1.amazonaws.com"





