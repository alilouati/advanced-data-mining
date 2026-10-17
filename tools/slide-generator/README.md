# Slide generator

Decks are generated with [pptxgenjs](https://gitbrent.github.io/PptxGenJS/) and figures with matplotlib.

```bash
python3 figs.py            # regenerate figures into ./figs
node build.js 1 2 3        # build chapter decks into ./out
python3 make_labs.py       # regenerate the lab notebooks
```

`lib.js` holds the theme and slide layouts; `chN.js` holds the content of chapter N; `pubs.js` lists the instructor's publications cited in the decks.
Note: `lib.js` loads a locally patched copy of pptxgenjs (paragraph-property fix for mixed bold/regular bullet text); change the `require` path to `pptxgenjs` if you rebuild elsewhere.
