const { Deck } = require("./lib");
const path = require("path");
(async () => {
  for (const n of process.argv.slice(2)) {
    const ch = require(`./ch${n}.js`);
    const d = new Deck(ch.meta);
    await ch.build(d);
    const safe = ch.meta.title.replace(/[^A-Za-z0-9]+/g, "_").replace(/_+$/, "");
    await d.save(path.join(__dirname, "out", `Ch${n}_${safe}.pptx`));
  }
})().catch(e => { console.error(e); process.exit(1); });
