import os
import json

def minify_json_files(directory):
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            file_path = os.path.join(directory, filename)
            
            # Read the JSON file
            with open(file_path, 'r', encoding='utf-8') as file:
                try:
                    data = json.load(file)
                except json.JSONDecodeError as e:
                    print(f"Skipping {file_path}: {e}")
                    continue
            
            # Minify the JSON content
            minified_json = json.dumps(data, separators=(',', ':'))
            
            # Write the minified JSON back to the file
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(minified_json)
            
            print(f"Minified {file_path}")

# Specify the directory containing JSON files
directory_path = '.'

minify_json_files(directory_path)