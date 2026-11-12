# shhh-supersecretswap

a nice organizer for groups who want to manage gift swaps, wishlists, and availability without the usual spreadsheet chaos all in a centralized location.

## what it does

- generates a Secret Santa draw with no self-pairing
- lets each participant set a private PIN to reveal their assigned recipient
- tracks participant wishlists with item title, price, store, and link
- includes a holiday availability calendar for coordinating gift exchange timing
- supports organizer controls for adding/removing participants and running the draw
- stores state in localStorage so the app works as a lightweight local demo

## used

- React
- Vite
- Tailwind CSS
- Lucide React

## run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## structure

- `src/App.jsx` — main app logic and UI
- `src/Countdown.jsx` — countdown display for the holiday event
- `src/index.css` — Tailwind entry styles
- `index.html` — app entry page

## demo (for now)

this app is designed as a cozy local demo for a holiday gift exchange. Organizer access is protected by a PIN/password flow, and the app includes a default demo organizer passcode for quick testing.

## notes

- the app uses browser localStorage, so data persists in the browser on the same machine. (will fix later)
- it is intended for local/demo use rather than production deployment.
- for a real shared event, you would likely want to add backend storage, authentication, and multi-user persistence.
