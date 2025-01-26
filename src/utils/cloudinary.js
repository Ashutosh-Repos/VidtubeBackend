import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


//configuration cloudinary


const uploadOnCloudinary = async (localFilePath) => {
    try {
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_SECRET // Click 'View API Keys' above to copy your API secret
        });
        if (!localFilePath) return null

        console.log(process.env.CLOUDINARY_CLOUD_NAME,process.env.CLOUDINARY_API_KEY,process.env.CLOUDINARY_SECRET);
        //upload the file on cloudinary
        console.log(localFilePath)
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        }).catch((error) => {
            console.log(error);
        });
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log(error);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const removeFromCloudinary = async(cloudinaryUrl) => {
    try {
        if (!localFilePath) return null
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_SECRET // Click 'View API Keys' above to copy your API secret
        });
        console.log(process.env.CLOUDINARY_CLOUD_NAME,process.env.CLOUDINARY_API_KEY,process.env.CLOUDINARY_SECRET);
        console.log("comming")
        //upload the file on cloudinary
        console.log(localFilePath)

        cloudinary.uploader.destroy(cloudinaryUrl).then(result => console.log(result));

        console.log("file is removed");

    } catch (error) {
        //console.log(error);
        return null;
    }
}

export {uploadOnCloudinary,removeFromCloudinary}