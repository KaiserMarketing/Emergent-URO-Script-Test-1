# Medical Waiting Room Display System

A fullscreen web application for medical offices that displays patient names when called and shows media content when idle.

## Features

✅ **Fullscreen Display**: Clean, professional interface designed for kiosk mode
✅ **Patient Calling**: Displays patient names fullscreen when triggered
✅ **German Text-to-Speech**: Announces patient names in German using macOS voice synthesis
✅ **Media Playback**: Alternates between video and slideshow when idle
✅ **File Integration**: Monitors `trigger.json` for patient data from AppleScript
✅ **Auto-Resume**: Automatically resumes media after patient display
✅ **Debug Mode**: Built-in testing and debugging capabilities

## Quick Start

### 1. Start the System
```bash
python3 start_waiting_room.py
```

### 2. Open Display
- Navigate to: `http://localhost:5000`
- Press `F11` or `F` for fullscreen mode
- The system will automatically start polling for triggers

### 3. Patient Calling Integration
Your AppleScript should write patient data to `/app/trigger.json`:
```json
{"name": "Herr Müller"}
```

The display will automatically:
- Detect the file change
- Pause current media
- Show patient name fullscreen  
- Announce name in German
- Resume media after 5 seconds

## File Structure

```
/app/
├── backend/
│   ├── server.py              # Flask server with file monitoring
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── index.html            # Main display interface
│   ├── style.css             # Fullscreen styling & animations
│   └── app.js                # Core logic & TTS functionality
├── media/
│   ├── idle-video.mp4        # Background video (replace with yours)
│   ├── slide1.jpg            # Slideshow image 1
│   ├── slide2.jpg            # Slideshow image 2
│   └── slide3.jpg            # Slideshow image 3
├── trigger.json              # Patient trigger file
└── start_waiting_room.py     # Easy startup script
```

## Media Setup

### Video Files
- Replace `/app/media/idle-video.mp4` with your actual video
- Supported formats: MP4, WebM, OGV
- Recommended: 1920x1080 resolution, H.264 codec

### Slideshow Images  
- Replace images in `/app/media/` directory
- Supported formats: JPG, PNG, GIF
- Update slide filenames in `/app/frontend/app.js` if needed

## Usage

### Keyboard Shortcuts
- `F11` or `F` - Enter fullscreen
- `ESC` - Exit fullscreen  
- `T` - Test patient trigger
- `M` - Toggle video/slideshow mode
- `D` - Toggle debug panel

### Debug Panel
Click the 🔧 button (top-right) to show debug controls:
- **Test Patient Call** - Simulate patient trigger
- **Toggle Media** - Switch between video/slideshow
- **Enter Fullscreen** - Go fullscreen
- **Status Display** - View polling and trigger status

### AppleScript Integration
Your existing AppleScript should write to `/app/trigger.json`:

```applescript
set patientName to "Herr Müller"
set triggerData to "{\"name\":\"" & patientName & "\"}"
do shell script "echo '" & triggerData & "' > /app/trigger.json"
```

## Customization

### Display Duration
Edit `displayTimeout` in `/app/frontend/app.js` (default: 5000ms)

### Slideshow Timing
Edit slideshow interval in `/app/frontend/app.js` (default: 5000ms)

### German Voice Settings
The system automatically selects German voices. Voice settings can be adjusted in the `speakGerman()` function.

### Styling
Modify `/app/frontend/style.css` for colors, fonts, animations, and layout.

## Troubleshooting

### Video Not Playing
- Ensure video file is in correct format (MP4 recommended)
- Check browser console for errors
- Switch to slideshow mode if video issues persist

### Text-to-Speech Not Working
- Ensure you're using Chrome/Safari (best TTS support)
- Check System Preferences > Accessibility > Speech on macOS
- Install German voice packages if needed

### File Polling Issues
- Verify `/app/trigger.json` exists and is writable
- Check server console for file system errors
- Ensure Flask server has file system permissions

### Fullscreen Issues
- Try different browsers (Chrome/Safari recommended)
- Use keyboard shortcuts (F11) instead of button
- Check browser fullscreen permissions

## Browser Compatibility

- ✅ **Chrome/Chromium** - Full support (recommended)
- ✅ **Safari** - Full support (great for macOS)
- ⚠️ **Firefox** - Limited TTS support
- ❌ **Edge** - Basic support only

## macOS Kiosk Mode

For true kiosk deployment:

1. Open Safari/Chrome in fullscreen
2. Navigate to `http://localhost:5000`
3. Use macOS Single App Mode or Guided Access
4. Hide dock and menu bar for clean display

## Technical Details

- **Backend**: Python Flask with file system monitoring
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **TTS**: Web Speech API with German language support
- **Media**: HTML5 video and image elements
- **Polling**: 1-second interval for trigger detection
- **Animations**: CSS transitions and keyframes

## Support

The system is designed to be simple and reliable for medical office environments. All components run locally without external dependencies.

For issues or customization needs, check the debug panel and browser console for diagnostic information.