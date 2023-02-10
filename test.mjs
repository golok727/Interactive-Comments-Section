import http from "http";
import url from "url";
import path from "path";
import fs from "fs/promises";

const port = 5000;

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const listener = async (req, res) => {
	const html = await fs.readFile(__dirname + "/index.html", {
		encoding: "utf-8",
	});
	if (req.url === "/") {
		res.setHeader("Content-Type", "text/html");
		res.end(html);
	}
	const fileExtName = path.extname(req.url);
	try {
		const content = await fs.readFile(__dirname + req.url);
		res.setHeader("Content-Type", getMimeType(fileExtName));
		res.end(content);
	} catch (err) {
		if (err) {
			res.statusCode = 404;
			res.setHeader("Content-Type", "text/html");
			res.end("<h1>Not Found 404</h1>");
		}
	}
};
function getMimeType(extName) {
	const mimeTypes = {
		".html": "text/html",
		".ico": "image/x-icon",
		".jpg": "image/jpeg",
		".png": "image/png",
		".gif": "image/gif",
		".webp": "image/webp",
		".css": "text/css",
		".js": "text/javascript",
		".json": "application/json",
	};
	return mimeTypes[extName];
}
const server = http.createServer(listener);

server.listen(port, () => {
	console.log(`Server Running on port ${port}`);
});
