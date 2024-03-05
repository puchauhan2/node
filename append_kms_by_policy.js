import { KMSClient,GetKeyPolicyCommand,PutKeyPolicyCommand } from "@aws-sdk/client-kms";
import { fromEnv } from "@aws-sdk/credential-providers";

const credentials = fromEnv({}); // From environment variable 
const region = 'us-east-1';
const kmsClient = new KMSClient({ region, credentials });

const red='\x1b[31m'
const green='\x1b[32m'
const yellow='\x1b[33m'
const blue='\x1b[34m'
const clear='\x1b[0m'

const target_account_id = '188805026079' //################ Put target account id here
var kmsKeyId='arn:aws:kms:us-east-1:341409111475:key/0078be96-81bc-4194-a42a-df2bb1f71f12';
const arn_target= "arn:aws:iam::"+target_account_id+":root"

var custom_policy = {
    "Sid": "Custom policy for CMigrate",
    "Effect": "Allow",
    "Principal": {
        "AWS": arn_target
    },
    "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
    ],
    "Resource": "*"
}

const params_kms_policy = { KeyId:kmsKeyId, "PolicyName": "default"};

async function get_key_policy(params_kms_policy) {
    try {
        const data_kms_policy = await kmsClient.send(new GetKeyPolicyCommand(params_kms_policy));
        policy_validation(data_kms_policy.Policy);
        console.log("####################### Printing KMS policy #######################\n");
        const policy_json=JSON.parse(data_kms_policy.Policy);
        console.log(policy_json);
        policy_json.Statement.push(custom_policy)
        console.log("####################### New custom KMS policy #######################");
        console.log(policy_json);
        const new_policy = JSON.stringify(policy_json)
        put_key_policy(kmsKeyId,new_policy);
    } catch (err) {
      console.log("Error occurred at Get KMS policy JSON:", err);
    }
}

get_key_policy(params_kms_policy)

async function put_key_policy(kmsKeyId,new_policy) {
    try {

        const put_custom_policy = { 
            KeyId: kmsKeyId, 
            PolicyName: "default", 
            Policy: new_policy, 
            BypassPolicyLockoutSafetyCheck: true || false,
          };
        console.log("####################### Pushing KMS policy #######################")
        const result_put = await kmsClient.send(new PutKeyPolicyCommand(put_custom_policy));
        console.log("Policy modified\n",result_put)
        
    } catch (err) {
      console.log("Error occurred while modifying Key:", err);
    }
}

function policy_validation(raw_policy){

  console.log(yellow+"############################# Validation start ############################")
  var num = raw_policy.search(arn_target);
  if (num >= 0){
    console.log(red+'Policy already present with ARN '+arn_target+" ,Cannot proceed further\n \x1b[0m"+clear);
    console.log(green+raw_policy);
    process.exit();
    }
  else {console.log("ARN NOT FOUND in current KMS policy".green);}
}
