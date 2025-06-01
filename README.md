# Notion CSV to Database
Create a Notion database from a CSV file.

## Features
- Dynamically maps CSV headers to Notion table columns.
- Select CSV files via a GUI dialog.
- Creates a database in a user-specified Notion page.
- Free for basic use.

## Setup
1. Install Node.js from [nodejs.org](https://nodejs.org/en/download) if you don't have it installed already.
2. To use this program, you will need to have an Integration set up on your Notion account [here](https://www.notion.so/profile/integrations).
   - If you are not logged into Notion already, please log into your account from the link above.
   - On the left side menu, click the account drop-down arrow on the top and then click <i>Settings</i>.
   - On the popup's left side menu, click on <i>Connections</i> near the bottom, then click the <i>Develop or manage integrations</i> link.
   - Click the <i>New integration</i> button, enter the information required, click <i>Save</i>, then click the <i>Configure integration settings</i> button on the popup.
   - The <b>Internal Integration Secret</b> is the API key you will need in later steps.
3. You will also need a Page for these databases to be created under.
   - Once logged into Notion, create a new Page and name it anything you like.
   - To get the Page's ID, go into the Page and click the <i>Share</i> button on the top right.
   - Click the <i>Copy link</i> button and paste it any place that you can see the URL.
   - ![NotionURLPageID](/public/NotionURLPageID.png)
   > The underlined portion of the image above is the 32 character Page ID.
4. Clone this repo and run `npm install` (for Windows users try `npm run install`).
5. Open this project in your favorite IDE.
6. Enter your Notion API Key ("Internal Integration Secret") and the Notion Page ID into the `.env` file.
7. Run `npm start` to run the program!

## Premium
Premium features are in the works for this program (e.g., a Google Sheets integration). Once they are, I will have them available for $20 on [Gumroad](https://gumroad.com) and [CodeCanyon](https://codecanyon.net).

## License
MIT License for personal use.