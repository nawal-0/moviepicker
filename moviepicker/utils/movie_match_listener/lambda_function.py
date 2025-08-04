import json, urllib.request, boto3, os


# Triggered when a SNS message is published to the topic
def lambda_handler(event, context):
    API_BASE_URL = os.environ.get('API_BASE_URL')
    for record in event['Records']:
        sns_message = record['Sns']['Message']
        print(f"Raw SNS message: {sns_message}")
        
        try:
            message_dict = json.loads(sns_message)
            print(f"Parsed SNS message: {message_dict}")
            
            movie_id = message_dict.get('movie_id')
            session_id = message_dict.get('session_id')

            if not movie_id or not session_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Missing movie_id or session_id'})}

            api_url = f"{API_BASE_URL}/movies/{movie_id}"
            print(f"Requesting movie from API: {api_url}")

            with urllib.request.urlopen(api_url) as response:
                api_response = response.read().decode("utf-8")
                print(f"API response: {api_response}")

            # get connection ids
            api_conn_url = f"{API_BASE_URL}/websocket/session/{session_id}"
            print(f"Requesting connection ids from API: {api_conn_url}")

            with urllib.request.urlopen(api_conn_url) as response:
                conn_response = response.read().decode("utf-8")
                print(f"API response: {conn_response}")
            
            # Send the movie data to the connected clients
            endpoint = os.environ.get('APIGATEWAY_ENDPOINT').replace('wss://', 'https://')
            apigateway = boto3.client('apigatewaymanagementapi', endpoint_url=f'{endpoint}/prod')

            connection_ids = json.loads(conn_response)
            for connection_id in connection_ids:
                try:
                    print(f"Sending movie data to connection {connection_id}")
                    apigateway.post_to_connection(
                        ConnectionId=connection_id,
                        Data=api_response.encode('utf-8')
                    )
                except Exception as e:
                    print(f"Failed to send message to connection {connection_id}: {e}")
                    # Optionally, handle the case where sending a message fails
            
            return {'statusCode': 200, 'body': api_response}

        except json.JSONDecodeError:
            print("Failed to decode SNS message:", sns_message)
            return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid JSON in SNS message'})}
        
        except Exception as e:
            print(f"Unhandled error: {str(e)}")
            return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
