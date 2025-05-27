import blobTrigger from './index';
import { Context } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';

jest.mock('@azure/storage-blob');

describe('blob-import-products-from-file', () => {
  const mockContext = {
    log: Object.assign(jest.fn(), {
      error: jest.fn(),
      info: jest.fn(),
    }),
    bindingData: { name: 'test.csv' },
  } as unknown as Context;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AzureWebJobsStorage = 'UseDevelopmentStorage=true';
  });

  it('logs error if connection string is missing', async () => {
    delete process.env.AzureWebJobsStorage;

    await blobTrigger(mockContext, Buffer.from('name,price\nApple,1.00'));

    expect(mockContext.log.error).toHaveBeenCalledWith(
      'Missing AzureWebJobsStorage setting.'
    );
  });

  it('parses CSV and moves blob', async () => {
    const mockBeginCopyFromURL = jest.fn().mockResolvedValue({
      pollUntilDone: jest.fn().mockResolvedValue(undefined),
    });

    const deleteMock = jest.fn().mockResolvedValue(undefined);
    const createIfNotExistsMock = jest.fn().mockResolvedValue(undefined);
    const getBlobClientMock = jest.fn().mockImplementation((name: string) => ({
      url: `https://example.com/uploaded/${name}`,
      beginCopyFromURL: mockBeginCopyFromURL,
      delete: deleteMock,
    }));

    const getContainerClientMock = jest
      .fn()
      .mockImplementation((name: string) => ({
        getBlobClient: getBlobClientMock,
        createIfNotExists: createIfNotExistsMock,
      }));

    (BlobServiceClient.fromConnectionString as jest.Mock).mockReturnValue({
      getContainerClient: getContainerClientMock,
    });

    await blobTrigger(
      mockContext,
      Buffer.from('name,price\nApple,1.00\nBanana,0.80')
    );

    expect(createIfNotExistsMock).toHaveBeenCalled();
    expect(mockBeginCopyFromURL).toHaveBeenCalled();
    expect(deleteMock).toHaveBeenCalled();
  });
});
