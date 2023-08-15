import childProcess from "child_process";

export const runSpeedtest = async () => {
	return new Promise<string>((resolve, reject) => {
		childProcess.exec(
			"speedtest --accept-license --accept-gdpr -f json-pretty",
			(error, stdout, stderr) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(stdout);
			}
		);
	});
};
