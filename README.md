# Fly Screen

Fly Screen is a lightweight, fullscreen desktop application built with Electron and TypeScript. It provides a clean way to display video sources (such as webcams or HDMI capture cards) without window borders or system UI interference.

The application features a floating, draggable menu button that remains accessible even in fullscreen mode, allowing users to switch video sources or exit the application easily.

## Features

- **Fullscreen by Default**: Launches directly into a borderless, immersive view.
- **Floating Menu**: A persistent, draggable circular button that expands into a context-sensitive menu.
- **Source Selection**: Switch between available video input devices on the fly.
- **FFmpeg Integration**: Built with `ffmpeg-static` for potential future video processing and recording capabilities.
- **Modern UI**: Sleek, glassmorphic design for the menu and submenus.

## Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/)
- **Language**: TypeScript
- **Video Logic**: Custom MediaDevices API implementation
- **Build System**: `electron-builder`
- **Utilities**: `ffmpeg-static`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/flynt7111/fly-screen.git
   cd fly-screen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running in Development

To start the application in development mode:

```bash
npm run dev
```

This will compile the TypeScript source code and launch the Electron application.

### Building for Release

To package the application for Windows (portable executable):

```bash
npm run package
```

The output will be located in the `release/` directory as `FlyScreen.exe`.

## Project Structure

- `src/main.ts`: Electron main process logic.
- `src/preload.ts`: Bridge between main and renderer processes.
- `src/renderer/`: Frontend assets (HTML, CSS, TypeScript).
- `src/ffmpeg.ts`: Utility for locating the static FFmpeg binary.
- `dist/`: Compiled JavaScript files (generated).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
