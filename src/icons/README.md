To get the icons as .png files:

- Install StarCraft 2
- Download CascView from http://www.zezula.net/en/casc/main.html
- Run CascView and open directory `.../Program Files (x86)/StarCraft II/SC2Data/data`
- If on linux, use wine to run it
- Use the search tool and search for file mask `*\btn*.dds`
- Extract all those files
- Linux: Install imagemagick `sudo apt-get install imagemagick-6.q16` which enables the `convert` command
- Convert all .dds files using command
    ```shell script
    for file in *.dds
    do
        convert "$file" "$(basename "$file" .dds).png"
    done
    ```
- Copy the resulting .png files in the `/icons_all` subfolder
- Run the script `copy_icons.py`

