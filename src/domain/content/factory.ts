import { ApiContentAdapter } from './adapters/apiContentAdapter';
import { GetAppVersionUseCase } from './application/usecases/getAppVersionUseCase';

const contentAdapter = new ApiContentAdapter();
export const getAppVersionUseCase = new GetAppVersionUseCase(contentAdapter);
