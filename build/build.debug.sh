#!/bin/sh

#BUILDPATH=../../../engine-projects/engine-front/webroot/js/build/v2
BUILDPATH=../examples/js/maptalks
rm -f $BUILDPATH/maptalks.js.gz
rm -f $BUILDPATH/maptalks.js

#for /f %%i in (allInOne/packList.txt) do type %%i >> pack-all.js
INPUT=srcList.txt
OUTPUT=compiled.js
#echo -n > $OUTPUT
while read LINE
do
  if [ -f $LINE ]; then
    echo "combining $LINE"
    cat $LINE >> $OUTPUT
    echo >> $OUTPUT
  fi
done < $INPUT
#cat seegoo.map.extern.js >> $OUTPUT

#/home/duscin/work/java/jdk/jdk1.7.0_25/bin/java -jar compiler.jar --formatting PRETTY_PRINT --compilation_level WHITESPACE_ONLY --js pack-all.js --js_output_file compiled.js --externs ../webroot/js/raphael.js seegoo.map.extern.js
 
#for /f %%i in (closurePack.txt) do type %%i >> ../webroot/js/build/maptalks.js
# INPUT=./packList.txt
# OUTPUT=maptalks.js
# echo -n > $OUTPUT
# while read LINE
# do
#   if [ -f $LINE ]; then
#   	echo "combining $LINE"
#     cat $LINE >> $OUTPUT
#     echo -n >> $OUTPUT
#     echo \\n >> $OUTPUT
#   fi
# done < $INPUT
OUTPUT=$BUILDPATH/maptalks.js
rm -f $OUTPUT
cat header.js >> $OUTPUT
cat compiled.js >> $OUTPUT
cat footer.js >> $OUTPUT

rm compiled.js

echo --formatting PRETTY_PRINT 
cd $BUILDPATH
#rm -f maptalks.js.gz
#gzip maptalks.js
