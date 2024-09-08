import { v2 as cloudinary } from "cloudinary"; // Store the photos, videos, or avatars
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new Error("No file path provided");

    console.log("Uploading file: ", localFilePath);

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Remove the local file after uploading to Cloudinary
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    
    // Remove the local file in case of an error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

// Delete a file from Cloudinary
const deleteFromCloudinary = async (url) => {
  try {
    if (!url) throw new Error("No URL provided");

    // Extract the public ID from the Cloudinary URL
    const publicId = url.split('/').slice(-1)[0].split('.')[0];

    // Delete the image by its public ID
    const deletionResponse = await cloudinary.uploader.destroy(publicId);

    return deletionResponse;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
