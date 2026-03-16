export const ttsAuth = {
    secret: process.env.REACT_APP_SPEECH_API,
}

export function getSpeechToken(){
    return process.env.NEXT_PUBLIC_SPEECH_KEY as string
}