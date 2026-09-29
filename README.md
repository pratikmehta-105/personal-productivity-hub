# Personal Productivity Hub V2

A personal, mobile friendly dashboard. It preserves V1 notes (`pph_notes`), tasks (`pph_tasks`) and settings (`pph_settings`) in the same browser when you replace the repository files.

## Deploy the update

Upload **the files inside this folder** to the root of `pratikmehta-105/personal-productivity-hub` on the `main` branch. Replace `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.json`, `icon.svg` and this README. GitHub Pages remains set to **Deploy from a branch → main → /(root)**. Refresh the page after deployment. The new service worker uses `pph-v2` and fetches updated local files.

The live site is `https://pratikmehta-105.github.io/personal-productivity-hub/`. GitHub Pages serves the app publicly; local notes are saved in the browser, not in the repository. Local data does not sync between phone and PC. Use Settings → Export backup on one device and Import backup on another. Keep the backup private.

## Connect Google (optional)

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project. Enable **Google Calendar API**, **Google Tasks API**, **Gmail API**, and **Google Drive API**.
2. Configure the OAuth consent screen. For a personal app, choose the user type available to your account; while it is in testing, add your Google account as a test user. Some Calendar, Tasks or Drive scopes can require Google verification for broad public use. This personal test configuration may show an unverified app warning or have token lifetime limits. The Gmail widget requests label access for an inbox count, not email content.
3. Create an **OAuth 2.0 Client ID → Web application**. Add the exact Authorized JavaScript origin: `https://pratikmehta-105.github.io`. Do not put the repository path in the origin. This browser token flow does not need a redirect URI.
4. Copy only the **client ID** into Hub → Settings → Google connection and click Connect Google. Accept the permissions you want to grant. The app asks for Calendar event read, Tasks manage, Gmail labels and Drive metadata read in one consent step. If you decline any, the combined refresh can fail; reconnect after choosing the needed scopes.

The client ID is public by design. **Never upload a client secret, API key, password or refresh token.** An access token stays only in this tab's memory and expires. Reconnect after reload. Disconnect revokes the active token. The app displays upcoming primary calendar events, pending tasks across up to 20 lists, inbox unread count and five recent Drive file names. You can add or complete Google Tasks. Google data is not stored in localStorage or backup.

## Limits

- Google Keep remains an official shortcut. Its official API targets Workspace enterprise administration and is not a normal personal Keep sync path. NotebookLM opens its official site.
- Samsung Notes has no reliable public web interface for this hub. Open the phone app directly; the earlier third party link was removed.
- News and finance are official web shortcuts. Weather uses browser location with permission and the Open-Meteo forecast API. Location is sent only for that request.
- Search covers this browser's notes, quick tasks and shortcuts. It does not search Google data or other sites.
- GitHub Pages cannot enforce a real password gate for a static site. The optional Google authorization protects API access; it is not a private hosting layer. Keep sensitive information out of local notes on a shared device.
