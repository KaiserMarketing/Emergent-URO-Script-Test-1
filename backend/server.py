#!/usr/bin/env python3
"""
Simple Flask server for medical waiting room display system.
Serves frontend files and provides API to monitor trigger.json changes.
"""

import os
import json
import time
from datetime import datetime
from flask import Flask, jsonify, send_from_directory, send_file
from flask_cors import CORS
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from pathlib import Path
import threading

# Cross-platform project root and paths
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
TRIGGER_FILE_PATH = PROJECT_ROOT / "trigger.json"
FRONTEND_PATH = PROJECT_ROOT / "frontend"
MEDIA_PATH = PROJECT_ROOT / "media"

app = Flask(__name__)
CORS(app)

# Global variables to track file changes
last_trigger_content = None
last_modified_time = 0
trigger_file_path = TRIGGER_FILE_PATH

class TriggerFileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        global last_modified_time
        if Path(event.src_path).resolve() == trigger_file_path.resolve():
            last_modified_time = time.time()
            print(f"[{datetime.now()}] Trigger file modified")

def setup_file_watcher():
    """Setup file system watcher for trigger.json"""
    event_handler = TriggerFileHandler()
    observer = Observer()
    observer.schedule(event_handler, path=str(PROJECT_ROOT), recursive=False)
    observer.start()
    print("File watcher started for trigger.json")
    return observer

def read_trigger_file():
    """Read and parse trigger.json file"""
    try:
        if trigger_file_path.exists():
            content = trigger_file_path.read_text(encoding='utf-8').strip()
            if content:
                return json.loads(content)
        return None
    except Exception as e:
        print(f"Error reading trigger file: {e}")
        return None

@app.route('/')
def index():
    """Serve the main display page"""
    return send_file(FRONTEND_PATH / "index.html")

@app.route('/frontend/<path:filename>')
def frontend_files(filename):
    """Serve frontend static files"""
    return send_from_directory(str(FRONTEND_PATH), filename)

@app.route('/media/<path:filename>')
def media_files(filename):
    """Serve media files"""
    return send_from_directory(str(MEDIA_PATH), filename)

@app.route('/api/trigger')
def get_trigger():
    """API endpoint to get current trigger data"""
    trigger_data = read_trigger_file()
    return jsonify({
        'trigger': trigger_data,
        'timestamp': last_modified_time,
        'has_data': trigger_data is not None
    })

@app.route('/api/clear-trigger', methods=['POST'])
def clear_trigger():
    """API endpoint to clear trigger after processing"""
    try:
        trigger_file_path.write_text(json.dumps({}, ensure_ascii=False), encoding='utf-8')
        return jsonify({'status': 'cleared'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-trigger', methods=['POST'])
def test_trigger():
    """Debug endpoint to manually set trigger data"""
    try:
        test_data = {"name": "Herr Müller", "timestamp": time.time()}
        trigger_file_path.write_text(json.dumps(test_data, ensure_ascii=False), encoding='utf-8')
        return jsonify({'status': 'test trigger set', 'data': test_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if not trigger_file_path.exists():
        trigger_file_path.write_text(json.dumps({}, ensure_ascii=False), encoding='utf-8')

    observer = setup_file_watcher()

    try:
        print("Starting Medical Waiting Room Display Server...")
        print("Access the display at: http://localhost:5000")
        print("Press Ctrl+C to stop")
        app.run(host='0.0.0.0', port=5000, debug=False)
    except KeyboardInterrupt:
        observer.stop()
        observer.join()
        print("\nServer stopped")
