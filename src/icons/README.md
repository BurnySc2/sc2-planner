To get the icons as .png files:

- Install and update StarCraft 2
- Download CascView from http://www.zezula.net/en/casc/main.html
- Run CascView and open CASC storage `.../Program Files (x86)/StarCraft II`
- If on linux, use wine to run it
- Use the search tool inside CascView and search for file mask `*\btn*.dds`
- Select and extract all those files
- Linux: Install imagemagick `sudo apt-get install imagemagick-6.q16` which enables the `convert` command
- Convert all `.dds` files to `.png` using command
    ```shell script
    for file in *.dds
    do
        convert "$file" "$(basename "$file" .dds).png"
    done
    ```
- Copy the resulting .png files in the `src/icons/icons_all` subfolder
- Run the script `copy_icons.py` which automatically copies all the needed button icons to the `src/icons/png` subfolder

