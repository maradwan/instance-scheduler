import boto3
from os import environ as env

source_email = env.get("SOURCE_EMAIL")
region_name  = env.get("REGION_NAME")

def message_body_deleted_account(email):
    return """Hello!

We deleted your account {} as requested.

Thank you.

Best Regards,
Instance Scheduler Service""".format(email)

def notification(to_addresses, msg, subj,source_email=source_email):
    email_client = boto3.client('ses',region_name= region_name, verify=True)
    return email_client.send_email(
        Destination={
            'ToAddresses': [to_addresses],
            },
            Message={
                'Body': {
                    'Text': {
                        'Charset': 'UTF-8',
                        'Data': msg,
                        },
                        },
                        'Subject': {
                            'Charset': 'UTF-8',
                            'Data': subj,
                            },
                            },
                            Source=source_email,
    )