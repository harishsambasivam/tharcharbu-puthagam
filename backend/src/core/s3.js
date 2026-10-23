import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Without this, SDK >=3.729 bakes a CRC32 of an empty body into presigned URLs, so real uploads fail
const s3 = new S3Client({ requestChecksumCalculation: 'WHEN_REQUIRED' })

export const presignUpload = (key, contentType) =>
  getSignedUrl(s3, new PutObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: key, ContentType: contentType }), {
    expiresIn: 300,
  })
