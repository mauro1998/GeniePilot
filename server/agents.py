import requests
import agent_secrets

def query(agent, payload):
    response = requests.post(agent, json=payload)
    return response.json()


def get_yaml(description ,image_url):
    output = query(agent_secrets.agent_screenshot_to_ui_tree,
    {
        "question": description,
        "uploads": [
            {
                "data": image_url,
                "type": "url",
                "name": "screenshot.png",
                "mime": "image/png"
            }
        ]
    })
    return output


def get_test_cases(description):
    output = query(agent_secrets.agent_yaml_to_test_cases,
    {
        "question": description
    })
    return output
