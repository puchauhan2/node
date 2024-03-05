import { EC2Client, DescribeInstancesCommand} from "@aws-sdk/client-ec2";
import { fromEnv } from "@aws-sdk/credential-providers";

const credentials = fromEnv({}); // From environment variable 
const region = 'us-east-1';
const ec2Client = new EC2Client({ region, credentials });
const red='\x1b[31m'

const params_ec2 ={
    "InstanceIds": [
      "i-0d7e90cfee10690a5"
    ]
  };
async function describeEc2() {
    try {
      const data = await ec2Client.send(new DescribeInstancesCommand(params_ec2));
      console.log(JSON.stringify(data));
      } 
   catch (err) {
      console.log(red+"Error occurred at Describr ec2:", err);
      }
  }
  describeEc2(params_ec2);