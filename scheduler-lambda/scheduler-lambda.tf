provider "aws" {
  region = "eu-west-1"
}
resource "aws_iam_role" "lambda_role" {
name   = "instance_scheduler_daily_role"
assume_role_policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": "sts:AssumeRole",
     "Principal": {
       "Service": "lambda.amazonaws.com"
     },
     "Effect": "Allow",
     "Sid": ""
   }
 ]
}
EOF
}
resource "aws_iam_policy" "iam_policy_for_lambda" {
 
 name         = "aws_iam_policy_for_terraform_aws_lambda_role"
 path         = "/"
 description  = "AWS IAM Policy for managing aws lambda role"
 policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "dynamodb:Scan",
                "dynamodb:Query",
                "logs:PutLogEvents"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/instance-scheduler/index/*",
                "arn:aws:dynamodb:*:*:table/instance-scheduler",
                "arn:aws:logs:*:*:log-group:/aws/lambda/instance-scheduler-daily:*"
            ]
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        },
        {
            "Sid": "VisualEditor2",
            "Effect": "Allow",
            "Action": "logs:CreateLogGroup",
            "Resource": "*"
        }
    ]
}
EOF
}
 
resource "aws_iam_role_policy_attachment" "attach_iam_policy_to_iam_role" {
 role        = aws_iam_role.lambda_role.name
 policy_arn  = aws_iam_policy.iam_policy_for_lambda.arn
}
 
data "archive_file" "zip_the_python_code" {
type        = "zip"
source_dir  = "${path.module}/app/"
output_path = "${path.module}/tmp/scheduler-lambda.zip"
}
 
resource "aws_lambda_function" "scheduler-lambda" {
filename                       = "${path.module}/tmp/scheduler-lambda.zip"
function_name                  = "instance-scheduler-daily"
role                           = aws_iam_role.lambda_role.arn
handler                        = "app.lambda_handler"
runtime                        = "python3.8"
depends_on                     = [aws_iam_role_policy_attachment.attach_iam_policy_to_iam_role]
source_code_hash               = data.archive_file.zip_the_python_code.output_base64sha256
environment {
    variables = {
      "SOURCE_EMAIL" = "noreply@gozeit.com"
      "REGION_NAME"  = "eu-west-1"
      "TABLE_NAME"   = "instance-scheduler"
      "DYNAMODB_INDEX_NAME" = "dtime-index"
      "DYNAMODB_KEY_ATTR" = "dtime"
      "KMS_KEY_ID" = aws_kms_key.this.id
    }
  }
}

resource "aws_cloudwatch_event_rule" "every_hour" {
    name = "every-hour"
    description = "Fires every hour"
    schedule_expression = "rate(1 hour)"
}

resource "aws_cloudwatch_event_target" "check_scheduler_lambda_every_hour" {
    rule = aws_cloudwatch_event_rule.every_hour.name
    target_id = "scheduler_lambda"
    arn = aws_lambda_function.scheduler-lambda.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_check_scheduler_lambda" {
    statement_id = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.scheduler-lambda.function_name
    principal = "events.amazonaws.com"
    source_arn = aws_cloudwatch_event_rule.every_hour.arn
}