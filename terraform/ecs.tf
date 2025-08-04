resource "aws_ecs_cluster" "moviepicker" {
    name = "moviepicker"
}

resource "aws_ecs_task_definition" "moviepicker" {
    family                   = "moviepicker"
    network_mode             = "awsvpc"
    requires_compatibilities = ["FARGATE"]
    cpu                      = "1024"
    memory                   = "2048"
    execution_role_arn       = data.aws_iam_role.lab.arn
    task_role_arn            = data.aws_iam_role.lab.arn

    container_definitions = jsonencode([
        {
            name         = "moviepicker"
            cpu          = 1024
            memory       = 2048
            image        = "${aws_ecr_repository.moviepicker.repository_url}:${local.version}"
            network_mode = "awsvpc"
            portMappings = [
                {
                    containerPort = 6400
                    hostPort      = 6400
                }
            ]
            environment = [
                {
                    name  = "SQLALCHEMY_DATABASE_URI"
                    value = "postgresql://${local.database_username}:${local.database_password}@${aws_db_instance.moviepicker_database.address}:${aws_db_instance.moviepicker_database.port}/${aws_db_instance.moviepicker_database.db_name}"
                },
                {
                    name  = "MATCH_LAMBDA_NAME"
                    value = "match_broadcast_lambda"
                }
            ]
            logConfiguration = {
                logDriver = "awslogs"
                options = {
                    "awslogs-group"         = "/moviepicker/prod"
                    "awslogs-region"        = "us-east-1"
                    "awslogs-stream-prefix" = "ecs"
                    "awslogs-create-group"  = "true"
                }
            }
        }
    ])

    depends_on = [
      docker_registry_image.moviepicker
    ]
}


resource "aws_ecs_service" "moviepicker" {
    name            = "moviepicker"
    cluster         = aws_ecs_cluster.moviepicker.id
    task_definition = aws_ecs_task_definition.moviepicker.arn
    desired_count   = 1
    launch_type     = "FARGATE"

    network_configuration {
        subnets          = data.aws_subnets.private.ids
        security_groups  = [aws_security_group.moviepicker.id]
        assign_public_ip = true
    }

    load_balancer {
        target_group_arn = aws_lb_target_group.moviepicker.arn
        container_name   = "moviepicker"
        container_port   = 6400
    }
}

resource "aws_security_group" "moviepicker" {
    name      = "moviepicker"
    description = "Moviepicker Security Group"

    ingress {
        from_port = 6400
        to_port   = 6400
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    egress {
        from_port = 0
        to_port   = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}
