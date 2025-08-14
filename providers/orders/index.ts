import { ENV } from '@/lib/config/env';
import mockProvider from './mock';
import supabaseProvider from './supabase';
import type { IOrdersProvider } from './types';

export const ordersProvider: IOrdersProvider = ENV.MOCK_MODE
  ? mockProvider
  : supabaseProvider;

export type { IOrdersProvider };
