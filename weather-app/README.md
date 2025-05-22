# Weather App (v1.0.0)

A modern, responsive weather application built with **Next.js 14**, **TypeScript**, and the **OpenWeatherMap API**. This portfolio project demonstrates modern web development techniques including App Router, SWR for data fetching, geolocation, search functionality, and a clean, responsive UI with dark mode support.

## Features

- **Current Weather Data:**  
  Real-time weather information based on user location or search
- **Location Search:**  
  Search for any location worldwide with auto-complete
- **Favorites & History:**  
  Save and manage favorite locations and view recent searches
- **Detailed Hourly Forecast:**  
  View upcoming weather for the next 24 hours with pagination
- **5-Day Forecast:**  
  Plan ahead with a daily forecast for the next 5 days
- **Temperature Unit Toggle:**  
  Switch between Celsius (°C) and Fahrenheit (°F) with persistent preference
- **Geolocation:**  
  Uses browser location API with intelligent fallback
- **Dark/Light Theme:**  
  Toggle between dark and light modes for comfortable viewing
- **Responsive Design:**  
  Optimized for desktop, tablet, and mobile devices
- **Enhanced Error Handling:**  
  Smart error recovery with retry options
- **Loading States:**  
  Smooth user experience with skeleton loaders and meaningful status messages
- **Animated UI Elements:**  
  Smooth transitions and weather-appropriate animations

## Tech Stack

- **Frontend Framework:** Next.js 14 with App Router
- **Language:** TypeScript with comprehensive type safety
- **Data Fetching:** SWR for caching, revalidation, and error recovery
- **Styling:** Tailwind CSS with shadcn/ui components
- **Toast Notifications:** Sonner for user feedback
- **Theming:** next-themes for dark/light mode support
- **Icons:** Lucide React for beautiful, consistent iconography
- **API Integration:** 
  - OpenWeatherMap Current Weather API
  - OpenWeatherMap One Call API for hourly forecasts
  - OpenWeatherMap Geocoding API for location search
- **Local Storage:** For favorites, recent searches, and user preferences
- **Browser APIs:** Geolocation API for detecting user location

## Project Structure

```
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
│   │   ├── WeatherIcon.tsx     # Dynamic weather icon component 
│   │   └── ui/                 # shadcn/ui components  
│   │       ├── button.tsx  
│   │       ├── card.tsx  
│   │       ├── skeleton.tsx  
│   │       └── sonner.tsx  
│   └── lib/  
│       ├── api/                # API service modules
│       │   └── weather.ts      # Weather and geocoding API integration
│       ├── services/           # Client-side services
│       │   └── locationStorage.ts # Local storage for favorites & recents
│       ├── hooks.ts            # Custom hooks for weather functionality  
│       ├── types.ts            # TypeScript type definitions  
│       └── utils.ts            # Utility functions  
├── tailwind.config.ts         # Tailwind configuration  
└── components.json            # shadcn/ui configuration
```

## Getting Started

### Prerequisites

- **Node.js:** Node.js 18+ and npm/yarn
- **OpenWeatherMap API Key:** Register at [OpenWeatherMap](https://openweathermap.org/api) to get your API key

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/weather-app.git
   cd weather-app
   ```

2. **Install the dependencies:**

   ```bash
   # Using npm
   npm install
   
   # Or using yarn
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add your OpenWeatherMap API key:

   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
   ```

4. **Run the development server:**

   ```bash
   # Using npm
   npm run dev

   # Or using yarn
   yarn dev
   ```

5. **Open your browser:**
   
   Navigate to `http://localhost:3000` to view the app.

## Usage

### Finding Weather Data

- **Automatic Location:** The app will attempt to detect your location on load
- **Search:** Use the search bar to find any location worldwide
- **My Location:** Click the "My Location" button to get weather for your current location
- **Favorites:** Star locations to save them to your favorites for quick access
- **Recent Searches:** Recently searched locations appear in the search dropdown

### Viewing Weather Information

- **Current Weather:** See temperature, feels-like, humidity, and wind speed
- **Hourly Forecast:** Browse the next 24 hours of weather with pagination controls
- **5-Day Forecast:** View the upcoming 5-day forecast with daily temperatures
- **Units:** Toggle between Celsius and Fahrenheit using the unit toggle button

## Deployment to Vercel

This application is configured for easy deployment to Vercel:

1. **Push to GitHub:** Ensure your code is in a GitHub repository
2. **Connect to Vercel:** Go to [Vercel](https://vercel.com) and import your repository
3. **Configure Environment Variables:** Add your `NEXT_PUBLIC_OPENWEATHER_API_KEY` to Vercel's environment variables
4. **Deploy:** Vercel will automatically build and deploy your application
5. **Custom Domain:** Optionally, configure a custom domain in the Vercel dashboard

## License

MIT

## Acknowledgements

- **Next.js** for the framework and tools
- **OpenWeatherMap API** for weather data
- **SWR** for efficient data fetching
- **shadcn/ui** for accessible UI components
- **Tailwind CSS** for styling
- **Vercel** for deployment platform
