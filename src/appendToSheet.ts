import google from "@googleapis/sheets";
import { SPREADSHEET_ID } from "./config.js";

// Add to google sheet
export const appendToSheet = async (data: (string | number)[], sheetName: string, auth) => {
	const sheets = google.sheets({ version: "v4", auth });
	const valueInputOption = "RAW";
	const insertDataOption = "INSERT_ROWS";

	const resource = {
		values: [data],
	};

	try {
		const response = await sheets.spreadsheets.values.append({
			spreadsheetId: SPREADSHEET_ID,
			range: `${sheetName}!A2`,
			valueInputOption,
			insertDataOption,

			requestBody: resource,
		});
		console.log(`${response.data.updates.updatedCells} cells appended.`);
	} catch (error) {
		console.log(error);
	}
};
