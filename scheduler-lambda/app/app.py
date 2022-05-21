import datetime 
import boto3
import base64
import requests
from os import environ as env

from boto3.dynamodb.conditions import Key

source_email =  env.get("SOURCE_EMAIL")
region_name = env.get("REGION_NAME")
table_name = env.get("TABLE_NAME")

index_name1 = env.get("DYNAMODB_INDEX_NAME")
key1 = env.get("DYNAMODB_KEY_ATTR")
kms_key_id = env.get("KMS_KEY_ID")

query_table = boto3.resource("dynamodb").Table(table_name)
email_client = boto3.client('ses',region_name= region_name)


def action_start(region,access_key,secret_access,instanceID):
    ec2 = boto3.client('ec2', region_name=region, aws_access_key_id=access_key, aws_secret_access_key=secret_access)
    return ec2.start_instances(InstanceIds=[instanceID])
    
def action_stop(region,access_key,secret_access,instanceID):
    ec2 = boto3.client('ec2', region_name=region, aws_access_key_id=access_key, aws_secret_access_key=secret_access)
    return ec2.stop_instances(InstanceIds=[instanceID])

def get_ec2(index,key,date):
    return query_table.query(
        IndexName=index,KeyConditionExpression=Key(
            key).eq(date),)

def rds_action_start(region,access_key,secret_access,instanceID):
    rds = boto3.client('rds', region_name=region, aws_access_key_id=access_key, aws_secret_access_key=secret_access)
    return rds.start_db_instance(DBInstanceIdentifier=instanceID)

def rds_action_stop(region,access_key,secret_access,instanceID):
    rds = boto3.client('rds', region_name=region, aws_access_key_id=access_key, aws_secret_access_key=secret_access)
    return rds.stop_db_instance(DBInstanceIdentifier=instanceID)
    
def get_today():
    week_days=["mon","tue","wed","thu","fri","sat","sun"] 
    week_num=datetime.date(datetime.datetime.utcnow().date().year, datetime.datetime.utcnow().date().month, datetime.datetime.utcnow().date().day).weekday() 
    return (week_days[week_num])

def get_hour():
    utc_datetime = datetime.datetime.utcnow()
    return utc_datetime.strftime("%H:00")

def get_record(email,item):
    response = query_table.query(
        KeyConditionExpression=Key("email").eq(email) & Key("created").eq(item))

    if item != 'account':
        client = boto3.client('kms', region_name = region_name)
        secret = client.decrypt(
            CiphertextBlob=(base64.b64decode(response['Items'][0]['secret'])),
            KeyId=kms_key_id
        )
        decryptedPass = secret['Plaintext'].decode('UTF-8')
        response['Items'][0]['secret'] = decryptedPass   
        return response['Items']
    return response['Items']
    
def webhook_notification(email,title, instanceid, regi0n, action, current_state, previous_state):
    response = get_record (email,'account')
    url = response[0]['webhook_url']
    status = response[0]['webhook']
    if status == 'Enabled' and url:
        requests.post(
            url,
            timeout = 1,
            json = {'text': str('This is notification for your {} and ID {} in region {}, the "{}" action has been initiated.The current state is {}, and the previous state was {}').format(title, instanceid, regi0n, action, current_state, previous_state)},
            headers = {'Content-Type': 'application/json'}
            )
 
def notification(to_addresses, msg, subj,source_email=source_email):
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

subj = 'Scheduler Notification'

def message( title, instanceid, regi0n, action, current_state, previous_state):
    return """Hello!

This is notification for your {} and ID {} in region {}, the "{}" action has been initiated.
The current state is {}, and the previous state was {}. 

Thank you for using our service!

Regards,
Instance Scheduler Service""".format(title, instanceid, regi0n, action, current_state, previous_state)

def lambda_handler(event, context):
    response = get_ec2(index_name1, key1, get_hour())

    for i in range(len(response['Items'])):
        email = response['Items'][i]['email']
        title  = response['Items'][i]['title']
        regi0n = response['Items'][i]['regi0n']
        ec2id = response['Items'][i]['ec2id']
        days = response['Items'][i]['days']
        profile = response['Items'][i]['profile']
        todo = response['Items'][i]['todo']
        notify = response['Items'][i]['notify']
        service = response['Items'][i]['service']
        
        aws_key = get_record(email, profile)[0]
        
        if get_today() in days:

            if service == 'ec2':
            
                if todo == 'start':
                    keys = action_start(regi0n, aws_key['access'], aws_key['secret'], ec2id)
                    current_state  = keys['StartingInstances'][0]['CurrentState']['Name']
                    previous_state = keys['StartingInstances'][0]['PreviousState']['Name'] 
                    instanceid     = keys['StartingInstances'][0]['InstanceId']
                    
                    print({'CurrentState': current_state,
                            'PreviousState':previous_state,
                            'ec2id': instanceid 
                          })
                    
                    if notify == 'true':
                        msg = message(title, instanceid, regi0n, 'Start', current_state, previous_state)
                        notification(email, msg, subj,source_email=source_email)
                    try:
                        webhook_notification(email, title, instanceid, regi0n, 'Start', current_state, previous_state)    
                    except:
                        pass
        
                  
                elif todo == 'stop':                 
                    keys = action_stop(regi0n, aws_key['access'], aws_key['secret'], ec2id)
                    current_state  = keys['StoppingInstances'][0]['CurrentState']['Name']
                    previous_state = keys['StoppingInstances'][0]['PreviousState']['Name'] 
                    instanceid     = keys['StoppingInstances'][0]['InstanceId']
                    
                    print({'CurrentState': current_state,
                            'PreviousState':previous_state,
                            'ec2id': instanceid
                          })
                    
                    if notify == 'true':
                        msg = message(title, instanceid, regi0n, 'Stop', current_state, previous_state)
                        notification(email, msg, subj,source_email=source_email)
                    try:
                        webhook_notification(email, title, instanceid, regi0n, 'Stop', current_state, previous_state)    
                    except:
                        pass
            
            if service == 'rds':
                rds = boto3.client('rds')
                if todo == 'start':
                    try:
                        keys = rds_action_start(regi0n, aws_key['access'], aws_key['secret'], ec2id)
                        current_state = keys['DBInstance']['DBInstanceStatus']
                        instanceid = keys['DBInstance']['DBInstanceIdentifier']
                        endpoint = keys['DBInstance']['Endpoint']['Address'] 
                        port = keys['DBInstance']['Endpoint']['Port']
                        engine = keys['DBInstance']['Engine']
                        engine_version = keys['DBInstance']['EngineVersion']

                        if notify == 'true':
                            msg = message(title, instanceid, regi0n, 'Start', current_state, 'Stopped')
                            notification(email, msg, subj,source_email=source_email)
                        try:
                            webhook_notification(email, title, instanceid, regi0n, 'Start', current_state, 'Stopped')    
                        except:
                            pass

                        
                    except rds.exceptions.InvalidDBInstanceStateFault:
                        if notify == 'true':
                            msg = message(title, 'Unknown', regi0n, 'Start', 'the Start DB Instance operation is not in available state', 'Unknown')
                            notification(email, msg, subj,source_email=source_email)
                        try:
                            webhook_notification(email, title,'Unknown', regi0n, 'Start', 'the Start DB Instance operation is not in available state', 'Unknown')    
                        except:
                            pass

                
                elif todo == 'stop':
                    try:
                        keys = rds_action_stop(regi0n, aws_key['access'], aws_key['secret'], ec2id)
                        current_state = keys['DBInstance']['DBInstanceStatus']
                        instanceid = keys['DBInstance']['DBInstanceIdentifier'] 
                        
                        if notify == 'true':
                            msg = message(title, instanceid, regi0n, 'Stop', current_state, 'Started')
                            notification(email, msg, subj,source_email=source_email)
                        try:
                            webhook_notification(email, title, instanceid, regi0n, 'Stop', current_state, 'Started')    
                        except:
                            pass

                        
                    except rds.exceptions.InvalidDBInstanceStateFault:
                        if notify == 'true':
                            msg = message(title, 'Unknown', regi0n, 'Stop', 'the Stop DB Instance operation is not in available state', 'Unknown')
                            notification(email, msg, subj,source_email=source_email)
                        try:
                            webhook_notification(email, title, 'Unknown', regi0n, 'Stop', 'the Stop DB Instance operation is not in available state', 'Unknown')    
                        except:
                            pass
          
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": "The nubmer of actions Items has been {} done".format(len(response['Items']))
        }