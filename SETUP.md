# Syndio Setup Guide

## 1. Google Sheets Setup

### Create the Spreadsheet
1. Go to sheets.google.com
2. Create a new blank spreadsheet
3. Name it "Syndio Database"
4. Copy the spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit`

### Create a Google Cloud Service Account
1. Go to console.cloud.google.com
2. Create a new project (or use existing)
3. Enable the Google Sheets API:
   - Go to APIs & Services → Library
   - Search "Google Sheets API" → Enable
4. Create a Service Account:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "Service Account"
   - Name: "fiverr-ops-sheets"
   - Click Create → Done
5. Create a key:
   - Click on your new service account
   - Go to "Keys" tab
   - Add Key → Create new key → JSON
   - Download the JSON file
6. Share your spreadsheet with the service account:
   - Open the JSON file, copy the `client_email` value
   - Open your Google Sheet
   - Click Share → paste the service account email → Editor → Share

### Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in:
- `GOOGLE_SPREADSHEET_ID`: from the spreadsheet URL
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: the `client_email` from the JSON key file
- `GOOGLE_PRIVATE_KEY`: the `private_key` from the JSON key file (keep the quotes and \n characters)

## 2. Initialize the Database
After setting up env vars, run:
```
npm run dev
```
Then visit: `http://localhost:3000/api/sheets/init`

This creates all the sheet tabs with correct headers and seeds default templates.

## 3. Other API Keys
- `ANTHROPIC_API_KEY`: from console.anthropic.com
- `APP_PASSWORD`: set any password you want to use to log in
- `JWT_SECRET`: generate a random 32+ char string
- `SCRAPINGBEE_API_KEY`: optional, from scrapingbee.com
- `TAVILY_API_KEY`: optional, from tavily.com

## 4. Start the App
```
npm run dev
```
Visit http://localhost:3000 — you'll be redirected to login.
