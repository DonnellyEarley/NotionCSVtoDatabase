const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { Client } = require('@notionhq/client');
const { app, dialog } = require('electron');
require('dotenv').config();

//Sets the necesarry Token & ID required from the .env
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID;

//Validates if the config has a token or id set
if (!NOTION_TOKEN || !NOTION_PAGE_ID) {
  console.error('Error :: Missing necessary information. In the .env file, please set the NOTION_TOKEN equal to your Notion account\'s secret key and set the NOTION_PAGE_ID to a page\'s ID you have created in Notion. See README for more details.');
  process.exit(1);
}

//Notion client
const notion = new Client({ auth: NOTION_TOKEN });

/**
 * Creates a new Notion database with dynamic properties based on CSV headers (first row)
 * @param {string[]} headers - CSV column names
 * @param {string} parentPageId - ID of the parent page
 * @returns {Promise<string>} - ID of the created database
 */
async function createDynamicDatabase(headers, csvFilePath) {
  try {
    if (!headers || headers.length === 0) {
      throw new Error('CSV file must have at least one column header');
    }

    const properties = {};
    headers.forEach((header, index) => {
      properties[header] = {
        type: index === 0 ? 'title' : 'rich_text',
        [index === 0 ? 'title' : 'rich_text']: {}
      };
    });

    const response = await notion.databases.create({
      parent: { type: "page_id", page_id: NOTION_PAGE_ID },
      title: [
        {
          type: "text",
          text: {
            content: `${path.basename(csvFilePath)} Table - Created by NotionFlow`,
          },
        },
      ],
      properties,
    });
    const databaseId = response.id;
    console.log(`Created database :: ID = ${databaseId}`);
    return databaseId;
  } catch (error) {
    console.error('Error creating database :: ', error.message);
    throw error;
  }
}

/**
 * Adds a row to the newly created Notion database
 * @param {string} databaseId - ID of the Notion database
 * @param {Object} row - CSV row data
 * @param {string[]} headers - CSV column names
 */
async function addRowToDatabase(databaseId, row, headers) {
  try {
    const properties = {};
    headers.forEach((header, index) => {
      const value = row[header] || '';
      properties[header] = {
        [index === 0 ? 'title' : 'rich_text']: [
          {
            type: 'text',
            text: { content: value }
          }
        ]
      };
    });

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties
    });
    console.log(`Added row :: ${row[headers[0]] || 'Untitled'}`);
    return response;
  } catch (error) {
    console.error(`Error adding row "${row[headers[0]] || 'Untitled'}" :: `, error.message);
  }
}

/**
 * Prompts the user to select a CSV file using Electron dialog
 * @returns {Promise<string>} - Path to selected CSV file
 */
async function selectCsvFile() {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'CSV Files', extensions: ['csv'] }
      ]
    });
    if (result.canceled) {
      throw new Error('File selection canceled');
    }
    const filePath = result.filePaths[0];
    if (!filePath.endsWith('.csv')) {
      throw new Error('Please select a .csv file');
    }
    return filePath;
  } catch (error) {
    console.error('Error selecting file :: ', error.message);
    throw error;
  }
}

/**
 * Process the CSV data, creates the new Notion database, and adds the rows to it
 * @param {string} csvFilePath - Path to CSV file
 */
async function importFromCsv(csvFilePath) {
  try {
    let headers = [];
    const rows = [];
    let rowCount = 0;

    const parser = fs.createReadStream(csvFilePath).pipe(parse({ columns: true, trim: true, skip_empty_lines: true }));

    parser.on('readable', () => {
      let row;
      while ((row = parser.read()) !== null) {
        if (!headers.length) {
          headers = Object.keys(row);
          if (headers.length === 0) {
            throw new Error('CSV file must have at least one column header');
          }
        }
        rows.push(row);
      }
    });

    parser.on('end', async () => {
      if (!rows.length) {
        console.error('Error :: CSV file is empty or contains no valid data');
        app.quit();
        return;
      }

      //Creates the database
      const databaseId = await createDynamicDatabase(headers, csvFilePath);

      //Adds all the data into rows
      for (const row of rows) {
        await addRowToDatabase(databaseId, row, headers);
        rowCount++;
      }

      console.log(`CSV processing complete! ${rowCount} rows added to Notion table.`);
      app.quit();
    });

    parser.on('error', (error) => {
      console.error('Error reading CSV :: ', error.message);
      app.quit();
      throw error;
    });
  } catch (error) {
    console.error('Failed to process CSV :: ', error.message);
    app.quit();
    throw error;
  }
}

//Main function that starts the whole process
async function main() {
  try {
    const csvFilePath = await selectCsvFile();
    await importFromCsv(csvFilePath);
  } catch (error) {
    console.error('Error :: ', error.message);
    app.quit();
  }
}

app.whenReady().then(main);
