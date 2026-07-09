import type { UniqueOverloads } from './types';
import { invokeUniqueCall } from './invoke-call';

export const unique = invokeUniqueCall as UniqueOverloads;
