export type LanguageCode = 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'en';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  greeting: string;
  placeholder: string;
  speechLang: string;
}

export const LANGUAGES: Language[] = [
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    greeting:
      'नमस्ते! मैं आपका कृषि सहायक हूँ। आप अपनी फसल, मौसम, मंडी भाव या सरकारी योजना के बारे में पूछ सकते हैं।',
    placeholder: 'अपना सवाल यहाँ लिखें या माइक दबाएँ...',
    speechLang: 'hi-IN',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    greeting:
      'வணக்கம்! நான் உங்கள் விவசாய உதவியாளர். பயிர், வானிலை, சந்தை விலை அல்லது அரசு திட்டங்களைப் பற்றி கேளுங்கள்.',
    placeholder: 'உங்கள் கேள்வியை இங்கே எழுதுங்கள் அல்லது மைக்கை அழுத்துங்கள்...',
    speechLang: 'ta-IN',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    greeting:
      'నమస్కారం! నేను మీ వ్యవసాయ సహాయకుడిని. పంటలు, వాతావరణం, మార్కెట్ ధరలు లేదా ప్రభుత్వ పథకాల గురించి అడగండి.',
    placeholder: 'మీ ప్రశ్నను ఇక్కడ రాయండి లేదా మైక్ నొక్కండి...',
    speechLang: 'te-IN',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    greeting:
      'নমস্কার! আমি আপনার কৃষি সহায়ক। ফসল, আবহাওয়া, বাজারদর বা সরকারি প্রকল্প সম্পর্কে জিজ্ঞাসা করুন।',
    placeholder: 'আপনার প্রশ্ন এখানে লিখুন বা মাইকে চাপ দিন...',
    speechLang: 'bn-IN',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    greeting:
      'नमस्कार! मी तुमचा कृषी सहाय्यक आहे. पीक, हवामान, बाजारभाव किंवा सरकारी योजनांबद्दल विचारा.',
    placeholder: 'तुमचा प्रश्न येथे लिहा किंवा माइक दाबा...',
    speechLang: 'mr-IN',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    greeting:
      'Hello! I am your farming assistant. Ask me about crops, weather, mandi prices, or government schemes.',
    placeholder: 'Type your question here or tap the mic...',
    speechLang: 'en-IN',
  },
];

export const getLanguage = (code: LanguageCode): Language =>
  LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];