import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

/**
 * Configure Cloudinary lazily to ensure env vars are loaded
 */
function ensureConfig() {
    if (!isConfigured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });
        isConfigured = true;
    }
}

/**
 * Check if Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
    return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
}

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

export interface UploadOptions {
    folder?: string;
    transformation?: Array<{
        width?: number;
        height?: number;
        crop?: string;
        quality?: string | number;
        fetch_format?: string;
    }>;
}

/**
 * Upload an image to Cloudinary
 * @param fileBuffer - The file buffer to upload
 * @param options - Upload options
 * @returns The upload result with image URL and metadata
 */
export async function uploadImage(
    fileBuffer: Buffer,
    options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
    ensureConfig();

    const { folder = 'treekart/trees' } = options;

    // Convert buffer to base64 data URI for more reliable upload
    const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

    try {
        const result = await cloudinary.uploader.upload(base64Data, {
            folder,
            resource_type: 'image',
            // Automatic optimization
            transformation: [
                {
                    quality: 'auto',
                    fetch_format: 'auto',
                },
                // Limit max size
                {
                    width: 1200,
                    height: 1200,
                    crop: 'limit',
                },
            ],
            // Generate eager transformations for thumbnails (async)
            eager: [
                { width: 400, height: 400, crop: 'fill', quality: 'auto' },
                { width: 800, height: 800, crop: 'fill', quality: 'auto' },
            ],
            eager_async: true,
        });

        return result as CloudinaryUploadResult;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
    ensureConfig();
    await cloudinary.uploader.destroy(publicId);
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        // Find 'upload' in path and get everything after version
        const uploadIndex = pathParts.indexOf('upload');
        if (uploadIndex === -1) return null;

        // Skip version (v1234567890) if present
        let startIndex = uploadIndex + 1;
        if (pathParts[startIndex]?.startsWith('v')) {
            startIndex++;
        }

        // Get remaining path without extension
        const publicIdPath = pathParts.slice(startIndex).join('/');
        return publicIdPath.replace(/\.[^/.]+$/, ''); // Remove file extension
    } catch {
        return null;
    }
}

/**
 * Get optimized URL with transformations
 */
export function getOptimizedUrl(
    publicId: string,
    options: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string;
    } = {}
): string {
    ensureConfig();
    const { width = 800, height = 800, crop = 'fill', quality = 'auto' } = options;

    return cloudinary.url(publicId, {
        transformation: [
            {
                width,
                height,
                crop,
                quality,
                fetch_format: 'auto',
            },
        ],
        secure: true,
    });
}

export default cloudinary;