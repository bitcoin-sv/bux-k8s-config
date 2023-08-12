#!/bin/bash

echo "replace_username.sh: replace all occurences of GITHUB_USERNAME with $1, except file: $0"

replacement="$1"

# Function to replace string recursively in files
replace_string() {
    for file in "$1"/*; do
        if [ -d "$file" ]; then
            replace_string "$file"
        elif [ -f "$file" ] && [ "$file" != "./$0" ]; then
            sed -i "s/GITHUB_USERNAME/$replacement/g" "$file"
        fi
    done
}

# Start replacement from the current directory
replace_string .
