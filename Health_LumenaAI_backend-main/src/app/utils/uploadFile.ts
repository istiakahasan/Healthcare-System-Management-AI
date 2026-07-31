export const getImageUrl = async (file: Express.MulterS3.File) => {
  let image = file?.location;
  console.log(file);
  console.log(image);

  if (!image || !image.startsWith("http")) {
    // image = `https://${config.S3.bucketName}.nyc3.digitaloceanspaces.com/${file?.key}`;
    image = `https://mycvconnect.s3.eu-north-1.amazonaws.com/${file?.key}`;
  }

  return image;
};
