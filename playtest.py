import shutil
import os
import time
import argparse
from dotenv import load_dotenv
load_dotenv(dotenv_path='.env.local')

try:
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Archive and update module folder")
    parser.add_argument("--no-archive", action="store_true", help="Skip archiving the current module folder")
    args = parser.parse_args()

    # Get the current folder and module name
    current_folder = os.path.dirname(os.path.abspath(__file__))
    module_name = os.path.basename(current_folder)
 
    # Get the target folder to update
    target_folder = os.path.join(os.getenv('FOUNDRY_GAME_PATH_BACKSLASHES'), module_name)

    # Archive (zip) the current target folder
    if not args.no_archive:
        archive_target = os.path.join(current_folder, "archive", "foundry-modules_folder-archive", module_name + "-" + time.strftime("%Y-%m-%d--%H.%M.%S"))
        shutil.make_archive(archive_target, "zip", target_folder)
        print(f"Archived {target_folder} to {archive_target}.zip")

    # Update the target folder with the contents of the current dist folder
    shutil.rmtree(target_folder)
    shutil.copytree(os.path.join(current_folder, "dist"), target_folder)
    print(f"Updated {target_folder} with the contents of the dist folder.")

except Exception as e:
    print(f"An error occurred: {str(e)}")
