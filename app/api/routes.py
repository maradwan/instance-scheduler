from flask import request, jsonify
import boto3
from os import environ as env
from api.auth import gen_time, token_email
from api.models import webhook_url, add_record_ec2, get_records_ec2, get_record_ec2, delete_record_ec2, delete_records_ec2, update_record_ec2
from api.actions import action_start, action_stop, rds_action_start, rds_action_stop
from api.notifications import message_body_deleted_account, notification
import base64

from api import app

region_name  = env.get("REGION_NAME")
keys_limit = int(env.get("KEYS_LIMIT"))
ec2_limit = int(env.get("EC2_LIMIT"))
kms_key_id = env.get("KMS_KEY_ID")
source_email = env.get("SOURCE_EMAIL")
UserPoolId = env.get("USERPOOLID")

subj_remove_account = 'Deleted Your Account'


def user_limit_ec2(check):
    """
    Get User Limit from DB, if not use global limit
    """
    if check == 'ec2':
        get_ec2()
        if ec2_limit > get_ec2.item_limit:
            return False
        return True
    elif check == 'keys':
        get_keys()
        if keys_limit > get_keys.item_limit:
            return False
        return True

@app.route('/ec2', methods=['POST'])
def add_ec2():

    if (user_limit_ec2('ec2')):
        return jsonify('{} Records Limit Reached'.format(get_ec2.item_limit)),426

    email = token_email()

    try:
        data = request.json   

        days = [] 
        if data['dtime'] and data['days'] and data['ec2id'] and data['profile'] and data['regi0n'] and data['title'] and data['todo'] and data['notify'] and data['service'] and data['provider'] and len(data) == 10:
            if data['provider'] != 'aws':
                return jsonify('Unknown Cloud Provider'),400
            if data['service'] not in ['rds','ec2']:
                return jsonify('Unknown Service'),400
        
            if len(data['days']) <= 7:
                if 'mon' in data['days']:
                    days.append('mon')
                if 'tue' in data['days']:
                    days.append('tue')
                if 'wed' in data['days']:
                    days.append('wed')
                if 'thu' in data['days']:
                    days.append('thu')
                if 'fri' in data['days']:
                    days.append('fri')
                if 'sat' in data['days']:
                    days.append('sat')
                if 'sun' in data['days']:
                    days.append('sun')
                data['days'] = days
                data['email'] = email
                data['created'] = gen_time()
                data['profile'] = 'ec2profile' + '_' + data['profile']        
                add_record_ec2(data)
                return jsonify(data),201
            
        return jsonify('You must fill in all of the required fields *'),400
    except:
        return jsonify('Misunderstood Request'),400
    
@app.route('/ec2/<created>', methods=['PUT'])
def update_ec2(created):
    email = token_email()
    try:
        data = request.json
        days = [] 
        
        if data['dtime'] and data['days'] and data['ec2id'] and data['profile'] and data['regi0n'] and data['title'] and data['todo'] and data['notify'] and data['service'] and data['provider'] and len(data) == 10:
            if data['provider'] != 'aws':
                return jsonify('Unknown Cloud Provider'),400
            if data['service'] not in ['rds','ec2']:
                return jsonify('Unknown Service'),400

            if len(data['days']) <= 7:
                if 'mon' in data['days']:
                    days.append('mon')
                if 'tue' in data['days']:
                    days.append('tue')
                if 'wed' in data['days']:
                    days.append('wed')
                if 'thu' in data['days']:
                    days.append('thu')
                if 'fri' in data['days']:
                    days.append('fri')
                if 'sat' in data['days']:
                    days.append('sat')
                if 'sun' in data['days']:
                    days.append('sun')
                
                data['days'] = days
                data['email'] = email
                data['created'] = created
                data['profile'] = 'ec2profile' + '_' + data['profile']   
               
                update_record_ec2(email, created, data)
                return jsonify(data),201
            
        return jsonify('You must fill in all of the required fields *'),400
    except:
        return jsonify('Misunderstood Request'),400
    
@app.route('/ec2', methods=['GET'])
def get_ec2():
      email = token_email()
      try:
          data = get_records_ec2(email)

          if data is None:
              return jsonify('Not Found'),404
          
          get_ec2.item_limit =len(data['Items'])
          
          for i in range(len(data['Items'])):
              profile = data['Items'][i]['profile'][11:]
              data['Items'][i]['profile'] = profile
           
          return jsonify(data) 
      except:
          return jsonify('Misunderstood Request'),400

@app.route('/ec2/action', methods=['POST'])
def action_ec2():
      email = token_email()
      try:
          data = request.json
          if data['ec2id'] and data['profile'] and data['service'] and data['regi0n'] and data['todo'] and len(data) == 5:
              record = get_record_ec2(email,data['profile'])[0]


              if data['service'] == 'ec2':
                  if data['todo'] == 'start':
                      response = action_start(data['regi0n'], record['access'], record['secret'], data['ec2id'])
                      current_state  = response['StartingInstances'][0]['CurrentState']['Name']
                      previous_state = response['StartingInstances'][0]['PreviousState']['Name'] 
                      instanceid     = response['StartingInstances'][0]['InstanceId']
                      return jsonify({'CurrentState': current_state, 'PreviousState':previous_state, 'ec2id': instanceid })
              
                  elif data['todo'] == 'stop':                 
                      response = action_stop(data['regi0n'], record['access'], record['secret'], data['ec2id'])
                      current_state  = response['StoppingInstances'][0]['CurrentState']['Name']
                      previous_state = response['StoppingInstances'][0]['PreviousState']['Name'] 
                      instanceid     = response['StoppingInstances'][0]['InstanceId']
                      return jsonify({'CurrentState': current_state, 'PreviousState':previous_state, 'ec2id': instanceid })

              if data['service'] == 'rds':
                  rds = boto3.client('rds')
                  if data['todo'] == 'start':
                       try:
                           response = rds_action_start(data['regi0n'], record['access'], record['secret'], data['ec2id'])
                           current_state = response['DBInstance']['DBInstanceStatus']
                           return jsonify({'CurrentState': current_state, 'PreviousState': 'Stopped'})
                       except rds.exceptions.InvalidDBInstanceStateFault:
                           return jsonify({'CurrentState': 'the Start DB Instance operation is not in available state','PreviousState' : "Unknown" })

                
                  elif data['todo'] == 'stop':
                      try:
                          response = rds_action_stop(data['regi0n'], record['access'], record['secret'], data['ec2id'])
                          current_state = response['DBInstance']['DBInstanceStatus']
                          return jsonify({'CurrentState': current_state,'PreviousState' : "Started" })
                      except rds.exceptions.InvalidDBInstanceStateFault:
                          return jsonify({'CurrentState': 'the Stop DB Instance operation is not in available state','PreviousState' : "Unknown" })


          return jsonify('You must fill in all of the required fields'),400
      except:
          return jsonify('Misunderstood Request'),400
      
# Delete ec2
@app.route('/ec2/<created>', methods=['DELETE'])
def delete_ec2(created):
  email = token_email()
  try:     
      delete_record_ec2(email,created)
      return jsonify("Deleted: {}".format(created)),200
  except:
      return jsonify('Misunderstood Request'),400
      
@app.route('/keys', methods=['POST'])
def add_keys():

    if (user_limit_ec2('keys')):
        return jsonify('{} Records Limit Reached'.format(get_keys.item_limit)),426

    email = token_email()
    try:
        data = request.json
        
        if data['access'] and data['secret'] and data['name'] and len(data) == 3:      
            data['email'] = email
            data['created'] = 'ec2profile' + '_' + data['name']
            del data['name']
            client = boto3.client('kms', region_name= region_name, verify=True)
            response = client.encrypt(
                Plaintext=data['secret'],
                KeyId=kms_key_id
                )
            b64_pass = str(base64.b64encode(response['CiphertextBlob']),'utf-8')
            data['secret'] = b64_pass                   
          
            add_record_ec2(data)
            return jsonify(data),201

        return jsonify('You must fill in all of the required fields'),400
    except:
        return jsonify('Misunderstood Request'),400
      
@app.route('/keys', methods=['GET'])
def get_keys():
    
      email = token_email()
      try:
          data = get_records_ec2(email,created='ec2profile_apps')
          if data is None:
              return jsonify('Not Found'),404
          
          get_keys.item_limit =len(data['Items'])
          
          for i in range(len(data['Items'])):
              created = data['Items'][i]['created'][11:]
              data['Items'][i]['created'] = created           
          return jsonify(data) 
      except:
          return jsonify('Misunderstood Request'),400

# Delete key
@app.route('/keys/<key>', methods=['DELETE'])
def delete_key(key):
  email = token_email()
  try:
      profile_key = "ec2profile_" + str(key)
      delete_record_ec2(email,profile_key)
      
      return jsonify("Deleted: {}".format(key)),200
  except:
      return jsonify('Misunderstood Request'),400

@app.route('/account', methods=['GET'])
def user_account():
      try:
          email = token_email()
          data = get_records_ec2(email,created='account')

          # Add account to the user
          if data['Items'] == []:
              user = {'email': email, 'created': 'account'}
              add_record_ec2(user)
              data['Items'] = [user]
              return jsonify(data['Items'])

          return jsonify(data['Items']) 
      except:
          return jsonify('Misunderstood Request'),400

@app.route('/account', methods=['DELETE'])
def delete_account():
    email = token_email()
    try:
        cognito = boto3.client('cognito-idp',region_name = region_name, verify=True)
        cognito.admin_delete_user(
            UserPoolId= UserPoolId,
            Username= email
            )
        delete_records_ec2(email)       
        msg = message_body_deleted_account(email)
        notification(email, msg, subj_remove_account)
        return jsonify('Removing account has been requested'),200
    except:
        return jsonify('Misunderstood Request'),400

@app.route('/account/webhook', methods=['PUT'])
def webhook():
    email = token_email()
    try:
        data = request.json
        if data['webhook'] and len(data) <= 2:
            data['email'] = email
            if data['webhook'] == 'Enabled' or data['webhook'] == 'Disabled':
                webhook_url(email,data['webhook'],data['webhook_url'])
                return jsonify("status: {}".format(data['webhook']))

        return jsonify('You must fill in all of the required fields *'),400
    except:
        return jsonify('Misunderstood Request'),400