# Ensinesthisi.cy

Standalone civic reporting and digital evidence project. It is not an official authority service.

## Run the interactive local demo

Requires Python 3.12+ and no third-party packages.

```sh
python3 app.py
```

Open `http://127.0.0.1:8765`. Stop the server with `Control+C`.

The demo offers two fixed fictional traffic scenarios: parking on a sidewalk and parking in a disabled parking space. It has no free-text report field, photo upload, GPS, identity field, authority route, or external transmission. Demo IDs and entries live in process memory and disappear when the server stops. The displayed server time is not a trusted timestamp. Keep the service on loopback; it is not suitable for real reports or public hosting.

## Verify the synthetic verifier bundle

```sh
python3 -m unittest discover -s tests -v
python3 -m verifier.cli create-demo /tmp/civic-evidence-demo
python3 -m verifier.cli verify /tmp/civic-evidence-demo
```

The verifier checks file hashes and event-chain consistency only. It does not prove capture authenticity, identity, time, location, device integrity, or scene truth. See [docs/STATUS.md](docs/STATUS.md).
