import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

export const upload = multer({
	storage,
	limits: { fileSize: 10000000 },
    fileFilter : (req,file,cb) => {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' ){
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    }
});
