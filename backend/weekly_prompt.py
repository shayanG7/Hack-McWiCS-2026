import google.genai as genai
import os

def generate_weekly_prompt(category, group_name):
    """
    Use Gemini To generate a weekly discussion prompt for a news group based on its category and name.
    :param category: Group  (ex: "Technology", "K-Pop", "Politics")
    :param group_name: Group Name (ex: "Tech Enthusiasts", "K-Pop Fans", "Political Debaters")
    :return: A string containing the generated prompt.
    """
    try:
        client = genai.Client(api_key="AIzaSyAfRffcs067Ka5eJ-XAZ4MSAYfeNAwdNvY")

        # Prompt
        prompt = f"""
        You are a creative community manager for a news discussion group called '{group_name}' focused on '{group_name}'.
        Generate a single, engaging, "Question of the Week" for the members to discuss.
        
        Requirements:
        1. The question should be relevant to {group_name}.
        2. It should encourage everyone brings up different interesting opinions.
        3. Keep it under 20 words.
        4. Do not include phrases like "Here is a question". Just output the question directly.
        5. The group might have members with varying levels of knowledge, so make it accessible but still intriguing.
        6. The group member can ask to change a question, try to make the new question more interesting or more controversial than the previous one.
        """

        response = client.models.generate_content(
            model = "gemini-3-flash-preview", 
            contents = prompt)
        
        return response.text.strip()

    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return f"What's the most interesting thing you heard about {group_name} this week?"

#if __name__ == "__main__":
#    print(generate_weekly_prompt("Stranger Things", "Binge Watchers"))