#!/bin/bash
# usage: render.sh N  -> renders out/ChN_*.pptx to build/chN/slide-XX.jpg
f=$(ls /home/claude/course/out/Ch$1_*.pptx); d=/home/claude/course/build/ch$1
rm -rf $d; mkdir -p $d; cp "$f" $d/deck.pptx
cd $d && python3 /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf deck.pptx >/dev/null 2>&1
pdftoppm -jpeg -r 50 deck.pdf slide 2>/dev/null
python3 -c "
from PIL import Image; import glob,math
fs=sorted(glob.glob('slide-*.jpg'))
for part in range(0,len(fs),12):
    sub=fs[part:part+12]; im0=Image.open(sub[0]); W,H=im0.size
    sheet=Image.new('RGB',(W*3+20,(H+10)*math.ceil(len(sub)/3)),'#888')
    for i,f in enumerate(sub): sheet.paste(Image.open(f),((i%3)*(W+10),(i//3)*(H+10)))
    sheet.save(f'grid{part//12}.jpg',quality=85)
print(len(fs),'slides')
"
