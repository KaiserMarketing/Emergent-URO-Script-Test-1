#!/usr/bin/env python3
"""
Medical Waiting Room Display System Launcher
Starts the Flask server and opens the display in the default browser.
"""

import os
import sys
import time
import subprocess
import webbrowser
from pathlib import Path

def install_dependencies():
    """Install required Python packages"""
    print("Installing dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"], 
                  cwd="/app", check=True)

def start_server():
    """Start the Flask server"""
    print("Starting Medical Waiting Room Display Server...")
    print("Server will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    
    # Change to app directory
    os.chdir("/app")
    
    # Start the server
    subprocess.run([sys.executable, "backend/server.py"])

def main():
    try:
        # Install dependencies first
        install_dependencies()
        
        # Start the server
        start_server()
        
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()