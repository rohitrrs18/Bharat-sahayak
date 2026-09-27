<div align="center">

# 🌾 Bharat Sahayak

### AI Farming Assistant for Bharat — in 6 Indian Languages

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-orange)](https://groq.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Talk. Snap a photo. Listen back. — All in your language.**

[🚀 Live Demo](https://bharat-sahayak.vercel.app) · [🐛 Report Bug](issues) · [💡 Request Feature](issues)

</div>

---

## 🎯 The Problem

Most AI products are built **English-first**. But a large share of India — farmers, small business owners, rural families — are more comfortable in **Hindi, Tamil, Telugu, Bengali, Marathi** or another local language.

**Millions of people are left out of what AI can already do.**

For farmers specifically, this gap costs real money:
- A crop disease identified a day late means a lost harvest.
- Not knowing today's mandi price means selling at a loss.
- Not knowing about PM-KISAN means missing free money.

**Bharat Sahayak closes this gap.**

---

## ✨ What It Does

| Feature | Description |
|---|---|
| 💬 **Multilingual chat** | Ask anything in **Hindi, Tamil, Telugu, Bengali, Marathi, or English** — get answers in the same language |
| 🎤 **Voice input** | Speak your question instead of typing — perfect for low-literacy users |
| 🔊 **Text-to-speech** | AI answers are read aloud in your language |
| 📷 **Crop disease diagnosis** | Snap a photo of a diseased leaf → get instant diagnosis + treatment plan |
| 🌦️ **Live weather** | Auto-fetches weather for the farmer's state when relevant |
| 💹 **Live mandi prices** | Real prices from data.gov.in's Agmarknet feed |
| 💚 **WhatsApp bot** | Same AI, accessible via WhatsApp — no app install needed |
| 📱 **PWA / Offline** | Install to home screen, works on flaky rural networks |
| 🛠️ **Admin prompt editor** | Update AI behavior live at `/admin` — no redeploy required |

---

## 🇮🇳 Supported Languages

| Language | Script | Code | Coverage |
|---|---|---|---|
| Hindi | Devanagari | `hi` | ~600M speakers |
| Tamil | Tamil | `ta` | ~85M speakers |
| Telugu | Telugu | `te` | ~95M speakers |
| Bengali | Bengali | `bn` | ~100M speakers |
| Marathi | Devanagari | `mr` | ~85M speakers |
| English | Latin | `en` | Bridging language |

**Together: ~85% of India's population in their native tongue.**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Interfaces                  │
├──────────┬──────────┬───────────┬───────────────────┤
│  Web     │  Voice   │  Camera   │   WhatsApp        │
│  Chat    │ (WebSR)  │ (upload)  │   (Meta Cloud)    │
└────┬─────┴────┬─────┴─────┬─────┴─────────┬─────────┘
     │          │           │               │
     └──────────┴───────────┴───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │      Next.js API Routes       │
        ├───────────────────────────────┤
        │ /api/chat      (LLM + context)│
        │ /api/diagnose  (Vision LLM)   │
        │ /api/whatsapp  (webhook)      │
        │ /api/languages (dynamic cfg)  │
        │ /api/admin/*   (prompt editor)│
        └───────────┬───────────────────┘
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
┌─────────┐   ┌─────────┐   ┌──────────────┐
│  Groq   │   │ Vercel  │   │  Live Data   │
│ LLM API │   │   KV    │   │  (Weather,   │
│ (Text + │   │ (Config │   │  Mandi via   │
│ Vision) │   │+Session)│   │  data.gov.in)│
└─────────┘   └─────────┘   └──────────────┘
```

**Key design principles:**
- ✅ **Dynamic where it matters** — languages, prompts, and sessions live in Vercel KV
- ✅ **Hardcoded fallbacks** — app never breaks if KV or APIs are missing
- ✅ **Serverless-first** — deploys to Vercel free tier
- ✅ **Graceful degradation** — works offline via PWA, works without optional APIs

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A free **Groq API key** from [console.groq.com/keys](https://console.groq.com/keys)

### Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/bharat-sahayak.git
cd bharat-sahayak

# 2. Install
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Open .env.local and paste your GROQ_API_KEY

# 4. Run
npm run dev
```

Open **http://localhost:3000** — you're live. 🎉

---

## 🔑 Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | ✅ **Yes** | LLM + Vision (free tier available) |
| `ADMIN_SECRET` | ✅ Yes | Protects `/admin` prompt editor |
| `KV_REST_API_URL` | ⚪ Auto | Vercel KV — dynamic config (added by dashboard) |
| `KV_REST_API_TOKEN` | ⚪ Auto | Vercel KV auth |
| `OPENWEATHER_API_KEY` | ⚪ Optional | Live weather data |
| `DATA_GOV_API_KEY` | ⚪ Optional | Live mandi prices |
| `WHATSAPP_VERIFY_TOKEN` | ⚪ Optional | WhatsApp webhook verification |
| `WHATSAPP_ACCESS_TOKEN` | ⚪ Optional | WhatsApp Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | ⚪ Optional | WhatsApp sender ID |

**The app boots with only `GROQ_API_KEY` set** — all other features gracefully fall back or disable.

---

## ☁️ Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/bharat-sahayak)

**Manual deploy:**

1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repo
3. Add env var `GROQ_API_KEY` (and optionally `ADMIN_SECRET`)
4. Click **Deploy** — done in ~90 seconds 🚀

**Optional enhancements:**
- **Vercel KV** → Storage tab → Create Database → KV → Connect to project
- **Seed KV** → `curl -X POST https://your-app.vercel.app/api/admin/seed -H "x-admin-secret: YOUR_ADMIN_SECRET"`
- **Admin panel** → visit `/admin` and paste your `ADMIN_SECRET`

---

## 🧪 Try These Prompts

| Language | Prompt | What you get |
|---|---|---|
| 🇮🇳 Hindi | `मेरी गेहूँ में पीले पत्ते आ रहे हैं` | Crop disease diagnosis |
| 🇮🇳 Hindi | `आज का मंडी भाव बताओ` | Live prices from data.gov.in |
| 🇮🇳 Hindi | `PM-KISAN के लिए कैसे apply करें?` | Scheme application steps |
| 🇮🇳 Tamil | `நெல் பயிருக்கு உரம் எப்போது போட வேண்டும்?` | Fertilizer schedule |
| 🇮🇳 Telugu | `పత్తి పంటకు నీరు ఎప్పుడు ఇవ్వాలి?` | Irrigation advice |
| 🇮🇳 Bengali | `আমার ধানে পোকা লেগেছে` | Pest treatment |
| 🇮🇳 Marathi | `माझ्या कांद्याला रोग आला आहे` | Disease diagnosis |
| 📷 Photo | Upload a leaf with brown spots | Full structured diagnosis |
| 🎤 Voice | Tap mic → speak in Tamil | Auto-transcribes → AI replies in Tamil → 🔊 reads it back |
| 💚 WhatsApp | Send any message to the bot | Auto language detect + reply |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **LLM** | Groq — Llama 3.3 70B (chat) + Llama 3.2 90B Vision |
| **Config store** | Vercel KV (Redis) with in-code fallbacks |
| **Voice** | Web Speech API (browser-native) |
| **PWA** | next-pwa |
| **Messaging** | WhatsApp Cloud API (Meta) |
| **Live data** | OpenWeatherMap + data.gov.in |
| **Hosting** | Vercel (serverless) |

---

## 📁 Project Structure

```
bharat-sahayak/
├── app/
│   ├── api/
│   │   ├── chat/          # Main LLM chat endpoint
│   │   ├── diagnose/      # Vision-based crop diagnosis
│   │   ├── whatsapp/      # WhatsApp webhook
│   │   ├── languages/     # Dynamic language list
│   │   ├── weather/       # Live weather
│   │   ├── mandi/         # Live mandi prices
│   │   └── admin/         # Seed KV + prompt editor
│   ├── admin/             # Admin UI at /admin
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── manifest.ts        # PWA manifest
├── components/
│   ├── ChatInterface.tsx  # Main chat component
│   ├── LanguageSelector.tsx
│   ├── VoiceInput.tsx     # 🎤 Web Speech Recognition
│   ├── SpeakButton.tsx    # 🔊 Text-to-speech
│   ├── ImageDiagnosis.tsx # 📷 Camera upload
│   └── PWAInstaller.tsx
├── lib/
│   ├── languages.ts       # Language definitions (fallback)
│   ├── prompts.ts         # System prompts (fallback)
│   ├── config.ts          # Dynamic KV loader
│   ├── speech.ts          # Speech utilities
│   └── context.ts         # Live weather + mandi injection
├── public/
│   ├── icons/
│   └── robots.txt
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

---

## 🎨 Screenshots

> *Add screenshots here after first deploy*

| Home (Hindi) | Voice Input | Disease Diagnosis |
|---|---|---|
| ![home](./docs/home.png) | ![voice](./docs/voice.png) | ![diagnose](./docs/diagnose.png) |

---

## 🗺️ Roadmap

- [x] 6 Indian languages
- [x] Voice input + text-to-speech
- [x] Image-based disease diagnosis
- [x] WhatsApp bot
- [x] Live weather + mandi prices
- [x] PWA offline support
- [x] Admin prompt editor
- [ ] Add 5 more languages (Odia, Kannada, Malayalam, Punjabi, Gujarati)
- [ ] SMS fallback for feature phones
- [ ] Farmer-to-farmer Q&A community
- [ ] Voice-only mode (for low-literacy users)
- [ ] Offline LLM via WebLLM for zero-connectivity areas

---

## 🤝 Contributing

Contributions are what make open source amazing! Any contribution you make is **greatly appreciated**.

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Especially welcome:**
- 🌐 Adding new Indian languages
- 🐛 Fixing translation issues in existing languages
- 📱 UI improvements for low-end Android phones
- 🧪 Testing with real farmers

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- **[Groq](https://groq.com/)** — for blazing-fast, free-tier LLM inference
- **[data.gov.in](https://data.gov.in/)** — for open Agmarknet mandi price data
- **[OpenWeatherMap](https://openweathermap.org/)** — for weather data
- **[Vercel](https://vercel.com/)** — for free hosting & KV
- **[Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp)** — for reaching farmers where they are
- **India's farmers** — who feed 1.4 billion people

---

## 📞 Support & Helplines

Bharat Sahayak is a helper, not a replacement for professional advice.

- **Kisan Call Centre:** 1800-180-1551 (toll-free, 22 Indian languages)
- **PM-KISAN Helpline:** 155261 / 011-24300606
- **PMFBY (Crop Insurance):** 14447
- **Find your local KVK:** [kvk.icar.gov.in](https://kvk.icar.gov.in/)

---

<div align="center">

### 🌾 Made with ❤️ for Bharat's Annadatas

**"Jai Jawan, Jai Kisan"**

⭐ Star this repo if you believe AI should speak every Indian language

</div>