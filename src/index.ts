import fs from "fs";
import { google } from "googleapis";

import { SpeedtestResults } from "./types.js";
import { runSpeedtest } from "./runSpeedtest.js";
import { validateSheet } from "./validateSheet.js";
import { appendToSheet } from "./appendToSheet.js";
import { bytesToMbps } from "./helpers/bytesToMbps.js";
import { formatDateTime } from "./helpers/formatDateTime.js";

const CREDENTIALS_PATH = `${process.cwd()}/credentials.json`;


// Load credentials from the service account JSON file
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
console.log(credentials.client_email);
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const main = async () => {
  console.log(CREDENTIALS_PATH)
  try {
    const speedtestResult = await runSpeedtest();
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
    const sheetName = await validateSheet(result.timestamp, auth)

    await appendToSheet(row, sheetName, auth);
  } catch (error) {
    console.error(
      "Error running speedtest or appending to Google Sheet:",
      error
    );
  }
};

main()