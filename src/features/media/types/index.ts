/**
 * Dữ liệu chữ ký cấp quyền tải lên từ Backend LEBY.
 */
export interface MediaUploadSignature {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    expiresIn: number;
}

/**
 * Payload gửi về Backend để lưu thông tin media vào cơ sở dữ liệu ở trạng thái PENDING.
 */
export interface SaveMediaRequest {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
}

/**
 * Đối tượng Media chính thức do Backend LEBY phản hồi.
 */
export interface SavedMedia {
    id: number;
    publicId: string;
    url: string;
    resourceType: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    status: 'PENDING' | 'ACTIVE';
}

/**
 * Dữ liệu thô trả về trực tiếp từ Cloudinary API sau khi hoàn thành upload.
 */
export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    format: string;
    resource_type: string;
    bytes: number;
    width?: number;
    height?: number;
    tags?: string[];
}
