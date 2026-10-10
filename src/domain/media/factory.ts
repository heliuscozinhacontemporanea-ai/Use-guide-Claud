import { ApiProfileMediaAdapter } from './adapters/apiProfileMediaAdapter';
import { ProfileMediaPort } from './ports/profileMediaPort';
import { CloudinaryAdapter } from './adapters/cloudinaryAdapter';
import { ImageUploadPort } from './ports/imageUploadPort';

export const profileMediaAdapter: ProfileMediaPort = new ApiProfileMediaAdapter();
export const imageUploadAdapter: ImageUploadPort = new CloudinaryAdapter();
