const pgp = require('pg-promise')();
const fs = require('fs');
const path = require('path'); // For working with file paths

// PostgreSQL database connection details
const dbConfig = {
    user: 'santiago',
    password: '',
    host: 'localhost',
    port: 5432,
    database: 'bdii_tpo',
};

// Create a PostgreSQL database connection
const db = pgp(dbConfig);

// List of tables you want to export data from
const tablesToExport = ['e01_cliente',
    'e01_detalle_factura',
    'e01_factura',
    'e01_producto',
    'e01_telefono'];

// output dir
const outputDir = './tsv_output';

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true }); // recursive: true will create parent directories if needed
}

(async () => {
    try {
        for (const table of tablesToExport) {
            // Fetch data and column names from the table
            const data = await db.any(`SELECT * FROM ${table}`);
            const columns = Object.keys(data[0]);

            // Create an array to store rows including the header row
            const rows = [columns.join('\t')];

            // Add data rows to the array
            data.forEach(row => {
                rows.push(columns.map(column => row[column]).join('\t'));
            });

            // Convert data to TSV format
            const tsvData = rows.join('\n');

            // Construct the file path with the output directory
            const filePath = path.join(outputDir, `${table}.tsv`);

            // Write TSV data to the file
            fs.writeFileSync(filePath, tsvData, 'utf-8');

            console.log(`Data from ${table} exported to ${filePath}`);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the database connection
        pgp.end();
    }
})();
