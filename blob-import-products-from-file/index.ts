const { BlobServiceClient } = require('@azure/storage-blob');
const { ServiceBusClient } = require('@azure/service-bus');
const csvParser = require('csv-parser');
const stream = require('stream');

const connectionString = process.env.ServiceBusConnection;
const queueName = 'products_service_servicebus_queue';

module.exports = async function (context, blobTrigger) {
  const csvContent = blobTrigger.toString();
  const results = [];

  const sbClient = new ServiceBusClient(connectionString);
  const sender = sbClient.createSender(queueName);

  const readableStream = new stream.Readable();
  readableStream.push(csvContent);
  readableStream.push(null);

  await new Promise((resolve, reject) => {
    readableStream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log('Results', results);
  // Send messages to Service Bus Queue
  try {
    for (const record of results) {
      await sender.sendMessages({ body: record });
      console.log('Sent Record', record);
    }
    context.log(`Pushed ${results.length} products to Service Bus queue`);
    console.log(`Pushed ${results.length} products to Service Bus queue`);
  } catch (error) {
    context.log.error('Failed to send message(s) to Service Bus:', error);
    console.log('Failed to send message(s) to Service Bus:', error);
    throw error;
  } finally {
    await sender.close();
    await sbClient.close();
  }
};
