import { EC2Client, DescribeSnapshotsCommand,DescribeImagesCommand } from "@aws-sdk/client-ec2";
import { KMSClient, DescribeKeyCommand,GetKeyPolicyCommand,PutKeyPolicyCommand } from "@aws-sdk/client-kms";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { fromEnv } from "@aws-sdk/credential-providers";


//const credentials = fromIni({});
const credentials = fromEnv({});
const region = 'us-east-1';
const ec2Client = new EC2Client({ region, credentials });
const kmsClient = new KMSClient({ region, credentials });
const amiId = 'ami-060b66ef18eb07ea6';
const snapshotId = 'snap-088acaebf001fe94c';
var target_account_id = '188805026079'
const arn_target= "arn:aws:iam::"+target_account_id+":root"
var kms_key_id;
var custom_policy = {
    "Sid": "Custom policy for C Migrate",
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

//console.log(custom_policy)
const params_ami = {
  ImageIds: [amiId]
};

async function describeAmi() {
  try {
    const data = await ec2Client.send(new DescribeImagesCommand(params_ami));
    console.log(data)
    const kmsKeyId = data.Images[0].BlockDeviceMappings;
    console.log("KMS Key ID of the AMI:", kmsKeyId);
  } catch (err) {
    console.log("Error occurred:", err);
  }
}

//describeAmi();

const params_snap = {
  SnapshotIds: [snapshotId]
};

async function describeSnapshot() {
  try {
    const data = await ec2Client.send(new DescribeSnapshotsCommand(params_snap));
    var kmsKeyId = data.Snapshots[0].KmsKeyId;
    kms_key_id = kmsKeyId
    //console.log(data)
    console.log("KMS Key ID of the snapshot:", kmsKeyId);
    const params_kms = {KeyId: kmsKeyId};
    describeKey(params_kms);
    const params_kms_policy = {
        KeyId:kmsKeyId,
        "PolicyName": "default"
      };
    get_key_policy(params_kms_policy)
  } catch (err) {
    console.log("Error occurred:", err);
  }
}
describeSnapshot();

function describeKey(params_kms) {
  try {
    const data_kms = kmsClient.send(new DescribeKeyCommand(params_kms));
    console.log("####################### DescribeKeyCommand #######################")
    //console.log(data_kms)
  } catch (err) {
    console.log("Error occurred:", err);
  }
}

async function get_key_policy(params_kms_policy) {
    try {
        const data_kms_policy = await kmsClient.send(new GetKeyPolicyCommand(params_kms_policy));
        console.log("####################### Printing KMS policy #######################");
        console.log(data_kms_policy);
        var policy_json=JSON.parse(data_kms_policy.Policy);
        console.log(policy_json);
        policy_json.Statement.push(custom_policy)
        console.log("####################### New custom KMS policy #######################");
        console.log(policy_json);
        var new_policy = JSON.stringify(policy_json)
        console.log(new_policy);
        put_key_policy(kms_key_id,new_policy);
    } catch (err) {
      console.log("Error occurred:", err);
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
        const result_put = await kmsClient.send(new PutKeyPolicyCommand(put_custom_policy));
        console.log("Policy modified\n",result_put)
        
    } catch (err) {
      console.log("Error occurred:", err);
    }
  }

