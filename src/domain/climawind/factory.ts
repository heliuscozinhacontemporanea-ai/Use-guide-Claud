import { ApiClimaWindAdapter } from './adapters/apiClimaWindAdapter';
import { ApiWindForecastAdapter } from './adapters/apiWindForecastAdapter';
import type { ClimaWindPort } from './ports/climaWindPort';
import type { WindForecastPort } from './ports/windForecastPort';

export const climaWindAdapter: ClimaWindPort = new ApiClimaWindAdapter();
export const windForecastAdapter: WindForecastPort = new ApiWindForecastAdapter();
