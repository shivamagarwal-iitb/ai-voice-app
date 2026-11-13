import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState} from 'react-native';
import {createClient} from '@supabase/supabase-js';

export const supabase=createClient('https://jurgczlsxiqxradguouz.supabase.co',"sb_publishable_rI24QvnJNrH9vt-iKK7EuA_DQKC1qmC",{auth:{storage:AsyncStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}});
AppState.addEventListener('change',state=>{if(state==='active')supabase.auth.startAutoRefresh();else supabase.auth.stopAutoRefresh();});
export const API_URL='https://ai-voice-app-api.onrender.com';
