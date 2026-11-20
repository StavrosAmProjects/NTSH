# Open Ensinesthisi.cy on your Mac

1. Move `Ensinesthisi.cy.zip` to `/Users/Ambizas/Downloads/00 Projects/Random Projects`.
2. Double-click the ZIP to extract the `Ensinesthisi.cy` folder.
3. Open Terminal and run:

```sh
cd "/Users/Ambizas/Downloads/00 Projects/Random Projects/Ensinesthisi.cy"
python3 app.py
```

4. Open `http://127.0.0.1:8765` in your Mac browser. Keep Terminal open while viewing.
5. Stop the preview with `Control+C`.

The folder is already a Git repository. Check it with:

```sh
git status
git log -1 --oneline
```

The local demo accepts fixed fictional scenarios and creates in-memory demo IDs only. It does not accept real reports or transmit data.
