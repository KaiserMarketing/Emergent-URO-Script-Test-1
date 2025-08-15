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
import threading

app = Flask(__name__)
CORS(app)

# Global variables to track file changes
last_trigger_content = None
last_modified_time = 0
trigger_file_path = "/app/trigger.json"

class TriggerFileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        global last_modified_time
        if event.src_path == trigger_file_path:
            last_modified_time = time.time()
            print(f"[{datetime.now()}] Trigger file modified")

def setup_file_watcher():
    """Setup file system watcher for trigger.json"""
    event_handler = TriggerFileHandler()
    observer = Observer()
    observer.schedule(event_handler, path="/app", recursive=False)
    observer.start()
    print("File watcher started for trigger.json")
    return observer

def read_trigger_file():
    """Read and parse trigger.json file"""
    try:
        if os.path.exists(trigger_file_path):
            with open(trigger_file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content:
                    return json.loads(content)
        return None
    except Exception as e:
        print(f"Error reading trigger file: {e}")
        return None

@app.route('/')
def index():
    """Serve the main display page"""
    return send_file('/app/frontend/index.html')

@app.route('/frontend/<path:filename>')
def frontend_files(filename):
    """Serve frontend static files"""
    return send_from_directory('/app/frontend', filename)

@app.route('/media/<path:filename>')
def media_files(filename):
    """Serve media files"""
    return send_from_directory('/app/media', filename)

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
        # Write empty object to trigger.json to mark as processed
        with open(trigger_file_path, 'w', encoding='utf-8') as f:
            json.dump({}, f)
        return jsonify({'status': 'cleared'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-trigger', methods=['POST'])
def test_trigger():
    """Debug endpoint to manually set trigger data"""
    try:
        test_data = {"name": "Herr Müller", "timestamp": time.time()}
        with open(trigger_file_path, 'w', encoding='utf-8') as f:
            json.dump(test_data, f, ensure_ascii=False)
        return jsonify({'status': 'test trigger set', 'data': test_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize trigger file if it doesn't exist
    if not os.path.exists(trigger_file_path):
        with open(trigger_file_path, 'w', encoding='utf-8') as f:
            json.dump({}, f)
    
    # Setup file watcher
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