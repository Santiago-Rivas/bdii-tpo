const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// PostgreSQL configuration
const pgConfig = {
  user: 'santiago',
  host: 'localhost',
  database: 'bdii_tpo',
  password: '',
  port: 5432,
};

// MongoDB configuration
const mongoConfig = {
  url: 'mongodb://localhost:27017',
  database: 'bdii_tpo',
};

// Function to execute PostgreSQL queries
async function executePostgreSQLQuery(query) {
  const pool = new Pool(pgConfig);
  const client = await pool.connect();

  try {
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

// Function to execute MongoDB queries
async function executeMongoDBQuery(query) {
  const client = new MongoClient(mongoConfig.url);
  await client.connect();
  const database = client.db(mongoConfig.database);
  const result = await database.collection('your_collection_name').find(query).toArray();
  client.close();
  return result;
}

// Read and execute queries from the PostgreSQL and MongoDB folders
function executeQueries() {
  const postgresqlQueriesDir = '../postgresql/queries/';
  const mongodbQueriesDir = '../mongodb/queries/';

  fs.readdirSync(postgresqlQueriesDir).forEach(async (file) => {
    const query = fs.readFileSync(path.join(postgresqlQueriesDir, file), 'utf-8');
    const postgresqlResult = await executePostgreSQLQuery(query);

    const mongoQuery = fs.readFileSync(path.join(mongodbQueriesDir, file), 'utf-8');
    const mongodbResult = await executeMongoDBQuery(JSON.parse(mongoQuery));

    // Compare the results here
    if (JSON.stringify(postgresqlResult) === JSON.stringify(mongodbResult)) {
      console.log(`Query in file ${file} returned the same results.`);
    } else {
      console.error(`Query in file ${file} returned different results.`);
    }
  });
}

executeQueries();

