// If we directly upload images in database it gets slow hence uploading in cloudinary and sending the url. 

import { v2 as cloudinary } from "cloudinary"

import fs from "fs"


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // Uploading file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //message to indicate succussful operation
        // console.log("File successfully uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        // remove the uploaded file as the operation failed
        fs.unlinkSync(localFilePath)
        return null
    }
}


export { uploadOnCloudinary }