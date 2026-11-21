# Ensinesthisi.cy

Standalone civic reporting and digital evidence project. It is not an official authority service.

## Run the interactive local demo

Requires Python 3.12+ and no third-party packages.

```sh
python3 app.py
```

Open `http://127.0.0.1:8765`. Stop the server with `Control+C`.

The demo offers two fixed test scenarios: parking on a sidewalk and parking in a disabled parking space. With browser camera permission, it captures a compressed preview frame. That frame is unverified and is sent only to the loopback server to calculate SHA-256; the image bytes are discarded. The local receipt records the hash and explicitly marks C2PA, app attestation, trusted time, and government delivery as unimplemented. No location, identity, free text, or authority submission is collected. Demo records remain in memory and disappear when the server stops. Keep the service on loopback; it is not suitable for real reports or public hosting.

The browser flow is a supporting-image demonstration, not native evidence capture. Browser capture does not preserve original camera bytes or prove that a live scene was photographed. Government delivery is disabled because no authority endpoint or approval is configured. See [the local API contract](docs/API_CONTRACT.md).

## Mobile app and web build

The Expo app is in `mobile/`. It includes native camera capture and a static web build. The mobile app calculates the hash on the device, deletes its temporary image file, and keeps receipts in memory until the app closes. It does not use the Python demo API or transmit reports.

```sh
cd mobile
npm ci
npx expo start
```

Press `i` or `a` for a configured simulator, or `w` for the web preview. To create a static web bundle without deploying it:

```sh
npx expo export --platform web
```

Use a secure HTTPS origin or localhost for browser camera access. Device camera behavior, native builds, store submission, privacy approval, and external authority delivery are not verified or configured.

The desktop and mobile demos are separate prototypes: the desktop demo hashes a compressed camera frame through the local loopback API; the mobile app hashes the temporary photo locally. Neither flow creates a real or official report.

## Verify the synthetic verifier bundle

```sh
python3 -m unittest discover -s tests -v
python3 -m verifier.cli create-demo /tmp/civic-evidence-demo
python3 -m verifier.cli verify /tmp/civic-evidence-demo
```

The verifier checks file hashes and event-chain consistency only. It does not prove capture authenticity, identity, time, location, device integrity, or scene truth. See [docs/STATUS.md](docs/STATUS.md).
