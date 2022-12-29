import { Client, Databases } from 'appwrite'
import EventEmitter from 'events';
import { Sipapu } from 'sipapu'

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            REACT_APP_TAWA_URL: string;
            REACT_APP_SUPABASE_URL: string;
            REACT_APP_SUPABASE_KEY: string;
            REACT_APP_TOKEN_REFRESH_URL: string;
            REACT_APP_APPWRITE_URL: string;
            REACT_APP_APPWRITE_PROJECT: string;
            REACT_APP_APPWRITE_REALTIME: string;
        }
    }

    interface Window {
        sipapu: Sipapu;
        api: Client;
        db: Databases;
        accountEvents: EventEmitter;
    }
}

export {}