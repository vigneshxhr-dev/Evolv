
# Evolv Clothing Interview Status Bot

A professional, AI-powered recruitment assistant designed to help candidates check their interview status in real-time.

## 🚀 Features

- **AI-Powered Chat**: Uses Google's **Gemini 3 Flash** model to provide a natural, conversational experience.
- **Google Sheets Integration**: Fetches real-time interview data from a published Google Sheet.
- **Robust Fallback Mode**: If the AI service is unavailable or reaches a limit, the bot automatically switches to a **Direct Secure Lookup** mode.
- **Smart Data Normalization**: Automatically formats phone numbers to ensure matches regardless of how a user types them.
- **HR Integration**: Provides instant access to HR contact information (Vigneshwaran).
- **Modern UI**: A sleek, mobile-responsive chat interface built with Tailwind CSS.

## 🛠️ Technical Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Engine**: `@google/genai` (Gemini API)
- **Data Fetching**: Google Sheets CSV Export API

## 📋 Google Sheets Setup

The app is currently configured to read from:
`https://docs.google.com/spreadsheets/d/e/2PACX-1vRepxomgRBDE_pqjpyVhc9oFs9usT02D8CkJRAvdX0hGpZkd2EnXgVRrK1iZFza3yXUGCOtgLTzXt3j/pubhtml`

**Required Columns:**
To function correctly, your sheet should have headers that include:
- **Name**: Candidate's full name.
- **Phone**: Candidate's contact number (normalized by the bot).
- **Status**: Current application status (e.g., "Shortlisted", "Under Review").
- **Position**: The role applied for.
- **Interview Date** (Optional): Scheduled date and time.

## 🔐 Security

- **API Keys**: The application requires a `process.env.API_KEY` for the Gemini service.
- **Privacy**: The bot is programmed to only show data corresponding to the specific phone number provided.

## 👤 HR Contact Info

For manual inquiries, candidates are directed to:
- **Name**: Vigneshwaran
- **Phone**: 9344117877
- **Email**: Careers@evolv clothing
