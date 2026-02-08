from flask import Flask, jsonify, request

from weekly_prompt import generate_weekly_prompt

app = Flask(__name__)


@app.get("/api/weekly-prompt")
def weekly_prompt():
    group_name = request.args.get("groupName", "").strip() or "Your Group"
    category = request.args.get("category", "").strip() or "General"

    prompt = generate_weekly_prompt(category, group_name)
    response = jsonify({"prompt": prompt})
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
