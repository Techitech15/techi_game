# Forest Cat Map

A small browser demo where a cream tabby Munchkin cat walks around a hand-painted forest map.

## Local Preview

Serve the `docs` folder with any static server, then open the local URL.

```powershell
cd docs
python -m http.server 8061 --bind 127.0.0.1
```

Controls: tap/click to move, tap suspicious dirt to dig, or use WASD / arrow keys.
Buried collectible spots are randomized each time the page reloads.
Found item names are shown in Japanese.
The cat switches to a short digging animation before each item is revealed.

## GitHub Pages

This repository includes a GitHub Actions workflow that deploys the static site in `docs/` to GitHub Pages.

## License

MIT License.
