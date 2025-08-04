import os
import psycopg2
import json
import boto3
import psycopg2

def lambda_handler(event, context):
    connect_id = event["requestContext"]["connectionId"]
    session_id = event["queryStringParameters"]["sessionId"] 

    if not connect_id or not session_id:
        return {
            'statusCode': 400,
            'body': json.dumps('Missing connectionId or sessionId')
        }
    print(f"Received connectionId: {connect_id}, sessionId: {session_id}")

    try:
        # Connect to Postgres
        conn = psycopg2.connect(
            host=os.environ['DB_HOST'],
            dbname=os.environ['DB_NAME'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            port=os.environ.get('DB_PORT', 5432)  
        )
        cur = conn.cursor()

        insert_query = """
            INSERT INTO websocketsession (session_id, socket_id)
            VALUES (%s, %s);
        """
        cur.execute(insert_query, (session_id, connect_id))

        conn.commit()
        cur.close()
        conn.close()

        print(f"Connection info stored: session_id={session_id}, socket_id={connect_id}")


        return {
            'statusCode': 200,
            'body': json.dumps('Connection info stored successfully')
        }

    except Exception as e:
        print("Database connection failed:", e)
        return {
            'statusCode': 500,
            'body': json.dumps('Database error')
        }
