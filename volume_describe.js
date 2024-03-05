import { EC2Client, DescribeVolumesCommand } from "@aws-sdk/client-ec2"
import { fromEnv } from "@aws-sdk/credential-providers";

const credentials = fromEnv({}); // From environment variable 
const region = 'us-east-1';
const ec2Client = new EC2Client({ region, credentials });
const red='\x1b[31m'

const params_vol ={
    "Filters": [
      {
        "Name": "attachment.instance-id",
        "Values": [
          "i-0d7e90cfee10690a5"
        ]
      },
      {
        "Name": "attachment.delete-on-termination",
        "Values": [
          "true"
        ]
      }
    ]
  };
async function describeVol() {
    try {
      const data = await ec2Client.send(new DescribeVolumesCommand (params_vol));
      console.log(JSON.stringify(data));
      console.log(data);
      } 
   catch (err) {
      console.log(red+"Error occurred at Describr volume:", err);
      }
    }
describeVol(params_vol);