#!/bin/bash

base="examples/base-playwright"
actual="examples/playwright"
cypress_files="examples/base-cypress-12.7.0"

echo "Building and migrating $cypress_files"
rm -rf ./examples/playwright

tput setaf 4; echo -e "[Test INFO]: Building code"; tput sgr0
npm run build &> /dev/null && node lib/bin/cypress-to-playwright.js $cypress_files &> /dev/null

function validateDirectories {
  if [ ! -d "$base" ]; then
    echo "Test Failed: Directory $base does not exist"
    exit 1
  fi

  if [ ! -d "$actual" ]; then
    echo "Test Failed: Directory $actual does not exist"
    exit 1
  fi
}

validateDirectories
# Check that both directories exist

tput setaf 4; echo -e "[Test INFO]: Executing test: Comparing $base and $actual"; tput sgr0
# Compare the contents of the two directories
diff_out=$(diff -r "$base" "$actual")

# If there is no difference, exit with a success message
if [ -z "$diff_out" ]; then
  tput setaf 2; echo "[Test PASS]: Directories are identical"; tput sgr0
  exit 0
else
  # Otherwise, output an error message for each file that is different
  tput setaf 1; echo "[Test FAILED]:"; tput sgr0
  echo "$diff_out" | while read line; do
    echo -e "- Change detected: $line\n"
  done
  exit 1
fi


