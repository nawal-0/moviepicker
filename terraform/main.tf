terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "~> 5.0"
        }
        docker = {
            source = "kreuzwerker/docker"
            version = "3.0.2"
        }
    }

    backend "s3" {
        bucket         = "moviepicker-terraform-state"
        key            = "terraform.tfstate"
        region         = "us-east-1"
      
    }
}

provider "aws" {
    region = "us-east-1"
    default_tags {
        tags = {
            Name         = "MoviePicker"
            Automation   = "Terraform"
        }
    }
}

locals {
    database_username = "administrator"
    database_password = "mypassword"
    version = "v1.0.2" // changing this will trigger a new image build

}

# define data sources for existing resources
data "aws_iam_role" "ecs" {
    name = "ecs_role"
}

data "aws_iam_role" "lambda" {
    name = "lambda-role"
}

data "aws_vpc" "default" {
    default = true
}

data "aws_subnets" "private" {
    filter {
        name = "vpc-id"
        values = [data.aws_vpc.default.id]
    }
}

data "aws_ecr_authorization_token" "ecr_token" {}

# set up docker, push image to ECR
provider "docker" {
    registry_auth {
        address = data.aws_ecr_authorization_token.ecr_token.proxy_endpoint
        username = data.aws_ecr_authorization_token.ecr_token.user_name
        password = data.aws_ecr_authorization_token.ecr_token.password
    }
}

resource "aws_ecr_repository" "moviepicker" {
    name = "moviepicker"
}

resource "docker_image" "moviepicker" {
    name = "${aws_ecr_repository.moviepicker.repository_url}:${local.version}"
    build {
        context = "../."
    }
}

resource "docker_registry_image" "moviepicker" {
    name = docker_image.moviepicker.name
}