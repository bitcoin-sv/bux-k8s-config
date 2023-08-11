#!/bin/bash

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <replacement_string>"
    exit 1
fi

replacement="$1"

# Function to replace string recursively in files
replace_string() {
    for file in "$1"/*; do
        if [ -d "$file" ]; then
            replace_string "$file"
        elif [ -f "$file" ] && [ "$file" != "$0" ]; then
            sed -i '' "s/DOMAIN_NAME_TLD/$replacement/g" "$file"
        fi
    done
}

# Start replacement from the current directory
replace_string .
