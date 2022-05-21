import boto3
from boto3.dynamodb.conditions import Key
import decimal
import simplejson as json
import base64
from os import environ as env

table_name = env.get("TABLE_NAME")
region_name  = env.get("REGION_NAME")
kms_key_id  = env.get("KMS_KEY_ID")

query_table = boto3.resource("dynamodb", region_name= region_name, verify=True).Table(table_name)

# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

def add_record_ec2(item):
    return query_table.put_item(Item=item)

def get_record_ec2(email,item):
    response = query_table.query(
        KeyConditionExpression=Key("email").eq(email) & Key("created").eq(item))

    client = boto3.client('kms', region_name = region_name, verify=True)
    secret = client.decrypt(
        CiphertextBlob=(base64.b64decode(response['Items'][0]['secret'])), 
        KeyId=kms_key_id
        )

    decryptedPass = secret['Plaintext'].decode('UTF-8')
    response['Items'][0]['secret'] = decryptedPass   
    return response['Items']

def get_records_ec2(email,created=None):
    z = {}
    x = []
    z['Items'] = []
    response= query_table.query(
        KeyConditionExpression=Key("email").eq(email)
    )

    for i in response[u'Items']:
        if created=='ec2profile_apps' and 'ec2profile' in i['created']:
            x.append( json.loads(json.dumps(i, cls=DecimalEncoder)))
        elif created=='account' and 'account' in i['created']:
            x.append( json.loads(json.dumps(i, cls=DecimalEncoder)))

        elif not created and 'ec2profile' not in i['created'] and 'account' not in i['created']:
            x.append( json.loads(json.dumps(i, cls=DecimalEncoder)))
    
    z['Items'] = x
    
    # delete any key named secret         
    for i in range(len(z['Items'])):
        if 'secret' in (z['Items'][i]):
            del z['Items'][i]['secret'] 
            
    return z

def delete_record_ec2(email,created):
    return query_table.delete_item(
        Key={
            'email': email,
            'created' : created
            }
            )
    
def delete_records_ec2(email):   
    items= query_table.query(
        KeyConditionExpression=Key("email").eq(email)
    )
    for i in range(len(items['Items'])):
        query_table.delete_item(
        Key={
            'email': email,
            'created' : items['Items'][i]['created']
            }
            )
    return True

def update_record_ec2(email,created,update_item):
    return query_table.update_item(
                Key={'email': email, 'created': created
                },
                UpdateExpression='SET dtime = :dtime, days = :days, ec2id = :ec2id, notify = :notify, profile = :profile, regi0n = :regi0n, title = :title, service = :service, provider = :provider, todo = :todo',
                ExpressionAttributeValues={
                ':dtime': update_item['dtime'],
                ':days': update_item['days'],
                ':ec2id': update_item['ec2id'],
                ':notify': update_item['notify'],
                ':profile': update_item['profile'],
                ':regi0n': update_item['regi0n'],
                ':title': update_item['title'],
                ':service': update_item['service'],
                ':provider': update_item['provider'],
                ':todo': update_item['todo']
                }
            )

def webhook_url(email,webhook,webhook_url):
    return query_table.update_item(
                Key={'email': email, 'created': 'account'
                },
                UpdateExpression='SET webhook = :webhook, webhook_url = :webhook_url',
                ExpressionAttributeValues={
                    ':webhook': webhook,
                    ':webhook_url': webhook_url
                }
            )