#!/usr/bin/env python3
"""
Medical Waiting Room Display System Launcher
Starts the Flask server and opens the display in the default browser.
"""

import os
import sys
import subprocess
from pathlib import Path

# Resolve project root path (where this script is located)
PROJECT_ROOT = Path(__file__).parent.resolve()

def install_dependencies():
    """Install required Python packages"""
    print("Installing dependencies...")
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", str(PROJECT_ROOT / "backend" / "requirements.txt")],
        check=True
    )

def start_server():
    """Start the Flask server"""
    print("Starting Medical Waiting Room Display Server...")
    print("Server will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")

    # Change working directory to project root
    os.chdir(PROJECT_ROOT)

    # Start Flask server
    subprocess.run([sys.executable, str(PROJECT_ROOT / "backend" / "server.py")])

def main():
    try:
        install_dependencies()
        start_server()
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
