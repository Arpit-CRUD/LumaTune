# 🎵 LumaTune

> **Discover music that matches the vibe of wherever you are.**

LumaTune is a full-stack React Native mobile app that recommends music based on your real-world location. Users submit locations to a shared community map — a café, a park, a city landmark — and the app uses Google Gemini AI to surface YouTube tracks and curated playlists that match each spot's vibe. Other users can discover those locations, leave star-rated reviews, upload photos, and save playlists. Built with Expo, Firebase, the Gemini AI API, Google Maps, and the YouTube Data API.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-integrated-4285F4?logo=google&logoColor=white)

---

## Features

| Feature | Description |
|---|---|
| **Community-driven map** | Users submit real locations to a shared map; anyone can discover them and get AI-curated music that matches the spot's atmosphere |
| **Gemini AI integration** | Uses Google Gemini to generate contextual music search queries from place metadata |
| **YouTube playback** | Streams matching music videos in-app via the YouTube Data API v3 |
| **Saved playlists** | Authenticated users can save and revisit their favourite location playlists |
| **Location journal** | Log personal notes and memories tied to places on the map |
| **Community reviews** | Read and submit star-rated reviews for locations |
| **Place gallery** | Browse and upload photos for any submitted location |
| **Auth** | Email/password authentication via Firebase Auth |
| **i18n-ready** | Translation layer in place (`src/translations/`) |
| **Admin panel** | Separate admin screens for content moderation |

---

## Tech Stack

- **Framework** — React Native 0.81 + Expo 54
- **Navigation** — React Navigation (native stack + bottom tabs)
- **Backend / DB** — Firebase Auth + Firestore + Storage
- **AI** — Google Gemini API
- **Maps** — React Native Maps + Google Places Autocomplete
- **Video** — YouTube Data API v3
- **State** — React Context API
- **Storage** — AsyncStorage (offline favourites)

---

## Project Structure

```
LumaTuneProj/
├── src/
│   ├── screens/          # All app screens (Home, Map, Journal, Recommendations…)
│   ├── components/       # Shared UI components
│   ├── context/          # React Context providers (auth, etc.)
│   ├── services/         # Firebase & API service helpers
│   ├── navigation/       # Stack and tab navigator configs
│   ├── styles/           # Global style tokens
│   ├── translations/     # i18n string files
│   └── utils/            # Utility/helper functions
├── assets/               # Images, fonts, icons
├── App.js                # Root component
├── app.config.js         # Expo config
└── .env.example          # Environment variable template
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo Go](https://expo.dev/client) installed on your phone
- A [Firebase project](https://console.firebase.google.com/) with Auth + Firestore + Storage enabled
- API keys for Google Maps, YouTube Data API v3, and (optionally) Google Gemini

### 1. Clone & install

```sh
git clone <repository-url>
cd LumaTuneProj
npm ci
```

### 2. Configure environment variables

Copy the example file and fill in your own keys:

```sh
cp .env.example .env
```

Then open `.env` and replace each placeholder with your real value:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECTID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGEBUCKET=your-project-id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGINGSENDERID=your-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APPID=your-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENTID=your-measurement-id
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key      # optional
EXPO_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key
```


After editing environment variables, restart the Expo dev server.

### 3. Run on your phone with Expo Go

1. Connect your phone and computer to the **same Wi-Fi network**.
2. Start the dev server:
   ```sh
   npm start
   ```
3. Scan the QR code with Expo Go (Android) or the Camera app (iPhone).

If your network blocks device-to-device traffic, use tunnel mode:

```sh
npx expo start --tunnel
```

### Other run targets

```sh
npm run android   # requires Android Studio + emulator
npm run ios       # requires macOS + Xcode
npm run web       # experimental web build
```

---

## 🔑 Obtaining API Keys

| Key | Where to get it |
|---|---|
| Firebase config | [Firebase Console](https://console.firebase.google.com/) → Project Settings → Your apps |
| Google Maps | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Enable **Maps SDK for Android/iOS** and **Places API** |
| YouTube Data API v3 | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Enable **YouTube Data API v3** |
| Gemini API | [Google AI Studio](https://aistudio.google.com/) → Get API key |

---

## 🎓 Academic Attribution

This is a **Final Year Project** developed as part of my degree at **Instituto Politécnico de Bragança (IPB) — Universidade Politécnica de Bragança**, Portugal.

The original project concept and brief were set by IPB. The implementation was carried out by me as the student developer.

This repository is shared publicly for portfolio purposes only.