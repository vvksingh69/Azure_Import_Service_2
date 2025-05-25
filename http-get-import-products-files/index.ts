import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const name = req.query.name;

  if (!name) {
    context.res = {
      status: 400,
      body: "Query parameter 'name' is required.",
    };
    return;
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
  const containerName = 'uploaded';

  const sasToken = generateBlobSasToken(
    accountName,
    accountKey,
    containerName,
    name,
    'cw' // 'c' = create, 'w' = write
  );

  const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${name}?${sasToken}`;

  context.res = {
    status: 200,
    body: {
      token: sasToken,
      url: blobUrl,
    },
  };
};

function generateBlobSasToken(
  accountName: string,
  accountKey: string,
  containerName: string,
  blobName: string,
  permissionChar: string
): string {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const permissions = BlobSASPermissions.parse(permissionChar);

  const startsOn = new Date();
  const expiresOn = new Date();
  expiresOn.setMinutes(startsOn.getMinutes() + 15);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions,
      startsOn,
      expiresOn,
    },
    sharedKeyCredential
  ).toString();

  return sasToken;
}

export default httpTrigger;
