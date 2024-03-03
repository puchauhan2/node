import { EC2Client, DescribeSnapshotsCommand} from "@aws-sdk/client-ec2";
import { KMSClient, DescribeKeyCommand,GetKeyPolicyCommand,PutKeyPolicyCommand } from "@aws-sdk/client-kms";
import { fromEnv } from "@aws-sdk/credential-providers";

const credentials = fromEnv({}); // environment variable 
const region = 'us-east-1';
const ec2Client = new EC2Client({ region, credentials });
const kmsClient = new KMSClient({ region, credentials });

const snapshotId = 'snap-088acaebf001fe94c'; // Source Snap id here
var kms_key_id;
//SnapshotIds: [snapshotId]
const params_snap = {
    SnapshotIds: [snapshotId]
};

async function describeSnapshot() {
  try {
    const data = await ec2Client.send(new DescribeSnapshotsCommand(params_snap));
    console.log(data)
    const kmsKeyId = data.Snapshots[0].KmsKeyId;
    kms_key_id = kmsKeyId
    console.log("KMS Key ID of the snapshot:", kmsKeyId);
    const params_kms ={ KeyId:kmsKeyId }
    describeKey(params_kms);
    const params_kms_policy = { KeyId:kmsKeyId, "PolicyName": "default"};
    get_key_policy(params_kms_policy)
    } 
 catch (err) {
    console.log("Error occurred at Describr Snapshot:", err);
    }
}
describeSnapshot();

 async function describeKey(params_kms) {
  try {
    const data_kms = await kmsClient.send(new DescribeKeyCommand(params_kms));
    console.log("####################### DescribeKeyCommand #######################")
    console.log(data_kms)
  } catch (err) {
    console.log("Error occurred at Describe key:", err);
  }
}

async function get_key_policy(params_kms_policy) {
    try {
        const data_kms_policy = await kmsClient.send(new GetKeyPolicyCommand(params_kms_policy));
        console.log("####################### Printing KMS policy #######################\n");
        const policy_json=JSON.parse(data_kms_policy.Policy);
        console.log(policy_json);
    } catch (err) {
      console.log("Error occurred at Get KMS policy JSON:", err);
    }
}