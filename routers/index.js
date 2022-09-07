const router = require("express").Router();
const { google } = require("googleapis");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sha1 = require("sha1");

const port = 4000;
const folderPathName = "uploads";

//Upload usando Multer
const storage = multer.diskStorage({
	destination: `./public/${folderPathName}/`,
	filename: function (req, file, cb) {
		const name = sha1(
			`${Date.now()}+${process.env.SECRET_KEY}${file.originalname}`
		);
		cb(null, "arquivo-" + name + path.extname(file.originalname));
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 1000000 },
}).single("arquivo");

const authenticateGoogle = () => {
	const auth = new google.auth.GoogleAuth({
		keyFile: `./keys.json`,
		scopes: "https://www.googleapis.com/auth/drive",
	});
	return auth;
};

const uploadToGoogleDrive = async (file, auth) => {
	const fileMetadata = {
		name: file.filename,
		parents: [process.env.FOLDER], // Change it according to your desired parent folder id
	};

	const media = {
		mimeType: file.mimetype,
		body: fs.createReadStream(file.path),
	};

	const driveService = google.drive({ version: "v3", auth });

	const response = await driveService.files.create({
		requestBody: fileMetadata,
		media: media,
		fields: "id",
	});
	return response;
};

router.post("/upload", upload, async (request, response) => {
	const auth = authenticateGoogle();
	const res = await uploadToGoogleDrive(request.file, auth);
	deleteFile(request.file.path);
	response.json({
		nome: `${request.file.filename}`,
		url: `https://drive.google.com/uc?export=view&id=${res.data.id}`,
	});
});

const deleteFile = (filePath) => {
	fs.unlink(filePath, () => {
		console.log("file deleted");
	});
};

module.exports = router;
