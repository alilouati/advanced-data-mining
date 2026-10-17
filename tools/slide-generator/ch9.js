const P = require("./pubs");
module.exports = {
  meta: { num: 9, title: "Association Rules & Sequential Patterns", short: "Association Rules" },
  async build(d) {
    await d.cover({ subtitle: "Frequent itemsets, Apriori, FP-Growth, interestingness and sequences",
      notes: "Condensed from the previous 80-slide chapter: the core algorithms (Apriori, FP-Growth, GSP) remain, data-format details (ARFF) are removed, and interestingness measures, closed/maximal itemsets and PrefixSpan are added." });
    await d.objectives([
      ["FaShoppingBasket", "**Define** itemsets, support, confidence and association rules"],
      ["FaLayerGroup", "**Execute** Apriori by hand, including candidate join and prune"],
      ["FaTree", "**Build** an FP-tree and explain pattern growth"],
      ["FaFilter", "**Rank** rules with lift, leverage and conviction; avoid spurious rules"],
      ["FaStream", "**Mine** sequential patterns with GSP and PrefixSpan"],
    ]);
    await d.agenda([["Concepts", "Itemsets, support, rules"], ["Apriori", "Level-wise search"], ["FP-Growth & beyond", "Pattern growth, compact patterns"], ["Which rules matter?", "Interestingness, CARs"], ["Sequences", "GSP, PrefixSpan"]]);

    await d.divider(1, "Concepts", "Items, transactions and rules");
    await d.concept({ title: "Market-basket analysis", icon: "FaShoppingBasket", kicker: "AGRAWAL, IMIELIŃSKI & SWAMI, SIGMOD 1993",
      def: "Find rules **X → Y** such that transactions containing the itemset X tend to also contain Y.",
      bullets: ["**Items** I = {i₁ … iₙ}: products, words, symptoms, web pages", "**Transaction** t ⊆ I: a basket, a document, a session", "**Itemset**: any subset; a k-itemset has k items", "Example: {bread} → {mineral water}, confidence 85 %",
        "Uses: store layout, cross-selling, recommendation, co-prescription, log analysis"],
      notes: "The 'diapers and beer' story is widely repeated but is largely a myth (D. Power, 2002); we drop it from the slides and use verifiable examples instead." });
    await d.formulas({ title: "Support and confidence", items: [
      ["Support of itemset", "sup(X) = |{t ∈ T : X ⊆ t}| / |T|", "How often X appears — frequent if sup(X) ≥ minsup"],
      ["Rule support", "sup(X → Y) = sup(X ∪ Y)", "How often the whole rule applies"],
      ["Confidence", "conf(X → Y) = sup(X ∪ Y) / sup(X)", "Estimate of P(Y | X)"],
      ["Mining task", "find all rules with sup ≥ minsup and conf ≥ minconf", "Step 1: frequent itemsets (expensive) · Step 2: rules (cheap)"]],
      notes: "Step 2: for every frequent itemset U, every split X ∪ Y = U, X ∩ Y = ∅ gives a candidate rule whose confidence is computed from supports already counted." });
    await d.table({ title: "Worked example: documents as transactions", lead: "Six documents, minsup = 50 % (3 documents), minconf = 80 %", head: ["Doc", "Words (items)"], colW: [0.9, 5.3], w: 6.2, size: 14, rows: [
      ["D1", "rule, tree, classification"], ["D2", "relation, tuple, join, algebra, recommendation"], ["D3", "variable, loop, procedure, rule"],
      ["D4", "clustering, rule, tree, recommendation"], ["D5", "join, relation, selection, projection, classification"], ["D6", "rule, tree, recommendation"]],
      img: "ch6_rules_scatter",
      takeaway: "{rule, tree}: sup = 3/6 = 50 % → frequent. rule → tree: conf = 3/4 = 75 % (rejected) · tree → rule: conf = 3/3 = 100 % (kept)",
      notes: "Example from the original slides. The scatter on the right shows the general picture: thousands of candidate rules, of which only those above both thresholds (top-right quadrant) are kept; colour shows lift, discussed later." });

    await d.divider(2, "Apriori", "Level-wise search with pruning");
    await d.figure({ title: "The Apriori principle", img: "ch6_lattice", textW: 4.2,
      lead: "Every subset of a frequent itemset is frequent.",
      bullets: ["Equivalently (**anti-monotone**): if X is infrequent, all supersets of X are infrequent", "The lattice of d items has **2ᵈ** itemsets — pruning is essential", "Here D is infrequent → 8 of 16 itemsets never counted"],
      notes: "Agrawal & Srikant (VLDB 1994). The downward-closure property lets us generate candidates of size k only from frequent itemsets of size k − 1." });
    await d.process({ title: "The Apriori algorithm", steps: [
      { h: "Scan 1", t: "Count items → L₁ (frequent 1-itemsets)", icon: "FaSearch" },
      { h: "Join", t: "Cₖ = pairs of Lₖ₋₁ itemsets sharing the first k − 2 items", icon: "FaLink" },
      { h: "Prune", t: "Drop candidates with an infrequent (k − 1)-subset", icon: "FaCut" },
      { h: "Count", t: "One database scan to count Cₖ → Lₖ", icon: "FaCalculator" },
      { h: "Stop", t: "When Lₖ or Cₖ₊₁ is empty", icon: "FaStopCircle" }],
      takeaway: "One full database scan **per level** — the main cost for large disk-resident data.",
      notes: "The join step in SQL from the original paper: insert into Ck select p.item1 … p.itemk−1, q.itemk−1 from Lk−1 p, Lk−1 q where p.item1 = q.item1 … p.itemk−2 = q.itemk−2 and p.itemk−1 < q.itemk−1." });
    await d.table({ title: "Apriori step by step on the documents", head: ["Level", "Candidates (count)", "Frequent (≥ 3)"], colW: [1.6, 6.8, 3.73], rows: [
      ["k = 1", "rule 4, tree 3, recommendation 3, classification 2, relation 2, join 2, others 1", "{rule}, {tree}, {recommendation}"],
      ["k = 2", "{rule, tree} 3 · {rule, recommendation} 2 · {tree, recommendation} 2", "{rule, tree}"],
      ["k = 3", "{rule, tree, recommendation}: pruned — {rule, rec.} is not frequent", "—  (stop)"]],
      takeaway: "Result: one frequent 2-itemset → rules rule → tree (75 %) and **tree → rule (100 %)**. Only tree → rule passes minconf = 80 %.",
      notes: "Have students reproduce this on the board. Note that the 3-itemset candidate is removed by pruning without counting." });
    await d.cards({ title: "Making Apriori faster", cols: 3, items: [
      { h: "Hashing (DHP)", t: "Hash 2-itemsets during scan 1 to prune C₂", icon: "FaHashtag" },
      { h: "Transaction reduction", t: "Drop transactions with no frequent k-itemset", icon: "FaCompressArrowsAlt" },
      { h: "Partitioning", t: "Local frequent itemsets per partition; two scans", icon: "FaThLarge" },
      { h: "Sampling", t: "Mine a sample with lower minsup, verify", icon: "FaVial" },
      { h: "Vertical format (Eclat)", t: "Item → list of transaction ids; intersect tid-lists", icon: "FaColumns" },
      { h: "Distributed", t: "Spark MLlib FP-Growth / PFP on clusters", icon: "FaServer" }],
      notes: "Eclat (Zaki, 2000) uses depth-first search over tid-list intersections and is often much faster than Apriori on dense data." });

    await d.divider(3, "FP-Growth & beyond", "Mining without candidate generation");
    await d.figure({ title: "The FP-tree (Han, Pei & Yin, 2000)", img: "ch6_fptree", textW: 4.6,
      bullets: ["Scan 1: count items, sort by frequency (f, c, a, b, m, p)", "Scan 2: insert each transaction as a **path**; shared prefixes share nodes", "Header table links all nodes of each item", "Compressed database — often fits in memory"],
      notes: "Classic five-transaction example from Han et al. with minsup = 3: T1 = {f,a,c,d,g,i,m,p}, T2 = {a,b,c,f,l,m,o}, T3 = {b,f,h,j,o}, T4 = {b,c,k,s,p}, T5 = {a,f,c,e,l,p,m,n}. Dotted links are node-links from the header table." });
    await d.process({ title: "Pattern growth", steps: [
      { h: "Pick item", t: "Start from the least frequent item in the header (p)", icon: "FaMousePointer" },
      { h: "Conditional base", t: "Collect prefix paths ending in p: <f c a m : 2>, <c b : 1>", icon: "FaRoute" },
      { h: "Conditional FP-tree", t: "Build a small FP-tree from that base: <c : 3>", icon: "FaTree" },
      { h: "Recurse", t: "Frequent patterns: {p}, {c, p}", icon: "FaRedo" }],
      takeaway: "Two scans, no candidate explosion — typically an **order of magnitude faster** than Apriori on dense data at low support.",
      notes: "For m: prefix paths <f c a : 2>, <f c a b : 1> → conditional tree <f c a : 3> → patterns {m}, {f m}, {c m}, {a m}, {f c m}, {f a m}, {c a m}, {f c a m}." });
    await d.figure({ title: "Runtime as support decreases", img: "ch6_runtime", textW: 4.6,
      bullets: ["Lower minsup → exponentially more frequent itemsets", "Apriori suffers most from candidate generation", "FP-Growth and Eclat scale better on dense data", "Benchmark on **your** data: sparse retail baskets behave differently"],
      notes: "Illustrative curve reflecting the trend reported by Han et al. (2000) and the FIMI workshop benchmarks; exact timings depend on implementation and data density." });
    await d.cards({ title: "Too many patterns? Compact representations", cols: 3, items: [
      { h: "Maximal itemsets", t: "Frequent, with no frequent superset — smallest summary, supports lost", icon: "FaArrowUp" },
      { h: "Closed itemsets", t: "No superset with the **same** support — lossless summary", icon: "FaLock" },
      { h: "Top-k patterns", t: "Return the k best itemsets — no minsup to tune", icon: "FaSortAmountUp" }],
      takeaway: "Frequent ⊇ Closed ⊇ Maximal. Algorithms: CHARM, CLOSET+, FPMax.",
      notes: "With 100 items in one transaction, there are 2^100 − 1 frequent sub-itemsets but only one closed and one maximal itemset — the motivation for compact representations." });

    await d.divider(4, "Which rules matter?", "Interestingness and associative classification");
    await d.formulas({ title: "Beyond confidence: interestingness measures", items: [
      ["Lift", "lift = conf(X → Y) / sup(Y)", "= 1 independence · > 1 positive · < 1 negative correlation"],
      ["Leverage", "sup(X ∪ Y) − sup(X) · sup(Y)", "Extra co-occurrences beyond independence"],
      ["Conviction", "(1 − sup(Y)) / (1 − conf(X → Y))", "∞ for rules that are never wrong"],
      ["Example", "tree → rule: lift = 1.0 / (4/6) = **1.5**", "Documents with 'tree' are 1.5× more likely to contain 'rule'"]],
      notes: "Confidence ignores how common Y is. If 90 % of customers buy bread, any rule X → bread has high confidence even when X and bread are independent. Lift fixes this." });
    await d.compare({ title: "The confidence trap",
      left: { h: "Rule: tea → coffee", items: ["sup(tea ∪ coffee) = 15 %", "conf = 75 % — looks strong", "But sup(coffee) = 90 %", "lift = 0.75 / 0.90 = **0.83 < 1**"] },
      right: { h: "Interpretation", items: ["Tea drinkers are **less** likely to buy coffee than average", "High confidence came from coffee's popularity", "Always report lift (or a statistical test)", "Correlation is not causation — rules suggest, experiments confirm"] },
      notes: "The classic tea–coffee example from Han, Pei & Tong. Statistically sound rule mining controls the false-discovery rate across thousands of tested rules (Webb, 2007)." });
    await d.cards({ title: "Classification with association rules", cols: 3, items: [
      { h: "Class association rules", t: "Rules X → class label, mined with minsup / minconf", icon: "FaTags" },
      { h: "CBA (Liu et al., 1998)", t: "Rank CARs by confidence, build an ordered rule list with a default class", icon: "FaListOl" },
      { h: "CMAR / CPAR", t: "Combine several matching rules; weighted voting", icon: "FaVoteYea" }],
      takeaway: "Associative classifiers are **interpretable** and capture feature interactions — useful when every decision must be justified.",
      notes: "Links back to the ordered vs. unordered rule sets of Chapter 4." });
    await d.cards({ title: "Extensions you will meet in practice", cols: 3, tSize: 15, items: [
      { h: "Multi-level rules", t: "Use concept hierarchies: milk → dairy", icon: "FaLayerGroup" },
      { h: "Quantitative rules", t: "Discretise numeric attributes: age 25–34 ∧ income high → card", icon: "FaSortNumericUp" },
      { h: "Negative rules", t: "X → ¬Y: substitutes, not complements", icon: "FaMinusCircle" },
      { h: "High-utility mining", t: "Weight items by profit, not only frequency", icon: "FaCoins" },
      { h: "Graph & spatial patterns", t: "Frequent subgraphs (gSpan), co-location patterns", icon: "FaProjectDiagram" },
      { h: "Recommendation today", t: "Rules → collaborative filtering → embeddings & sequential recommenders", icon: "FaThumbsUp" }],
      notes: "Modern recommender systems mostly use learned embeddings and transformers (e.g. SASRec, BERT4Rec), but rules remain popular as transparent baselines and for 'frequently bought together' widgets." });

    await d.divider(5, "Sequential patterns", "When order matters");
    await d.concept({ title: "Sequential pattern mining", icon: "FaStream", kicker: "AGRAWAL & SRIKANT, ICDE 1995",
      def: "A **sequence** is an ordered list of itemsets <(a)(b c)(d)>. Find all subsequences contained in at least minsup of the data sequences.",
      bullets: ["Customers: <(laptop)(mouse, bag)(warranty)>", "Web: <home → product → cart → checkout>", "Patients: <symptom → test → diagnosis → treatment>", "Constraints: max gap, time window, length"],
      notes: "<(a)(c)> is contained in <(a b)(d)(c e)> because a appears in an earlier element than c. Items inside one element are unordered." });
    await d.compare({ title: "GSP vs. PrefixSpan",
      left: { h: "GSP (Srikant & Agrawal, 1996)", items: ["Apriori-style level-wise generation", "Join sequences by dropping first / last item", "Prune with downward closure", "One scan per level; supports time constraints"] },
      right: { h: "PrefixSpan (Pei et al., 2001)", items: ["Pattern growth — no candidate generation", "Project the database on each frequent **prefix**", "Recurse on smaller projected databases", "Usually much faster; also SPADE (vertical)"] },
      notes: "Same story as Apriori vs. FP-Growth, transferred to sequences. Libraries: SPMF (Java) has more than 200 pattern mining algorithms; Spark MLlib provides PrefixSpan." });
    await d.code({ title: "Association rules in Python", codeW: 7.4, code:
`import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import (fpgrowth,
                                       association_rules)

baskets = [["rule", "tree", "classification"],
           ["relation", "tuple", "join", "algebra"],
           ["rule", "tree", "recommendation"], ...]
te = TransactionEncoder()
df = pd.DataFrame(te.fit_transform(baskets),
                  columns=te.columns_)

freq = fpgrowth(df, min_support=0.5, use_colnames=True)
rules = association_rules(freq, metric="lift",
                          min_threshold=1.0)
print(rules[["antecedents", "consequents",
             "support", "confidence", "lift"]])`,
      bullets: ["One-hot encode baskets", "FP-Growth for frequent itemsets", "Filter rules by **lift**", "At scale: Spark MLlib FPGrowth"] });
    await d.lab({"num": "09", "file": "Lab09_Association_Rules.ipynb", "name": "Association Rules", "data": "20 shopping baskets — or your own transaction CSV", "steps": ["Count **supports** of items and pairs by hand", "Code **confidence** and **lift** in a few lines", "Mine itemsets with **Apriori** and **FP-Growth** (mlxtend)", "Generate rules and **rank by lift**", "Visualise rules as a **scatter plot** and **network**"]});
    await d.spotlight({ pubs: [
      { ...P.disturbance, why: "**Traffic disturbance mining** to extract patterns from disturbance records that feed a neural controller." },
      { ...P.immuneCBR, why: "Case-based reasoning with immune memory: retrieving **co-occurring** traffic situations and control actions." },
      { ...P.designText, why: "Keyword **co-occurrence** across design-research journals — a natural basket-analysis setting." },
      { ...P.tourism, why: "Tourism behaviour data: candidate for **sequential patterns** of visited destinations and services." }],
      notes: "The first two papers are from our traffic-control line of work. The last two are suggested pattern-mining projects using publicly described data." });
    await d.summary(["Rules X → Y are judged by **support** and **confidence** — and should be ranked by **lift**",
      "**Apriori** prunes candidates with downward closure but scans the data once per level",
      "**FP-Growth** compresses data into an FP-tree and grows patterns without candidates",
      "**Closed** and **maximal** itemsets summarise the pattern explosion",
      "**CARs** turn rules into interpretable classifiers; **GSP / PrefixSpan** mine ordered sequences"]);
    await d.quiz(["With minsup = 2 documents, list all frequent 2-itemsets of the six-document example.",
      "Why can a rule have 90 % confidence but lift below 1?",
      "Build the conditional pattern base of item m in the FP-tree shown earlier.",
      "Give one business question better answered by sequential patterns than by association rules."],
      { notes: "(1) {rule, tree} (3), {rule, recommendation} (2), {tree, recommendation} (2), {relation, join} (2); also the 3-itemset {rule, tree, recommendation} (2). (2) Y is very common, sup(Y) > conf. (3) <f c a : 2>, <f c a b : 1>. (4) E.g. which product do customers buy next after a laptop; navigation paths before churn." });
    await d.references([
      "Agrawal, R., Imieliński, T., & Swami, A. (1993). Mining association rules between sets of items in large databases. *SIGMOD*.",
      "Agrawal, R., & Srikant, R. (1994). Fast algorithms for mining association rules. *VLDB*.",
      "Han, J., Pei, J., & Yin, Y. (2000). Mining frequent patterns without candidate generation. *SIGMOD*.",
      "Zaki, M. J. (2000). Scalable algorithms for association mining (Eclat). *IEEE TKDE*, 12(3).",
      "Liu, B., Hsu, W., & Ma, Y. (1998). Integrating classification and association rule mining (CBA). *KDD*.",
      "Srikant, R., & Agrawal, R. (1996). Mining sequential patterns: Generalizations and performance improvements (GSP). *EDBT*.",
      "Pei, J., et al. (2001). PrefixSpan: Mining sequential patterns by prefix-projected pattern growth. *ICDE*.",
      "Tan, P.-N., Kumar, V., & Srivastava, J. (2004). Selecting the right objective measure for association analysis. *Information Systems*, 29(4).",
      "Webb, G. I. (2007). Discovering significant patterns. *Machine Learning*, 68(1).",
      "Fournier-Viger, P., et al. (2017). A survey of sequential pattern mining. *Data Science and Pattern Recognition*, 1(1).",
      P.disturbance.ref, P.immuneCBR.ref, P.designText.ref, P.tourism.ref], { size: 11.5 });
    await d.closing({ next: "Project presentations & final review" });
  },
};
