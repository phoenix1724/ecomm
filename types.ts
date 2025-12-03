export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: 'Food' | 'Fashion';
  tags: string[];
  description: string;
  image: string;
}

export interface RecommendedProduct extends Product {
  matchScore: number;
  reason: string;
}

export interface WebResult {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  recommendations?: RecommendedProduct[];
  webResults?: WebResult[];
  isThinking?: boolean;
  image?: string; // Base64 image data
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserPreferences {
  budget?: number;
  dietary?: string[];
  style?: string[];
}

export type Mood = 'Happy' | 'Stressed' | 'Energetic' | 'Lazy' | 'Party' | 'Professional';