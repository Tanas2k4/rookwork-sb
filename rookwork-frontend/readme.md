<p align="center">
  <img src="https://electronjs.org/images/electron-logo.svg" width="160" alt="Electron Logo" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="120" alt="React Logo" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="110" alt="Tailwind CSS Logo" />
</p>

<p align="center">
  Frontend application for <b>Rookwork</b>, built with 
  <b>React + Vite + Tailwind CSS</b> for Web
  and <b>Electron</b> for Desktop.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Electron-28-47848F?style=for-the-badge&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Desktop-8B5CF6?style=for-the-badge" />
</p>

<p align="center">
  <a href="https://github.com/warmdrobe/rookwork-frontend">
    <img src="https://img.shields.io/badge/GitHub-rookwork--frontend-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <img src="https://img.shields.io/badge/License-ISC-FACC15?style=for-the-badge" />
</p>

## Decription

Supported Operating Systems: [Windown 10+](https://learn.microsoft.com/windows), [MacOS](https://www.apple.com/macos/), [Linux (Ubuntu / Debian / Arch / …)](https://www.kernel.org/)

Electron will automatically build binaries suitable for each operating system.

<b>Prerequisites</b>
- [Node.js (LTS ≥ 18)](https://nodejs.org/en/download/)
- [Yarn (Classic v1)](https://classic.yarnpkg.com/en/docs/install)
- [Git](https://git-scm.com/downloads)

## Getting Started

Clone repository
```bash
git clone https://github.com/warmdrobe/rookwork-frontend.git

cd rookwork-frontend
```

The project uses Yarn Workspaces; dependencies only need to be installed once at the root directory.
```bash
yarn install
```

## Usage

Running Browser (Web) and Electron (Desktop) concurrently - **recommended**
```bash
yarn dev
```
- Web: http://localhost:5173
- Electron: opens the desktop app window automatically

only Browser (Web) or Electron (Desktop) only
```bash
#start browser
yarn start:browser

#start electron
yarn start:electron
```

## Build 

**Build browser (Web)**
```bash
yarn build:browser
```
Output `browser-app/dist`

**Build electron (Desktop)**
```bash
yarn build:electron
```

**Build all**
```bash
yarn build
```

## Note

- Electron (dev mode) loads from http://localhost:5173
- Electron (production mode) loads from `browser-app/dist/index.html`
- Tailwind CSS is preconfigured


