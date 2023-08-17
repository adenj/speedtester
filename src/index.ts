import fs from "fs";
import { auth as googleAuth, sheets } from '@googleapis/sheets'

import { SpeedtestResults } from "./types.js";
import { runSpeedtest } from "./runSpeedtest.js";
import { validateSheet } from "./validateSheet.js";
import { appendToSheet } from "./appendToSheet.js";
import { bytesToMbps } from "./helpers/bytesToMbps.js";
import { formatDateTime } from "./helpers/formatDateTime.js";


const main = async () => {
  const CREDENTIALS_PATH = `${process.cwd()}/credentials.json`;

  // Load credentials from the service account JSON file
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const auth = new googleAuth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  try {
    console.log('Running speedtest...')
    const speedtestResult = await runSpeedtest();
    console.log('Parsing speedtest results')
    const result: SpeedtestResults = JSON.parse(speedtestResult);
    const { date, time } = formatDateTime(result.timestamp)
    const row = [
      speedtestResult,
      result.result.id,
      result.result.url,
      date,
      time,
      result.server.name,
      result.server.location,
      result.isp,
      `${Math.round(result.ping.latency)}ms`,
      bytesToMbps(result.download.bandwidth),
      bytesToMbps(result.upload.bandwidth),
      `${result.packetLoss}%`,
    ]
    console.log('Validating sheet name')
    const sheetName = await validateSheet(result.timestamp, auth)
    console.log('Appending to sheet')
    await appendToSheet(row, sheetName, auth);
  } catch (error) {
    console.error(
      "Error running speedtest or appending to Google Sheet:",
      error
    );
  }
};

main()