import httpTrigger from './index';
import { Context, HttpRequest } from '@azure/functions';

describe('http-get-import-products-files', () => {
  const mockContext = {} as Context;

  beforeEach(() => {
    process.env.AZURE_STORAGE_ACCOUNT_NAME = 'testaccount';
    process.env.AZURE_STORAGE_ACCOUNT_KEY = 'testkey';
  });

  it("returns 400 if 'name' query param is missing", async () => {
    const req = {
      method: 'GET',
      url: '',
      headers: {},
      query: {},
      params: {},
      body: null,
      user: undefined,
      get: () => '',
      parseFormBody: async () => ({}),
    } as unknown as HttpRequest;

    const context = {} as Context;

    await httpTrigger(context, req);

    expect(context.res).toEqual({
      status: 400,
      body: "Query parameter 'name' is required.",
    });
  });

  it('returns a signed URL if name is provided', async () => {
    const req = {
      method: 'GET',
      url: '',
      headers: {},
      query: { name: 'test.csv' },
      params: {},
      body: null,
      user: undefined,
      get: () => '',
      parseFormBody: async () => ({}),
    } as unknown as HttpRequest;

    const context = {} as Context;

    await httpTrigger(context, req);

    expect(context.res?.status).toBe(200);
    expect(context.res?.body?.url).toContain(
      'https://testaccount.blob.core.windows.net'
    );
    expect(context.res?.body?.token).toBeDefined();
  });
});
