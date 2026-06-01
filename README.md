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

## GitHub Pages

This repository includes a GitHub Actions workflow that deploys the static site in `docs/` to GitHub Pages.

## License

MIT License.
