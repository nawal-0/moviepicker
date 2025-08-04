import os, boto3, json

lambda_client = boto3.client('lambda', region_name='us-east-1')

def invoke_match_broadcast_lambda(session_id, movie_id):
    lambda_name = os.getenv("MATCH_LAMBDA_NAME")
    if not lambda_name:
        raise ValueError("Environment variable MATCH_LAMBDA_NAME is not set")

    payload = {
        "movie_id": movie_id,
        "session_id": session_id
    }
    lambda_client.invoke(
        FunctionName=lambda_name,
        InvocationType='Event',
        Payload=json.dumps(payload)
    )