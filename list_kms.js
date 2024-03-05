import { KMSClient, DescribeKeyCommand,GetKeyPolicyCommand,PutKeyPolicyCommand,ListKeysCommand } from "@aws-sdk/client-kms";
import { fromEnv } from "@aws-sdk/credential-providers";

const credentials = fromEnv({}); // From environment variable 
const region = 'us-east-1';
const kmsClient = new KMSClient({ region, credentials });

const input_param = {};
async function listKey(input_param) {
    try {
      const data_kms = await kmsClient.send(new ListKeysCommand(input_param));
      console.log("####################### List KeyCommand #######################")
      //console.log(data_kms.Keys)
      keydescribe_array(data_kms.Keys)
    } catch (err) {
      console.log("Error occurred at Describe key:", err);
    }
}
listKey(input_param)



async function describeKey(params_kms) {

    try {
      const data_kms = await kmsClient.send(new DescribeKeyCommand(params_kms));
      console.log("####################### DescribeKeyCommand #######################")
      console.log(data_kms)
    } catch (err) {
      console.log("Error occurred at Describe key:", err);
    }
}

function keydescribe_array(array){
    array.forEach(kms_element => {
        describeKey(kms_element)
    });
}