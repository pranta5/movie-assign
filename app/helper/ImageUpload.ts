import dotenv from "dotenv";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "movie_images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  } as {
    folder: string;
    allowed_formats: string[];
    transformation: { width: number; height: number; crop: string }[];
  },
});

const ImageUpload = multer({ storage });

export default ImageUpload;
