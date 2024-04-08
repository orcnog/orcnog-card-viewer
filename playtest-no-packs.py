import shutil
import os
import argparse

try:
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Update module folder")
    parser.add_argument("--exclude-folder", default="packs/macros", help="Folder to exclude from update (default: packs/macros)")
    args = parser.parse_args()

    # Get the current folder and module name
    current_folder = os.path.dirname(os.path.abspath(__file__))
    module_name = os.path.basename(current_folder)
 
    # Get the target folder to update
    target_folder = os.path.join("D:\\DND\\Foundry VTT\\Data\\modules", module_name)

    # Set a folder to exclude
    def ignore_specific_folder(src, names):
        # Specify the name of the folder you want to exclude
        folder_to_exclude = args.exclude_folder
        # Return a list of names to exclude
        return [name for name in names if name == folder_to_exclude]

    # Update the target folder with the contents of the current dist folder
    for root, dirs, files in os.walk(os.path.join(current_folder, "dist")):
        relative_root = os.path.relpath(root, os.path.join(current_folder, "dist"))
        target_root = os.path.join(target_folder, relative_root)
        # Exclude the specified folder from being copied
        if args.exclude_folder in dirs:
            dirs.remove(args.exclude_folder)
        # Create directories if they don't exist
        os.makedirs(target_root, exist_ok=True)
        for file in files:
            shutil.copy2(os.path.join(root, file), os.path.join(target_root, file))

    print(f"Updated {target_folder} with the contents of the dist folder, excluding {args.exclude_folder}.")

except Exception as e:
    print(f"An error occurred: {str(e)}")
