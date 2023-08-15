import { google, Auth } from "googleapis";
import { SPREADSHEET_ID } from "./config.js";

export const validateSheet = async (timestamp: string, auth: Auth.JWT) => {
	const sheetTitle = formatSheetTitle(timestamp)
	const sheets = google.sheets({ version: 'v4', auth });
	try {
		const response = await sheets.spreadsheets.get({
			spreadsheetId: SPREADSHEET_ID,
		});
		const sheetsMetadata = response.data.sheets;
		const foundSheet = sheetsMetadata.find(sheet => sheet.properties.title === sheetTitle);
		if (foundSheet) {
			// if sheet exists, return title
			console.log(`Sheet "${sheetTitle}" found. Sheet ID: ${foundSheet.properties.sheetId}`);
			return foundSheet.properties.title
		} else {
			// create new sheet and return title
			console.log(`Sheet "${sheetTitle}" not found.`);
			await createNewSheet(sheetTitle, sheets);
			return sheetTitle

		}
	} catch (error) {
		console.error('Error searching for sheet: ', error);
	}
}



const createNewSheet = async (sheetTitle, sheets) => {
	const TEMPLATE_SHEET_ID = 0;
	const NEW_SHEET_TITLE = sheetTitle;

	try {
		const response = await sheets.spreadsheets.sheets.copyTo({
			spreadsheetId: SPREADSHEET_ID,
			sheetId: TEMPLATE_SHEET_ID,
			requestBody: {
				destinationSpreadsheetId: SPREADSHEET_ID,
			},
		});

		const newSheetId = response.data.sheetId;
		console.log('New sheet duplicated:', newSheetId);

		// Update the title of the new sheet
		await sheets.spreadsheets.batchUpdate({
			spreadsheetId: SPREADSHEET_ID,
			requestBody: {
				requests: [
					{
						updateSheetProperties: {
							properties: {
								sheetId: newSheetId,
								title: NEW_SHEET_TITLE,
							},
							fields: 'title',
						},
					},
				],
			},
		});

		console.log('New sheet title updated: ', NEW_SHEET_TITLE);
	} catch (err) {
		console.error('Error duplicating sheet: ', err);
	}
}

const formatSheetTitle = (input: string) => {
	const date = new Date(input)
	const month = date.toLocaleString('en-AU', { month: 'long' });
	const year = date.getFullYear();
	return `${month} ${year}`;
}