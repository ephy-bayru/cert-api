from pathlib import Path
import os

# Function to print the directory structure while excluding certain directories
def print_directory_structure(start_path, level=0, output=[]):
    start_path = Path(start_path)
    prefix = " " * (4 * level) + "|-- " if level > 0 else ""
    output.append(f"{prefix}{start_path.name}/")
    
    for path in sorted(start_path.iterdir()):
        # Skip 'node_modules', 'dist', and '.git' directories
        if path.name in ['node_modules', 'dist', '.git']:
            continue
        
        if path.is_dir():
            print_directory_structure(path, level + 1, output)
        else:
            file_prefix = " " * (4 * (level + 1)) + "|-- "
            output.append(f"{file_prefix}{path.name}")
    
    return output

# Automatically use the current directory
project_path = os.getcwd()

# Get the directory structure as a list of strings
directory_structure = print_directory_structure(project_path)

# Print the structure
for line in directory_structure:
    print(line)

# Write the directory structure to a new Markdown (.md) file
with open('directory_structure.md', 'w') as f:
    for line in directory_structure:
        f.write(f"{line}\n")

print("\nDirectory structure saved to 'directory_structure.md'")
