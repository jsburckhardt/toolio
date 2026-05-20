#!/usr/bin/env python3
"""Custom HTTP server for Pipeline Controller.

Serves static files from site/ and exposes state API endpoints.
"""

import argparse
import json
import os
import subprocess
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


class PipelineHandler(SimpleHTTPRequestHandler):
    """Handler that serves static files and state API."""

    state_file = ""
    tool_dir = ""

    def do_GET(self):
        if self.path == "/api/state":
            self._serve_state()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/stage/") and self.path.endswith("/start"):
            parts = self.path.split("/")
            if len(parts) == 5:
                stage_id = parts[3]
                self._start_stage(stage_id)
            else:
                self._send_error(404, "Not found")
        elif self.path.startswith("/api/stage/") and self.path.endswith("/complete"):
            parts = self.path.split("/")
            if len(parts) == 5:
                stage_id = parts[3]
                self._complete_stage(stage_id)
            else:
                self._send_error(404, "Not found")
        else:
            self._send_error(404, "Not found")

    def _serve_state(self):
        try:
            with open(self.state_file, "r") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(data.encode())
        except FileNotFoundError:
            self._send_error(404, "State file not found")
        except Exception as e:
            self._send_error(500, str(e))

    def _start_stage(self, stage_id):
        result = self._run_state_command("state_set_stage", stage_id, "running")
        if result.returncode == 0:
            self._send_json(200, {"ok": True, "stage": stage_id, "status": "running"})
        else:
            self._send_error(400, result.stderr.strip())

    def _complete_stage(self, stage_id):
        result = self._run_state_command("state_set_stage", stage_id, "done")
        if result.returncode == 0:
            self._send_json(200, {"ok": True, "stage": stage_id, "status": "done"})
        else:
            self._send_error(400, result.stderr.strip())

    def _run_state_command(self, func, *args):
        cmd = f'source "{self.tool_dir}/lib/state.sh" && {func} {" ".join(args)}'
        return subprocess.run(
            ["bash", "-c", cmd],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(self.state_file),
        )

    def _send_json(self, code, data):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _send_error(self, code, message):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode())

    def log_message(self, format, *args):
        """Suppress default logging to keep output clean."""
        pass


def main():
    parser = argparse.ArgumentParser(description="Pipeline Controller HTTP Server")
    parser.add_argument("--port", type=int, default=8080, help="Port to listen on")
    parser.add_argument("--site-dir", required=True, help="Path to site/ directory")
    parser.add_argument("--state-file", required=True, help="Path to state file")
    args = parser.parse_args()

    site_dir = os.path.abspath(args.site_dir)
    tool_dir = os.path.abspath(os.path.join(site_dir, ".."))

    PipelineHandler.state_file = os.path.abspath(args.state_file)
    PipelineHandler.tool_dir = tool_dir

    os.chdir(site_dir)

    server = HTTPServer(("localhost", args.port), PipelineHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
