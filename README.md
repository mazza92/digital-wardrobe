# Digital Wardrobe - Fashion Influencer Prototype

A mobile-first web application prototype for fashion influencers to showcase and monetize their outfits through an interactive, shoppable platform.

## Features

- **Main Portal**: Hero section with influencer branding and outfit grid
- **Interactive Outfit Details**: Clickable product tags with shopping links
- **About Page**: Influencer bio and social media links
- **Mobile-First Design**: Optimized for mobile devices with luxury aesthetics
- **Responsive Layout**: Works seamlessly across all device sizes

## Technology Stack

- React 18 with Vite
- React Router for navigation
- Styled Components for styling
- Mobile-first responsive design
- Deployed on Vercel

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── MainPortal.jsx      # Home page with outfit grid
│   ├── OutfitDetail.jsx    # Interactive outfit view
│   └── About.jsx           # About page
├── data/
│   └── outfits.json        # Mock data for outfits and products
├── App.jsx                 # Main app component with routing
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## Customization

To customize the app for a different influencer:

1. Update `src/data/outfits.json` with:
   - Influencer information (name, brand, bio, hero image)
   - Outfit data with product tags and coordinates
   - Social media links

2. Adjust styling in the styled-components within each component file

3. Update the page title and meta description in `index.html`

## Deployment

The app is configured for deployment on Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

The `vercel.json` file ensures proper routing for the single-page application.

## Demo

Visit the live prototype to see the interactive features and mobile-optimized design.