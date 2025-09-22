import { AWSRegionList, CLOUD_GROUP_NAMES, Cloud } from "@/types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate mock data based on types.ts
const MOCK_CLOUDS: Cloud[] = [
  {
    id: "aws-dev",
    provider: "AWS",
    name: "Dev",
    cloudGroupName: ["AWS-Group"],
    eventProcessEnabled: true,
    userActivityEnabled: false,
    scheduleScanEnabled: false,
    regionList: ["global", "ap-northeast-2", "us-east-1"],
    proxyUrl: undefined,
    credentials: {
      accessKeyId: "AKIA********18",
      secretAccessKey: "jZd1********0n",
      roleArn: undefined,
    },
    credentialType: "ACCESS_KEY",
    eventSource: { cloudTrailName: "trail-dev" },
  },
  {
    id: "aws-stage",
    provider: "AWS",
    name: "Stage",
    cloudGroupName: ["AWS-Group", "Prod"],
    eventProcessEnabled: true,
    userActivityEnabled: false,
    scheduleScanEnabled: true,
    scheduleScanSetting: { frequency: "DAY", hour: "3", minute: "0" },
    regionList: ["global", "us-east-1"],
    credentials: {
      accessKeyId: "AKIA********19",
      secretAccessKey: "abcd********xyz",
    },
    credentialType: "ACCESS_KEY",
    eventSource: { cloudTrailName: "trail-stage" },
  },
];

export function listClouds(): Cloud[] {
  return MOCK_CLOUDS;
}

export async function fetchCloudById(id: string): Promise<Cloud | undefined> {
  await sleep(500);
  return MOCK_CLOUDS.find((c) => c.id === id);
}
