#!/bin/sh

BUILDPATH=../../../webroot/js/build/v2
rm -f seegoo.map.min.js

#for /f %%i in (allInOne/packList.txt) do type %%i >> pack-all.js
INPUT=srcList.txt
OUTPUT=pack-all.js
#echo -n > $OUTPUT
while read LINE
do
  if [ -f $LINE ]; then
    echo "combining $LINE"
    cat $LINE >> $OUTPUT
    echo >> $OUTPUT
  fi
done < $INPUT

java -jar compiler.jar --formatting PRETTY_PRINT --compilation_level ADVANCED_OPTIMIZATIONS --js pack-all.js --js_output_file compiled.js --externs raphael.js
 
OUTPUT=seegoo.map.min.js
rm -f $OUTPUT
# cat raphael-min.js >> $OUTPUT
# echo >> $OUTPUT
cat header.js >> $OUTPUT
echo >> $OUTPUT
cat compiled.js >> $OUTPUT
echo >> $OUTPUT
cat footer.js >> $OUTPUT

echo --formatting PRETTY_PRINT 

rm -f pack-all.js
rm -f compiled.js
cp -f seegoo.map.min.js $BUILDPATH/

echo --formatting PRETTY_PRINT 
echo rm -f pack-all.js
cd $BUILDPATH
rm -f seegoo.map.min.js.gz 
gzip seegoo.map.min.js
