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
    conn.request("GET", url, headers=headers)
    
    # Get the response
    response = conn.getresponse()
    
    # Check if the request was successful
    if response.status != 200:
        print(f"Error: Failed to fetch data for user '{username}'. Status code: {response.status}")
        conn.close()
        return
    
    # Parse the response data
    data = response.read()
    events = json.loads(data.decode("utf-8"))
    
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
    repo_name = event["repo"]["name"]
    
    if event_type == "PushEvent":
        commit_count = len(event["payload"]["commits"])
        print(f"Pushed {commit_count} commit(s) to {repo_name}")
    elif event_type == "IssuesEvent":
        action = event["payload"]["action"]
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