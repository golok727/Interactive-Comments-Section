import cp from "child_process";
import fs from "fs";

let server = cp.fork("./test.mjs");

fs.watchFile("./text.mjs", (event, filename) => {
	server.kill();
	console.log("Restarting the server");
	server = cp.fork("./test.mjs");
});

process.on("SIGINT", () => {
	server.kill();
	fs.unwatchFile("./test.mjs");
	process.exit();
});
