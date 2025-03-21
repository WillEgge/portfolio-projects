# Weather App

A modern, responsive weather application built with **Next.js 14**, **TypeScript**, and the **OpenWeatherMap API**. This portfolio project demonstrates modern web development techniques including the App Router, SWR for data fetching, and a clean, responsive UI that leverages geolocation for real-time weather data.

---

## Features

- **Real-time Weather Data:**  
  Displays current weather based on your geolocation.
- **5-Day Forecast:**  
  View the upcoming weather trends for the next 5 days.
- **Temperature Unit Toggle:**  
  Easily switch between Celsius (°C) and Fahrenheit (°F).
- **Responsive Design:**  
  Optimized for desktop, tablet, and mobile devices.
- **Loading & Error States:**  
  Smooth user experience with skeleton loaders and error handling.

- **Dark/Light Theme:**  
  Toggle between dark and light modes for comfortable viewing.

---

## Tech Stack

- **Frontend Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Data Fetching:** SWR for efficient, real-time data updates
- **Styling:** Tailwind CSS with shadcn/ui components
- **Toast Notifications:** Sonner for user feedback
- **Theming:** next-themes for dark/light mode support
- **Icons:** Lucide React for beautiful, consistent iconography
- **API:** OpenWeatherMap API for weather data
- **Geolocation:** Browser Geolocation API

---

## Project Structure

weather-app/  
├── src/  
│   ├── app/  
│   │   ├── layout.tsx          # Root layout with global setup  
│   │   ├── page.tsx            # Main weather display page  
│   │   ├── globals.css         # Global and custom styles  
│   │   ├── loading.tsx         # Loading UI  
│   │   └── error.tsx           # Error boundaries  
│   ├── components/  
│   │   ├── Header.tsx          # App header with theme toggle  
│   │   ├── Provider.tsx        # Theme provider  
│   │   └── ui/                 # shadcn/ui components  
│   │       ├── button.tsx  
│   │       ├── card.tsx  
│   │       ├── skeleton.tsx  
│   │       └── sonner.tsx  
│   └── lib/  
│       ├── hooks.ts            # Custom hooks for weather functionality  
│       ├── types.ts            # TypeScript type definitions  
│       └── utils.ts            # Utility functions  
├── tailwind.config.ts         # Tailwind configuration  
└── components.json            # shadcn/ui configuration  
```

## Getting Started

### Prerequisites

- **Node.js:** Node.js 18+
- **Package Manager:** npm or yarn
- **OpenWeatherMap API Key**

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/weather-app.git
   cd weather-app
   ```

2. **Install the dependencies:**

   ```Using npm:
   npm install
   Or using yarn:
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add your OpenWeatherMap API key:

   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
   ```

4. **Run the development server:**

   ```
   # Using npm
   npm run dev

   # Or using yarn
   yarn dev
   ```

   5. **Open your browser:**
      `Navigate to http://localhost:3000 to view the app.`

   ## Usage

   When the app is running, it will display weather data based on your current geolocation. Use the temperature unit toggle to switch between Celsius and Fahrenheit. Explore the 5-day forecast to plan ahead.

   ## Deployment

   This application can be easily deployed on platforms like Vercel. When deploying, ensure you add your NEXT_PUBLIC_OPENWEATHER_API_KEY to the environment variables in your deployment settings.

   ## Future Enhancements

   Weather Alerts & Notifications
   Historical Weather Data Visualization
   Multiple Location Management
   Search functionality for locations
   Detailed hourly forecasts
   Weather maps and radar

   ## License

   MIT

   ## Acknowledgements

   Next.js for the framework and tools
   OpenWeatherMap API for weather data
   SWR for efficient data fetching
   shadcn/ui for accessible UI components
   Tailwind CSS for styling
   Vercel for deployment
