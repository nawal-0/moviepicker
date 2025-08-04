resource "aws_lb" "moviepicker" {
    name               = "moviepicker"
    internal           = false
    load_balancer_type = "application"
    security_groups    = [aws_security_group.moviepicker_lb.id]
    subnets            = data.aws_subnets.private.ids
}

resource "aws_security_group" "moviepicker_lb" {
    name     = "moviepicker_lb"
    description = "Moviepicker Load Balancer Security Group"

    ingress {
        from_port = 80
        to_port   = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port = 0
        to_port   = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name = "moviepicker_lb_security_group"
    }
}

resource "aws_lb_listener" "moviepicker" {
    load_balancer_arn = aws_lb.moviepicker.arn
    port              = 80
    protocol          = "HTTP"

    default_action {
        type = "forward"
        target_group_arn = aws_lb_target_group.moviepicker.arn
    }
}

resource "aws_lb_target_group" "moviepicker" {
    name     = "moviepicker"
    port     = 6400
    protocol = "HTTP"
    vpc_id   = aws_security_group.moviepicker.vpc_id
    target_type = "ip"

    health_check {
        path                = "/api/v1/health"
        port                = "6400"
        protocol            = "HTTP"
        interval            = 10
        timeout             = 5
        healthy_threshold   = 2
        unhealthy_threshold = 2
    }
}

# write the URL to a file
resource "local_file" "url" {
    content  = "http://${aws_lb.moviepicker.dns_name}/api/v1"
    filename = "./api.txt"
}