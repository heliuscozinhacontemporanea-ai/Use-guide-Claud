import { ApiClimaWindAdapter } from './adapters/apiClimaWindAdapter';
import { ClimaWindPort } from './ports/climaWindPort';

export const climaWindAdapter: ClimaWindPort = new ApiClimaWindAdapter();
