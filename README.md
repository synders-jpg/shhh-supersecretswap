# shhh-supersecretswap

A festive Secret Santa organizer for groups who want to manage gift swaps, wishlists, and availability without the usual spreadsheet chaos.

## What it does

- Generates a Secret Santa draw with no self-pairing
- Lets each participant set a private PIN to reveal their assigned recipient
- Tracks participant wishlists with item title, price, store, and link
- Includes a holiday availability calendar for coordinating gift exchange timing
- Supports organizer controls for adding/removing participants and running the draw
- Stores state in localStorage so the app works as a lightweight local demo

## Tech stack

- React
- Vite
- Tailwind CSS
- Lucide React

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Project structure

- `src/App.jsx` — main app logic and UI
- `src/Countdown.jsx` — countdown display for the holiday event
- `src/index.css` — Tailwind entry styles
- `index.html` — app entry page

## Demo behavior

This app is designed as a cozy local demo for a holiday gift exchange. Organizer access is protected by a PIN/password flow, and the app includes a default demo organizer passcode for quick testing.

## Notes

- The app uses browser localStorage, so data persists in the browser on the same machine.
- It is intended for local/demo use rather than production deployment.
- For a real shared event, you would likely want to add backend storage, authentication, and multi-user persistence.
