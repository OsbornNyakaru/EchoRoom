import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAnonymousUserName(): string {
  const adjectives = [
    "Silent", "Whispering", "Echoing", "Hidden", "Mystic", "Gentle", "Brave", "Calm", "Wise", "Vivid",
    "Shy", "Bold", "Dreamy", "Sparkling", "Quiet", "Luminous", "Serene", "Fleeting", "Ancient", "Future"
  ];
  const nouns = [
    "Traveler", "Seeker", "Listener", "Dreamer", "Wanderer", "Observer", "Stargazer", "Echo", "Shadow", "Spirit",
    "Voyager", "Guardian", "Pioneer", "Reflector", "Enigma", "Whisper", "Phantom", "Oracle", "Nomad", "Architect"
  ];

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(100 + Math.random() * 900); // 3-digit number

  return `${randomAdjective}${randomNoun}${randomNumber}`;
} 