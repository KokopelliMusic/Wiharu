import { Sipapu } from 'sipapu'

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            REACT_APP_TAWA_URL: string;
            REACT_APP_SUPABASE_URL: string;
            REACT_APP_SUPABASE_KEY: string;
        }
    }

    interface Window {
        sipapu: Sipapu;
    }
}

export {}