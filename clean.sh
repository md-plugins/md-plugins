#!/bin/bash

# Array of filenames or patterns to delete
files_to_delete=(
  "*.d.ts"
  "*.js"
)

# Directories to exclude
exclude_dirs=(
  "./node_modules"
  "./dist"
  "./docs"
)

# Build the exclusion part of the find command
exclude_expr=""
for dir in "${exclude_dirs[@]}"; do
  exclude_expr="$exclude_expr -path \"$dir\" -prune -o"
done

# Remove the trailing -o from the exclude_expr
exclude_expr="${exclude_expr%-o}"

# Loop through the array and delete matching files, excluding specified directories
for file in "${files_to_delete[@]}"; do
  echo "Deleting files matching: $file (excluding ${exclude_dirs[*]})"
  find . \( $exclude_expr \) -name "$file" -type f -print | xargs rm -f
done

echo "Deletion complete."