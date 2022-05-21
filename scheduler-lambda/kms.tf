locals {
  account_id     = data.aws_caller_identity.current.account_id
}

data "aws_caller_identity" "current" {}


# Creates/manages KMS CMK
resource "aws_kms_key" "this" {
  description              = "instance-scheduler"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  is_enabled               = true
  policy = <<POLICY
  {
    "Id": "key-consolepolicy-3",
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Enable IAM User Permissions",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${local.account_id}:root"
            },
            "Action": "kms:*",
            "Resource": "*"
        },
        {
            "Sid": "Allow use of the key",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                "${aws_iam_role.lambda_role.arn}"
                ]
            },
            "Action": [
                "kms:Encrypt",
                "kms:Decrypt",
                "kms:ReEncrypt*",
                "kms:GenerateDataKey*",
                "kms:DescribeKey"
            ],
            "Resource": "*"
        },
        {
            "Sid": "Allow attachment of persistent resources",
            "Effect": "Allow",
            "Principal": {
               "AWS":  [
                "${aws_iam_role.lambda_role.arn}"
                ]
            },
            "Action": [
                "kms:CreateGrant",
                "kms:ListGrants",
                "kms:RevokeGrant"
            ],
            "Resource": "*",
            "Condition": {
                "Bool": {
                    "kms:GrantIsForAWSResource": "true"
                }
            }
        }
    ]
}

POLICY
}

# Add an alias to the key
resource "aws_kms_alias" "this" {
  name          = "alias/instance-scheduler"
  target_key_id = aws_kms_key.this.key_id
}


output "key_id" {
  description = "The globally unique identifier for the key"
  value       = aws_kms_key.this.id
}