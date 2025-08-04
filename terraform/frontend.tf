
resource "random_id" "frontend_id" {
    byte_length = 4
}

resource "aws_s3_bucket" "frontend_bucket" {
    bucket = "moviepicker-frontend-480dac16"
    force_destroy = true

}

resource "aws_s3_bucket_website_configuration" "frontend_website" {
    bucket = aws_s3_bucket.frontend_bucket.id

    index_document {
        suffix = "index.html"
    }

    error_document {
        key = "index.html"
    }
}

resource "aws_s3_bucket_public_access_block" "frontend_access" {
    bucket                  = aws_s3_bucket.frontend_bucket.id
    block_public_acls       = false
    block_public_policy     = false
    ignore_public_acls      = false
    restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public_policy" {
    bucket = aws_s3_bucket.frontend_bucket.id

    policy = jsonencode({
        Version = "2012-10-17",
        Statement = [{
            Sid       = "PublicReadGetObject",
            Effect    = "Allow",
            Principal = "*",
            Action    = "s3:GetObject",
            Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
        }]
    })
}

resource "local_file" "frontend_url" {
    content  = "http://${aws_s3_bucket.frontend_bucket.bucket}.s3-website-us-east-1.amazonaws.com"
    filename = "frontend_url.txt"
}