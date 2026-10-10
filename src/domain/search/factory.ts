import { LocalSearchAdapter } from './adapters/localSearchAdapter';
import { SearchPort } from './ports/searchPort';

export const searchAdapter: SearchPort = new LocalSearchAdapter();
