import shutil
import zipfile  # Correct module for ZipFile
import os
import time
import argparse
from dotenv import load_dotenv
load_dotenv(dotenv_path='.env.local')

def make_archive_without_excluded_folder(source_folder, archive_name, exclude_folder=None):
    """Create a zip archive excluding a specific folder."""
    with zipfile.ZipFile(archive_name, 'w', zipfile.ZIP_DEFLATED) as archive:
        for root, dirs, files in os.walk(source_folder):
            # Skip the excluded folder and its subdirectories if specified
            if exclude_folder and exclude_folder in dirs:
                dirs.remove(exclude_folder)
            for file in files:
                file_path = os.path.join(root, file)
                archive_path = os.path.relpath(file_path, source_folder)
                archive.write(file_path, archive_path)

try:
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Archive and update module folder")
    parser.add_argument("--no-archive", action="store_true", help="Skip archiving the current module folder")
    parser.add_argument("--no-packs", action="store_true", help="Skip copying the 'packs' folder (useful if your game is running and packs are LOCKED)")
    parser.add_argument("--server", type=str, help="Specify the server version (e.g., v12.343)")
    args = parser.parse_args()

    # Get the current folder and module name
    current_folder = os.path.dirname(os.path.abspath(__file__))
    module_name = os.path.basename(current_folder)

    # Get the target folder to update
    target_folder = os.path.join(os.getenv('FOUNDRY_DATA_PATH_BACKSLASHES'), "Data", "modules", module_name)
    print(f"Target folder resolved to: {target_folder}")  # Debug log for target folder

    # Print the server version if provided
    if args.server:
        print(f"Server version specified: {args.server}")
        target_folder = os.path.join(os.getenv('NODE_SERVERS_PATH_BACKSLASHES'), f"{args.server}-data", "Data", "modules", module_name)
        print(f"Updated target folder for server version: {target_folder}")  # Debug log for updated target folder

    # Archive (zip) the current target folder
    if not args.no_archive:
        archive_target = os.path.join(current_folder, "archive", "foundry-modules_folder-archive", module_name + "-" + time.strftime("%Y-%m-%d--%H.%M.%S") + ".zip")
        print(f"Archiving target folder: {target_folder} to {archive_target}.zip")  # Debug log for archiving
        make_archive_without_excluded_folder(target_folder, archive_target, "packs" if args.no_packs else None)
        print(f"Archived {target_folder} to {archive_target}.zip")

    # Update the target folder with the contents of the current dist folder
    dist_folder = os.path.join(current_folder, "dist")
    print(f"Dist folder resolved to: {dist_folder}")  # Debug log for dist folder

    for root, dirs, files in os.walk(dist_folder):
        print(f"Processing directory: {root}")  # Debug log for current directory
        relative_root = os.path.relpath(root, dist_folder)
        target_root = os.path.join(target_folder, relative_root)
#         # print(f"Target root resolved to: {target_root}")  # Debug log for target root

        # Skip processing the excluded folder and its subdirectories if --no-packs is specified
        if args.no_packs and "packs" in dirs:
            print(f"Skipping excluded folder: packs")  # Debug log for exclusion
            dirs.remove("packs")

        # Create directories if they don't exist
        try:
#             # print(f"Creating target directory: {target_root}")  # Debug log for directory creation
            os.makedirs(target_root, exist_ok=True)
        except Exception as e:
            print(f"Error creating directory {target_root}: {str(e)}")  # Log directory creation error
            raise

        # Copy files
        for file in files:
            source_file = os.path.join(root, file)
            target_file = os.path.join(target_root, file)
            try:
#                 # print(f"Copying file: {source_file} to {target_file}")  # Debug log for file copy
                shutil.copy2(source_file, target_file)
            except PermissionError as e:
                print(f"Permission denied while copying {source_file} to {target_file}. Skipping this file.")  # Log permission error
            except Exception as e:
                print(f"Error copying file {source_file} to {target_file}: {str(e)}")  # Log other errors
                raise

    print(f"Updated {target_folder} with the contents of the dist folder, excluding {'packs' if args.no_packs else 'nothing'}.")

except Exception as e:
    print(f"An error occurred: {str(e)}")
