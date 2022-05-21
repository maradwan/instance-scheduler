from datetime import datetime
from flask import request, jsonify
from os import environ as env
import json
import jwt
import requests
from jwt.algorithms import RSAAlgorithm

cognito_app_client_id =  env.get("COGNITOR_CLIENTID")
cognito_region = env.get("REGION_NAME")
cognito_user_pool_id = env.get("USERPOOLID")

def validate_cognito_token(id_token, cognito_region, cognito_user_pool_id, cognito_app_client_id):
    jwks = requests.get('https://cognito-idp.{aws_region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json'.format(aws_region=cognito_region, user_pool_id=cognito_user_pool_id)).json()
    keys = {k['kid']: RSAAlgorithm.from_jwk(json.dumps(k)) for k in jwks['keys']}
    header = jwt.get_unverified_header(id_token)
    key_id = header['kid']
    algorithm = header['alg']
    pub_key = keys[key_id]
    # Next line raises errors if the audience isn't right or if the token is expired or has other errors.
    valid_token_data = jwt.decode(id_token, pub_key, audience=cognito_app_client_id, algorithms=algorithm,verify=True)
    return valid_token_data

def token_email():
    token = None
    try:
        if 'Authorization' in request.headers:
           token = request.headers['Authorization']
           if token.split()[0] == "Bearer":
               user = validate_cognito_token(token.split()[1],cognito_region,cognito_user_pool_id,cognito_app_client_id) 

               # It is important to split as the token has one space
           user = validate_cognito_token(token.split()[0],cognito_region,cognito_user_pool_id,cognito_app_client_id) 

        return user['email']
    except:
        return jsonify('Misunderstood Request'),401

def gen_time():
    timenow = datetime.now()
    return timenow.strftime("%d-%m-%Y_%H-%M-%S-%f")

def check_email(email):
    if email == token_email():
        return True
    return False