"""
This small script reads the required icon names from the source files "unit_icons.json" and "upgrade_icons.json" from this directory as well as the customactions.json from the src/constants/ directory.

It tries to find all icons from the "icons_all" subfolder (does not exist by default, the user will have to fill in the icons here) and if they are required by the sc2-planner, they will be copied to the "png" subfolder.
"""
import json
import os
import shutil
import sys
from pathlib import Path
from typing import Set

folder = Path(__file__).parent
unit_icons_path = folder / 'unit_icons.json'
upgrade_icons_path = folder / 'upgrade_icons.json'
custom_actions_icons_path = folder.parent / 'constants' / 'customactions.json'

with open(unit_icons_path, encoding='utf-8') as f:
    UNIT_ICONS = json.load(f)
with open(upgrade_icons_path, encoding='utf-8') as f:
    UPGRADE_ICONS = json.load(f)
with open(custom_actions_icons_path, encoding='utf-8') as f:
    CUSTOM_ACTIONS = json.load(f)

if __name__ == '__main__':
    # Gather all file names
    image_names_to_copy: Set[str] = set()
    image_names_to_copy.update(set(UNIT_ICONS.values()))
    image_names_to_copy.update(set(UPGRADE_ICONS.values()))
    image_names_to_copy.update({d['imageSource'] for d in CUSTOM_ACTIONS})

    # Copy files
    path: Path = Path(__file__).parent
    source_folder = path / 'icons_all'
    if not source_folder.exists():
        print("'icons_all' subfolder missing. Exiting.")
        sys.exit(1)

    target_folder = path / 'png'
    if not target_folder.exists():
        print(f'Target folder {target_folder} did not exist. Creating.')
        os.makedirs(target_folder, exist_ok=True)

    for image_name in image_names_to_copy:
        source_path = source_folder / image_name
        target_path = target_folder / image_name
        if target_path.is_file():
            # print(f"File {image_name} already exists, skipping.")
            pass
        elif source_path.is_file():
            print(f'Copying {image_name}')
            shutil.copy(source_path, target_path)
        else:
            print(f'Missing icon file: {image_name}')
