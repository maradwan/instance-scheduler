#!/bin/bash

# Change the region
region="eu-west-1"
# Change the bucket with a unique name
bucket_name="instance-scheduler-2022"

website_directory="./html"

# Create a new bucket
aws s3 mb --region $region "s3://$bucket_name" 

# Enable public access to the bucket
aws s3api put-public-access-block \
    --bucket $bucket_name \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Update the bucket policy for public read access:
aws s3api put-bucket-policy --bucket $bucket_name --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
      {
          \"Sid\": \"PublicReadGetObject\",
          \"Effect\": \"Allow\",
          \"Principal\": \"*\",
          \"Action\": \"s3:GetObject\",
          \"Resource\": \"arn:aws:s3:::$bucket_name/*\"
      }
  ]
}"

# Enable the s3 bucket to host an `index` and `error` html page
aws s3 website "s3://$bucket_name" --index-document index.html --error-document index.html

# Upload you website
aws s3 sync $website_directory "s3://$bucket_name/" 

# Bucket URL 
echo "curl http://$bucket_name.s3-website.$region.amazonaws.com"

# CloudFront
aws cloudfront create-distribution --cli-input-json ' 
 {
     "DistributionConfig": {
         "Comment": "", 
         "CacheBehaviors": {
             "Quantity": 0
         }, 
         "Logging": {
             "Bucket": "", 
             "Prefix": "", 
             "Enabled": false, 
             "IncludeCookies": false
         }, 
         "Origins": {
             "Items": [
                 {
                     "OriginPath": "", 
                     "CustomOriginConfig": {
                         "OriginProtocolPolicy": "http-only", 
                         "HTTPPort": 80, 
                         "HTTPSPort": 443
                     }, 
                     "Id": "'$bucket_name.s3-website.$region.amazonaws.com'",
                     "DomainName": "'$bucket_name.s3-website.$region.amazonaws.com'"
                 }
             ], 
             "Quantity": 1
         }, 
         "DefaultRootObject": "index.html", 
         "PriceClass": "PriceClass_All", 
         "Enabled": true, 
         "DefaultCacheBehavior": {
             "TrustedSigners": {
                 "Enabled": false, 
                 "Quantity": 0
             }, 
             "TargetOriginId": "'$bucket_name.s3-website.$region.amazonaws.com'", 
             "ViewerProtocolPolicy": "redirect-to-https", 
             "ForwardedValues": {
                 "Headers": {
                     "Quantity": 0
                 }, 
                 "Cookies": {
                     "Forward": "none"
                 }, 
                 "QueryString": false
             }, 
             "SmoothStreaming": false, 
             "AllowedMethods": {
                 "Items": [
                     "GET", 
                     "HEAD"
                 ], 
                 "CachedMethods": {
                     "Items": [
                         "GET", 
                         "HEAD"
                     ], 
                     "Quantity": 2
                }, 
                 "Quantity": 2
             }, 
             "MinTTL": 0
         }, 
         "CallerReference": "Mon May 25 21:39:53 CEST 2015", 
         "CustomErrorResponses": {
             "Quantity": 0
         }, 
         "Restrictions": {
             "GeoRestriction": {
                 "RestrictionType": "none", 
                 "Quantity": 0
             }
         }
     }
 }'

cloudfrontDomainName="$(aws cloudfront list-distributions --query "DistributionList.Items[*].{domainname:DomainName,origin:Origins.Items[0].DomainName}[?origin=='$bucket_name.s3-website.$region.amazonaws.com'].domainname" --output text)"
echo "########################################################################"
echo "Click on https://$cloudfrontDomainName"
echo "CloudFront takes around 5 minutes to be deployed"
echo "########################################################################"
