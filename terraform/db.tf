resource "aws_db_instance" "moviepicker_database" {
    allocated_storage = 20
    max_allocated_storage = 1000
    engine = "postgres"
    engine_version = "17"
    instance_class = "db.t3.micro"

    db_name = "prod"
    username = local.database_username
    password = local.database_password
    parameter_group_name = "default.postgres17"
    skip_final_snapshot = true
    vpc_security_group_ids = [aws_security_group.moviepicker_database.id]
    publicly_accessible = true
    
    tags = {
        Name = "moviepicker_database"
    }
}

resource "aws_security_group" "moviepicker_database" {
    name       = "moviepicker_database"
    description = "Allow inbound Postgresql traffic"

    ingress {
        from_port = 5432
        to_port   = 5432
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port = 0
        to_port   = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
        ipv6_cidr_blocks = ["::/0"]
    }

    tags = {
        Name = "moviepicker_database"
    }
  
}