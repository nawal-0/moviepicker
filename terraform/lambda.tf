resource "aws_lambda_function" "match_broadcast" {
  function_name = "match_broadcast_lambda"
  role          = data.aws_iam_role.lambda.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  filename      = "lambda_function_payload.zip"

  source_code_hash = filebase64sha256("lambda_function_payload.zip")

environment {
  variables = {
    AWS_ACCOUNT_ID = "804756348571" 
    MATCH_LAMBDA_NAME = "match_broadcast_lambda"
  }
}
}

resource "aws_sns_topic" "match_session" {
  name = "match-topic"
}

resource "aws_lambda_function" "sns_listener" {
  filename         = "lambda-listener.zip"
  function_name    = "sns-listener"
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.11"
  role             = data.aws_iam_role.lambda.arn
  source_code_hash = filebase64sha256("lambda-listener.zip")

  environment {
    variables = {
      APIGATEWAY_ENDPOINT = aws_apigatewayv2_api.websocket_api.api_endpoint
      API_BASE_URL = "http://${aws_lb.moviepicker.dns_name}/api/v1"
    }
  }
}

resource "aws_sns_topic_subscription" "lambda_sub" {
  topic_arn = aws_sns_topic.match_session.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.sns_listener.arn
}

resource "aws_lambda_permission" "allow_sns_invoke_listener" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sns_listener.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.match_session.arn
}

resource "aws_apigatewayv2_api" "websocket_api" {
  name                       = "moviepicker_ws_api"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_lambda_function" "on_connect" {
  function_name = "moviepicker_ws_connect"
  filename = "connect_handler.zip"
  handler  = "lambda_function.lambda_handler"
  runtime  = "python3.11"
  role     = data.aws_iam_role.lambda.arn

  source_code_hash = filebase64sha256("connect_handler.zip")

  environment {
    variables = {
      DB_HOST = aws_db_instance.moviepicker_database.address
      DB_NAME = aws_db_instance.moviepicker_database.db_name
      DB_USER = local.database_username
      DB_PASSWORD = local.database_password
      DB_PORT = aws_db_instance.moviepicker_database.port
      APIGATEWAY_ENDPOINT = aws_apigatewayv2_api.websocket_api.api_endpoint
    }
  }
}

resource "aws_apigatewayv2_integration" "connect_integration" {
  api_id           = aws_apigatewayv2_api.websocket_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.on_connect.invoke_arn
}

resource "aws_apigatewayv2_route" "connect_route" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$connect"    
  target    = "integrations/${aws_apigatewayv2_integration.connect_integration.id}"
}

resource "aws_lambda_permission" "allow_apigw_connect" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.on_connect.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket_api.execution_arn}/*/*"
}


resource "aws_apigatewayv2_stage" "ws_stage" {
  api_id      = aws_apigatewayv2_api.websocket_api.id
  name        = "prod"
  auto_deploy = true
}

resource "local_file" "websocket_url" {
  content  = "${aws_apigatewayv2_api.websocket_api.api_endpoint}/prod"
  filename = "websocket.txt"
}

