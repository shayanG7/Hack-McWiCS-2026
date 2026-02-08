# Hack-McWiCS-2026

Notable is a hackathon project that generates weekly discussion prompts for news groups using Gemini.

## Features
- Create and join groups on the homepage (stored in localStorage).
- Per-group prompt of the week pulled from Gemini (cached per group).
- Per-group posts stored in localStorage.

## Project Structure
- [backend](backend): Flask API and prompt generation.
- [dummy_website](dummy_website): Static frontend and assets.
- [module.py](module.py): Database models (early-stage).

## Requirements
- Python 3.12+ recommended
- `pip install -r requirements.txt` (if you add one) or install dependencies manually:
	- `flask`
	- `google-genai`

## Configuration
Set a Gemini API key before running the backend.

Recommended (safer) approach:
- Create an environment variable named `GEMINI_API_KEY`.
- Update [backend/weekly_prompt.py](backend/weekly_prompt.py) to read `os.environ["GEMINI_API_KEY"]` instead of hardcoding the key.

## Run the Backend API
From the repo root:

```bash
python backend/app.py
```

This starts the API at `http://localhost:8000`.

## Run the Frontend
From the repo root:

```bash
python dummy_website/serve.py
```

Then open `http://localhost:8000` in your browser.

## How Prompts Work
- The frontend calls `GET /api/weekly-prompt?groupName=...&category=...` on first visit.
- The response is cached per group in localStorage.
- The prompt is displayed in the `#group-prompt` label on the group page.

## Notes
- This is a hackathon prototype and uses localStorage for client data.
- If you see CORS issues, confirm the backend is running and reachable at `localhost:5000`.

