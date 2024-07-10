import json
import os

def convert_geojson(input_file, output_file):
    # Read the input GeoJSON file
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    # Define a function to map properties
    def map_properties(properties):
        new_properties = {
            "NAME": properties.get("name", '')
        }
        return new_properties
    
    # Apply the mapping to each feature in the GeoJSON
    for feature in data['features']:
        feature['properties'] = map_properties(feature['properties'])
    
    # Write the output GeoJSON file
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=4)
    
    print(f"Converted GeoJSON saved to {output_file}")

# Get the directory containing the neighborhood GeoJSON files
input_directory = 'neighborhoods-master'
output_directory = '.'

# Loop through every file in the input directory
for filename in os.listdir(input_directory):
    if filename.endswith('.geojson'):
        input_file_path = os.path.join(input_directory, filename)
        output_file_path = os.path.join(output_directory, filename.replace('.geojson', '.json'))
        convert_geojson(input_file_path, output_file_path)