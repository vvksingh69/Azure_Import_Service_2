import { AzureFunction, Context } from '@azure/functions';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  ContainerClient,
} from '@azure/storage-blob';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

const blobTrigger: AzureFunction = async function (
  context: Context,
  myBlob: Buffer
): Promise<void> {
  const blobName = context.bindingData.name as string;
  const storageConnectionString = process.env.AzureWebJobsStorage;

  if (!storageConnectionString) {
    context.log.error('Missing AzureWebJobsStorage setting.');
    return;
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    storageConnectionString
  );
  const uploadedContainer = blobServiceClient.getContainerClient('uploaded');
  const parsedContainer = blobServiceClient.getContainerClient('parsed');

  // Ensure target container exists
  await parsedContainer.createIfNotExists();

  // Parse CSV
  const records = await parseCsv(myBlob);
  records.forEach((record, i) => context.log(`Record ${i + 1}:`, record));

  // Copy to parsed/
  const sourceBlobClient = uploadedContainer.getBlobClient(blobName);
  const targetBlobClient = parsedContainer.getBlobClient(blobName);

  const copyPoller = await targetBlobClient.beginCopyFromURL(
    sourceBlobClient.url
  );
  await copyPoller.pollUntilDone();
  context.log(`Copied blob to 'parsed/${blobName}'`);

  // Delete original blob
  await sourceBlobClient.delete();
  context.log(`Deleted blob from 'uploaded/${blobName}'`);
};

function parseCsv(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const records: any[] = [];
    Readable.from(buffer)
      .pipe(csvParser())
      .on('data', (data) => records.push(data))
      .on('end', () => resolve(records))
      .on('error', (err) => reject(err));
  });
}

export default blobTrigger;
