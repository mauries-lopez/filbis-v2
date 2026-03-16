'use client'

import { HTMLAttributes, useEffect, useRef, useState } from 'react'
import { useChatActions, useIsMuted, usePrompt, useVoice } from './store'
import { getSpeechToken } from '../api/auth/ttsauth';
import {
	SpeakerHigh
} from '@phosphor-icons/react'
import axios from "axios";

type PromptMessageProps = {
	prompt: string
	voice?: string
} & HTMLAttributes<HTMLParagraphElement>

export function PromptMessage({ prompt, voice, ...props }: PromptMessageProps) {
	const storedPrompt = usePrompt()
	const storedVoiceName = useVoice()
	const isMuted = useIsMuted()
	const { setPrompt, setVoice } = useChatActions()
	const player = useRef<HTMLAudioElement>(null)
	// const storedVoice = '/assets/audio_files/E146.mp3';

	const [voices, setVoices] = useState([]);
	const [selectedVoice, setSelectedVoice] = useState(null);
	const [englishVoice, setEnglishVoice] = useState(null);
	

	const [text, setText] = useState("HELLO!!!");
	const [audioUrl, setAudioUrl] = useState(null);
	const [audioElement, setAudioElement] = useState(new Audio());

	const [isTalking, setTalking] = useState(false);

	const apiKey = getSpeechToken();

	const synthesizeSpeech = async (textToConvert: string, language: string) => {
		const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
		setText(textToConvert);
		let voice: object;
		if(language === "english")
			voice = { languageCode: "en-US", name: "en-US-Journey-O"} //English
		else
			voice = { languageCode: "fil-PH", name: "fil-PH-Wavenet-A" } // Filipino voice, this will not be active if it's cebuano

		const requestData = {
		  input: { text },
		  voice,
		  audioConfig: { audioEncoding: "MP3" },
		};
	
		try {
		  const response = await axios.post(url, requestData);
		  const audioContent = response.data.audioContent;
		  audioElement.src = `data:audio/mp3;base64,${audioContent}`;
		  audioElement.play()
					.then(() => {console.log("started talking"); setTalking(true)})
					.catch((error) => console.log('Error playing audio:', error));
		} catch (error) {
		  console.error("Error synthesizing speech:", error);
		}
	}

	useEffect(() => {
		setPrompt(prompt);
		setVoice(voice);
	  }, [prompt, voice]);

	useEffect(() => {
		console.log("Text is: " + storedPrompt);
		if (!storedPrompt.toUpperCase().includes("LOADING...")) {
			console.log("INIT: " + typeof(storedPrompt) +  ": " + storedPrompt);
			setText(storedPrompt);
		}
		// Deprecated: Uses pre-existing MP3 files and plays them
		// if (storedVoiceName && !isMuted) {
		// 	const fetchAudio = async () => {
		// 	const extensions = ['.wav']; // List of possible extensions
		// 	let audioSource = '';
		// 	for (const ext of extensions) {
		// 		try {
		// 		const response = await fetch(`${storedVoiceName}${ext}`);
		// 		if (response.ok) {
		// 			audioSource = `${storedVoiceName}${ext}`;
		// 			break;
		// 		}
		// 		} catch (error) {
		// 		// console.error('Error fetching audio:', error);
		// 		}
		// 	}
		// 	if (audioSource) {
		// 		player.current?.setAttribute('src', audioSource);
		// 		player.current?.load();
		// 		player.current?.play().catch((error) => console.error('Error playing audio:', error));
		// 	} else {
		// 		// console.error('No audio source found');
		// 	}
		// 	};
		// 	fetchAudio();
		// }
	}, [storedVoiceName, storedPrompt]);

	useEffect(() => {
		if (!isMuted) {
			console.log("USE-EFFECT: " + typeof(text) +  ": " + text);
			let language : string = document.cookie.replace(/.*lang=(cebuano|filipino|english).*/g, "$1");
			if(language !== "cebuano")
				synthesizeSpeech(text, language);			
			else{
				if (storedVoiceName && !isMuted) {
					const fetchAudio = async () => {
						const extensions = ['.wav']; // List of possible extensions
						let audioSource = '';
						for (const ext of extensions) {
							try {
								const response = await fetch(`${storedVoiceName}${ext}`);
								if (response.ok) {
									audioSource = `${storedVoiceName}${ext}`;
									break;
								}
								} catch (error) {
									console.error('Error fetching audio:', error);
								}
							}
							if (audioSource) {
								audioElement.setAttribute('src', audioSource);
								audioElement.load();
								audioElement.play()
										.then(() => {console.log("started talking"); setTalking(true)})
										.catch((error) => console.error('Error playing audio:', error));
							} else {
								console.error('No audio source found');
							}
							};
							fetchAudio();
						}
			}
		}
	}, [text, isMuted])
	
	useEffect(() => {
		if (audioElement) audioElement.volume = isMuted ? 0 : 1
	}, [isMuted])

	useEffect(() => {
		let sentry = setInterval(() => {
			if(audioElement.ended){
				setTalking(false);
				clearInterval(sentry);
			}
		}, 500);
	},[isTalking]);

	return (
		<>
			<p {...props}>{storedPrompt}</p>
			<audio ref={player}></audio>
			{ isTalking ? <SpeakerHigh size={64} /> : <></>}
		</>
	)
}

