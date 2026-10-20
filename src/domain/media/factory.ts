import { ApiProfileMediaAdapter } from './adapters/apiProfileMediaAdapter';
import { ProfileMediaPort } from './ports/profileMediaPort';
import { ApiImageUploadAdapter } from './adapters/apiImageUploadAdapter';
import { ImageUploadPort } from './ports/imageUploadPort';

export const profileMediaAdapter: ProfileMediaPort = new ApiProfileMediaAdapter();
export const imageUploadAdapter: ImageUploadPort = new ApiImageUploadAdapter();
import { ApiVerificationFileAdapter } from './adapters/apiVerificationFileAdapter';
import type { VerificationFilePort } from './ports/verificationFilePort';

export const verificationFileAdapter: VerificationFilePort = new ApiVerificationFileAdapter();
