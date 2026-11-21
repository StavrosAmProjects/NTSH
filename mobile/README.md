# Ensinesthisi.cy

Expo app prototype for documenting seven common parking obstructions: parking on a pavement, in an accessible space, on a pedestrian crossing or cycle lane, blocking a ramp or tactile path, double parking, and parking at a bus stop.

## Run it

From this directory (not the repository root):

```sh
npm ci
npx expo start
```

Press `i` for the iOS simulator, scan the QR code with Expo Go on a phone, or press `w` for the web preview. The operating system or browser asks for camera permission before capture.

## What works in this prototype

- Choose one of seven parking obstruction scenarios, with a matching photo prompt.
- Take a photo with the device camera.
- Calculate a SHA-256 digest locally and delete the temporary photo.
- View the receipt for the current app session.
- Keep the five less common scenarios behind one expandable control.

Photos are not uploaded, reports are not submitted to any authority, and receipts are cleared when the app closes. The device clock is not a trusted timestamp. A hash can show that a file changed; it cannot prove what the photo depicts or when it was taken. The app starts without prefilled incident reports.

The web build uses static output and a PWA manifest. Build it locally, without deployment, with `npx expo export --platform web`.

## EAS

The app is linked to EAS project `93276499-56ea-4e3f-a110-7d4a64d5253a`. Before store release, confirm that the iOS bundle identifier and Android package are available in the intended developer accounts, then configure EAS builds and store credentials.
