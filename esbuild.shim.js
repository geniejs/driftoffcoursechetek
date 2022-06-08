import { Buffer as NBuffer } from 'buffer'
import fetchAdapt from '@vespaiach/axios-fetch-adapter';
export const Buffer = NBuffer;

export const nextTick = setTimeout;
export const fetchAdapter = fetchAdapt;