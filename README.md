# Ensinesthisi.cy

Standalone civic reporting and digital evidence project. It is not an official authority service.

## Preview

Open `index.html` in a browser. The landing page is a visual prototype; its report button leads to an explanatory section and does not submit information.

See [HANDOFF.md](HANDOFF.md) for Mac installation, Work Mode setup, and GitHub repository commands. `AGENTS.md` defines this repository's standalone boundary.

## Verify prototype bundle

Requires Python 3.12+, no third-party packages.

```sh
python -m unittest discover -s tests -v
python -m verifier.cli create-demo /tmp/civic-evidence-demo
python -m verifier.cli verify /tmp/civic-evidence-demo
```

The verifier checks file hashes and event-chain consistency only. It does not prove capture authenticity, identity, time, location, device integrity, or scene truth. See [docs/STATUS.md](docs/STATUS.md).
