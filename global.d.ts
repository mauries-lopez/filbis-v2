import { LogLevel } from './lib/logger'

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			GOOGLE_CLIENT_ID: string
			GOOGLE_CLIENT_SECRET: string
			SECRET: string
			CX_CLIENT_EMAIL: string
			CX_CLIENT_KEY: string
			CX_PROJECT_ID: string
			CX_BOT_ID: string
			LOG_LEVEL?: LogLevel
			ASR_API: string
			REACT_APP_SPEECH_API?: string
		}
	}
}

export {}
