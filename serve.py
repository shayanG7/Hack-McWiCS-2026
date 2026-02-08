import http.server
import os

PORT = 8000
DIRECTORY = os.path.join(os.path.dirname(__file__), "dummy_website")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

if __name__ == "__main__":
    with http.server.HTTPServer(("", PORT), Handler) as httpd:
        print(f"Serving dummy_website at http://localhost:{PORT}")
        httpd.serve_forever()
