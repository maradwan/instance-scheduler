import boto3

def action_start(region,access_key,secret_access,instanceID):
    ec2 = boto3.client('ec2', region_name=region, aws_access_key_id=access_key, aws_secret_access_key=secret_access, verify=True)
    return ec2.start_instances(InstanceIds=[instanceID])
    
def action_stop(region,access_key,secret_access,instanceID):
    ec2 = boto3.client('ec2', region_name=region, aws_access_key_id=access_key, aws_secret_access_key=secret_access, verify=True)
    return ec2.stop_instances(InstanceIds=[instanceID])

def rds_action_start(region,access_key,secret_access,instanceID):
    rds = boto3.client('rds', region_name=region, aws_access_key_id=access_key, aws_secret_access_key=secret_access, verify=True)
    return rds.start_db_instance(DBInstanceIdentifier=instanceID)

def rds_action_stop(region,access_key,secret_access,instanceID):
    rds = boto3.client('rds', region_name=region, aws_access_key_id=access_key, aws_secret_access_key=secret_access, verify=True)
    return rds.stop_db_instance(DBInstanceIdentifier=instanceID)