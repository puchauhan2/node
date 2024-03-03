import { EC2Client, DescribeSnapshotsCommand} from "@aws-sdk/client-ec2";
import { KMSClient, DescribeKeyCommand,GetKeyPolicyCommand,PutKeyPolicyCommand } from "@aws-sdk/client-kms";
import { fromEnv } from "@aws-sdk/credential-providers";

const credentials = fromEnv({}); // From environment variable 
const region = 'us-east-1';
const ec2Client = new EC2Client({ region, credentials });
const kmsClient = new KMSClient({ region, credentials });

const snapshotId = 'snap-088acaebf001fe94c'; //################ Put Source SnapShot id here
const target_account_id = '188805026079' //################ Put target account id here
const arn_target= "arn:aws:iam::"+target_account_id+":root"
var kms_key_id;

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

const params_snap = {
  SnapshotIds: [snapshotId]
};

async function describeSnapshot() {
  try {
    const data = await ec2Client.send(new DescribeSnapshotsCommand(params_snap));
    const kmsKeyId = data.Snapshots[0].KmsKeyId;
    kms_key_id = kmsKeyId
    console.log("KMS Key ID of the snapshot:", kmsKeyId);
    //const params_kms ={ KeyId:kmsKeyId }
    //describeKey(params_kms);
    const params_kms_policy = { KeyId:kmsKeyId, "PolicyName": "default"};
    get_key_policy(params_kms_policy)
    } 
 catch (err) {
    console.log("Error occurred at Describr Snapshot:", err);
    }
}
describeSnapshot();

 function describeKey(params_kms) {
  try {
    const data_kms = kmsClient.send(new DescribeKeyCommand(params_kms));
    console.log("####################### DescribeKeyCommand #######################")
    console.log(data_kms)
  } catch (err) {
    console.log("Error occurred at Describe key:", err);
  }
}

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
        put_key_policy(kms_key_id,new_policy);
    } catch (err) {
      console.log("Error occurred at Get KMS policy JSON:", err);
    }
}

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

    console.log("############################# Validation start ############################")
    var num = raw_policy.search(arn_target);
    if (num >= 0){
        console.log('Policy already present with ARN '+arn_target+" ,Cannot proceed further\n");
        console.log(raw_policy);
        process.exit();
    }
    else {console.log("Key value not found")}
    console.log("############################# Validation Finish ############################")

}
