#!/usr/bin/env bash
#
# Tidys a google doc
#
# To use:
#   1. Export Google document to HTML
#   2. Run this script on the file:
#         ./gdoctidy.sh GoogleDoc.html

OUTFILE=`basename $1 .html`-tidy.html

cat $1 | \
  sed -e 's/ id\="[^"]*"//gm' | \
  sed -e 's/ name\="[^"]*"//gm' | \
  sed -e 's/ class\="[^"]*"//gm' | \
  sed -e 's/ style\="[^"]*"//gm' | \
  sed -e 's/ start\="[^"]*"//gm' | \
  sed -e 's/\&nbsp\;//gm' | \
  sed -r 's/<span>([^<]*)?<\/span>/\1/gm' |
  tidy -utf8 -i -w 80 -c --show-body-only y -o $OUTFILE

echo "\n\nWrote $OUTFILE"

