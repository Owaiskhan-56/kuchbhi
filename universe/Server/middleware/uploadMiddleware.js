import multer from "multer";

//Keep the file in memory, then send it to Cloudinary
const storage = multer.memoryStorage();
 
const fileFilter = (req, file, cd) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, //5 MB
});