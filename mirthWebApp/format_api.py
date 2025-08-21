import json

try:
    # Read the API file
    with open(API,r, encoding='utf-8f:
        content = f.read()
    
    # Parse the JSON
    parsed = json.loads(content)
    
    # Write back with proper formatting
    with open(API,w, encoding='utf-8as f:
        json.dump(parsed, f, indent=2, ensure_ascii=False)
    
    print(API filehas been formatted successfully!")
except Exception as error:
    print(f"Error formatting API file: {error}") 