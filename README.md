# Personal Productivity Hub — Version 1

A personal-only, mobile-friendly productivity dashboard.

## V1 features

- Responsive dashboard for desktop and Android
- Google Calendar, Tasks, Keep, Gmail, Drive and Contacts shortcuts
- NotebookLM and Samsung Notes shortcuts
- YouTube, Spotify, Maps and Google Password Manager shortcuts
- Quick Notes stored locally in the browser
- Quick Tasks stored locally in the browser
- Light/dark mode
- Personal name and start-page preference
- Focus timer
- PWA / install-to-home-screen support
- No business/Mehta Tax Consultancy data

## Important

V1 does **not** yet connect to your Google account. The Google service buttons open the official services in a new tab. This avoids putting OAuth credentials or secrets into a public GitHub repository.

V2 can add secure Google OAuth and APIs for Calendar, Tasks, Keep, Gmail and Drive.

## GitHub Pages deployment

1. Create a new GitHub repository, for example `personal-productivity-hub`.
2. Upload all files from this folder to the repository root.
3. Open the repository's **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save.
7. GitHub will provide your Pages URL.
8. Open it on Android Chrome and choose **Add to Home screen**.

## Local testing

Open `index.html` in a browser. For PWA/service-worker testing, use a local web server or GitHub Pages rather than a `file://` URL.

## V2 architecture

Frontend: GitHub Pages  
Authentication: Google OAuth 2.0  
APIs: Google Calendar / Tasks / Keep / Gmail / Drive  
Backend: serverless API layer when required  
External services without suitable APIs: official-site launch buttons
