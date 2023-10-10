const fs = require('fs');
const readline = require('readline');
const { MongoClient } = require('mongodb');
const path = require('path');

// MongoDB connection URL
const mongoURL = 'mongodb://localhost:27017';
const dbName = 'bdii_tpo'; // Change to your MongoDB database name

// Specify the directory where TSV files are located
const tsvDir = './tsv_output'; // Change to the directory where your TSV files are
const fileNames = ['e01_detalle_factura.tsv',
'e01_factura.tsv',
'e01_producto.tsv'];

async function readTSVFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const dataArray = [];
  let header = null;

  for await (const line of rl) {
    const row = line.split('\t');
    if (!header) {
      // Assume the first row is the header
      header = row;
    } else {
      // Create an object using the header as keys and the current row as values
      const doc = {};
      header.forEach((key, index) => {
        doc[key] = row[index];
      });
      dataArray.push(doc);
    }
  }

  return dataArray;
}

async function insertDataIntoMongoDB(dataArray, client, collectionName) {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  try {
    const result = await collection.insertMany(dataArray);
    console.log(`${result.insertedCount} documents inserted into MongoDB`);
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
  }
}


(async () => {
  let client;
  try {
    // Create a MongoDB client
    client = new MongoClient(mongoURL);

    // Connect to the MongoDB server
    await client.connect();

    // Read and insert data from each TSV file in the specified directory
    const files = fileNames;
    for (const file of files) {
      if (file.endsWith('.tsv')) {
        const filePath = path.join(tsvDir, file);
        const dataArray = await readTSVFile(filePath);

        // Extract the collection name from the file name (without the extension)
        const collectionName = path.parse(file).name;

        await insertDataIntoMongoDB(dataArray, client, collectionName);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      // Close the MongoDB client
      client.close();
    }
  }
})();
