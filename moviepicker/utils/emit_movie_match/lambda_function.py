import json, boto3, os

# Emits a movie match event to an SNS topic
def lambda_handler(event, context):
    print("Received event:", event)
    session_id = event['session_id']
    movie_id = event['movie_id']

    sns = boto3.client('sns', region_name='us-east-1')

    topic_arn = f"arn:aws:sns:us-east-1:{os.environ['AWS_ACCOUNT_ID']}:match-topic"

    try:
        response = sns.publish(
            TopicArn=topic_arn,
            Message=json.dumps({
                'movie_id': movie_id,
                'session_id': session_id
            })
        )

        print("SNS publish response:", response, flush=True)
    except Exception as e:
        print("SNS publish failed:", str(e), flush=True)

    return {
        'statusCode': 200,
        'body': json.dumps('Message sent to session')
    }
