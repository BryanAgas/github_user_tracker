import sys
import http.client
import json

# Function to fetch GitHub user activity
def fetch_github_activity(username):
    # Connect to GitHub API
    conn = http.client.HTTPSConnection("api.github.com")
    
    # Form the request URL
    url = f"/users/{username}/events"
    
    # Send GET request to fetch events
    headers = {'User-Agent': 'PythonApp'}  # GitHub API requires a User-Agent header
    try:
        conn.request("GET", url, headers=headers)
        response = conn.getresponse()
    except OSError as error:
        print(f"Error: Could not reach GitHub ({error}).")
        conn.close()
        return
    
    # Check if the request was successful
    if response.status != 200:
        print(f"Error: Failed to fetch data for user '{username}'. Status code: {response.status}")
        conn.close()
        return
    
    # Parse the response data
    data = response.read()
    try:
        events = json.loads(data.decode("utf-8"))
    except ValueError:
        print("Error: GitHub returned a response that could not be read.")
        conn.close()
        return
    
    # Close the connection
    conn.close()
    
    # Display the events
    if len(events) == 0:
        print(f"No recent activity found for user '{username}'.")
    else:
        for event in events:
            display_event(event)

# Function to display each event in a readable format
def display_event(event):
    event_type = event.get("type")
    repo_name = (event.get("repo") or {}).get("name", "an unknown repository")
    
    payload = event.get("payload") or {}

    if event_type == "PushEvent":
        # GitHub no longer always includes the commit list in push events
        commits = payload.get("commits")
        if commits is None:
            print(f"Pushed to {repo_name}")
        else:
            print(f"Pushed {len(commits)} commit(s) to {repo_name}")
    elif event_type == "IssuesEvent":
        action = payload.get("action") or "updated"
        print(f"{action.capitalize()} an issue in {repo_name}")
    elif event_type == "WatchEvent":
        print(f"Starred {repo_name}")
    else:
        print(f"{event_type} event occurred in {repo_name}")

# Entry point of the CLI application
if __name__ == "__main__":
    # Check if the username is provided as an argument
    if len(sys.argv) != 2:
        print("Usage: github-activity <username>")
        sys.exit(1)
    
    # Get the GitHub username from the command-line argument
    github_username = sys.argv[1]
    
    # Fetch and display GitHub user activity
    fetch_github_activity(github_username)

"""How to use

python github_activity.py BryanAgas

"""