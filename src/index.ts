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
    const speedtestResult: SpeedtestResults = await runSpeedtest().then(async (res) => {
      console.log("=====")
      console.log(res)
      console.log("=====")
      return await JSON.parse(res)
    })
    // const result: SpeedtestResults = await JSON.parse(speedtestResult);
    const { date, time } = formatDateTime(speedtestResult.timestamp)
    const row = [
      JSON.stringify(speedtestResult),
      speedtestResult.result.id,
      speedtestResult.result.url,
      date,
      time,
      speedtestResult.server.name,
      speedtestResult.server.location,
      speedtestResult.isp,
      `${Math.round(speedtestResult.ping.latency)}ms`,
      bytesToMbps(speedtestResult.download.bandwidth),
      bytesToMbps(speedtestResult.upload.bandwidth),
      `${speedtestResult.packetLoss}%`,
    ]
    console.log('Validating sheet name')
    const sheetName = await validateSheet(speedtestResult.timestamp, auth)
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