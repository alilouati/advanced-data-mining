const P = require("./pubs");
module.exports = {
  meta: { num: 4, title: "Trees, Rules & Ensembles", short: "Trees & Ensembles" },
  async build(d) {
    await d.cover({ subtitle: "From ID3 to gradient boosting, TabPFN and SHAP",
      notes: "The old chapter covered ID3, C4.5 and rule induction. We keep those foundations, compress them visually, and add what practitioners now use every day on tabular data: random forests, gradient boosting (XGBoost, LightGBM, CatBoost), tabular foundation models and SHAP explanations." });
    await d.objectives([
      ["FaSitemap", "**Build** a decision tree by hand using entropy and information gain"],
      ["FaCut", "**Control** over-fitting with pruning and stopping criteria"],
      ["FaListOl", "**Derive** rule sets from trees and by sequential covering"],
      ["FaTree", "**Explain** bagging, random forests and gradient boosting"],
      ["FaSearchPlus", "**Interpret** ensemble models with feature importance and SHAP"],
    ]);
    await d.agenda([["Decision trees", "ID3, C4.5, CART"], ["Rule induction", "Trees → rules, covering"], ["Ensembles", "Bagging, RF, boosting"], ["Explaining models", "Importance, SHAP"]]);

    await d.divider(1, "Decision trees", "Divide and conquer");
    await d.concept({ title: "What is a decision tree?", icon: "FaSitemap", kicker: "STRUCTURE",
      def: "A flowchart where **internal nodes test an attribute**, branches are test outcomes and **leaves assign a class**.",
      img: "ch4_tennis_tree", imgH: 3.1,
      bullets: ["Each root-to-leaf path is a readable **rule**", "Handles numeric & categorical data, no scaling needed"],
      notes: "The tree learned from the Play Tennis data. Counts in the leaves are (Yes/No). Trees are the building block of the most accurate tabular models in use today." });
    await d.process({ title: "Top-down induction (Hunt / ID3)", steps: [
      { h: "Start", t: "All training records at the root", icon: "FaDatabase" },
      { h: "Choose test", t: "Pick the attribute that best separates the classes", icon: "FaBalanceScale" },
      { h: "Split", t: "One branch per outcome; partition the records", icon: "FaCodeBranch" },
      { h: "Recurse", t: "Repeat on each child node", icon: "FaRedo" },
      { h: "Stop", t: "Node pure, no attributes left, or too few records → leaf (majority class)", icon: "FaStopCircle" }],
      takeaway: "Greedy: the best split *now* is chosen, never revised — fast, but not guaranteed globally optimal.",
      notes: "ID3 (Quinlan, 1986) uses information gain to choose the test. The algorithm is a recursive greedy partitioning." });
    await d.formulas({ title: "Measuring purity: entropy & information gain", img: "ch4_impurity", fw: 6.6, items: [
      ["Entropy", "H(S) = − Σ pᵢ log₂ pᵢ", "0 = pure node · 1 = 50/50 (two classes)"],
      ["Info. gain", "Gain(S, A) = H(S) − Σ (|Sᵥ|/|S|) · H(Sᵥ)", "Expected reduction in entropy after splitting on A"],
      ["Gini (CART)", "Gini(S) = 1 − Σ pᵢ²", "Cheaper to compute, similar ranking"],
      ["Gain ratio (C4.5)", "GainRatio = Gain / SplitInfo", "Penalises attributes with many values (e.g. ID)"]],
      notes: "Entropy and Gini behave almost identically in practice. Misclassification error is not used for growing trees because it is not sensitive enough to changes in class probabilities." });
    await d.table({ title: "Worked example: choosing the root", lead: "Play Tennis: 9 Yes / 5 No → **H(S) = 0.940 bits**", head: ["Attribute", "Partition (Yes/No)", "Weighted entropy", "Information gain"], colW: [2.4, 4.4, 2.6, 2.73], rows: [
      ["Outlook", "Sunny 2/3 · Overcast 4/0 · Rain 3/2", "0.694", "0.246  ← best"], ["Humidity", "High 3/4 · Normal 6/1", "0.789", "0.151"],
      ["Wind", "Weak 6/2 · Strong 3/3", "0.892", "0.048"], ["Temperature", "Hot 2/2 · Mild 4/2 · Cool 3/1", "0.911", "0.029"]],
      takeaway: "Outlook becomes the root; Overcast is already pure. Recurse on Sunny (→ Humidity) and Rain (→ Wind) to obtain the tree shown earlier.",
      notes: "E.g. H(Sunny) = −(2/5)log₂(2/5) − (3/5)log₂(3/5) = 0.971; H(Rain) = 0.971; H(Overcast) = 0. Weighted: 5/14·0.971 + 4/14·0 + 5/14·0.971 = 0.694. Gain = 0.940 − 0.694 = 0.246. Ask students to verify Humidity." });
    await d.table({ title: "ID3, C4.5 and CART compared", head: ["", "ID3 (1986)", "C4.5 (1993)", "CART (1984)"], colW: [2.6, 3.1, 3.2, 3.23], rows: [
      ["Split criterion", "Information gain", "Gain ratio", "Gini / variance"], ["Split type", "Multi-way", "Multi-way", "Binary"],
      ["Numeric attributes", "No", "Yes (thresholds)", "Yes"], ["Missing values", "No", "Fractional records", "Surrogate splits"],
      ["Pruning", "None", "Error-based post-pruning", "Cost-complexity pruning"], ["Regression", "No", "No", "Yes"], ["Used today in", "Teaching", "Weka J48", "scikit-learn, XGBoost, LightGBM"]],
      notes: "CART-style binary trees are the basis of all modern ensembles. C5.0 is the commercial successor of C4.5." });
    await d.figure({ title: "Over-fitting and pruning", img: "ch4_depth", textW: 4.7,
      bullets: ["Deep trees memorise noise: training accuracy → 100 %, test accuracy falls", "**Pre-pruning**: max depth, min samples per leaf, min gain", "**Post-pruning**: grow fully, then cut subtrees that do not help on validation data", "CART **cost-complexity**: minimise error + α · |leaves|"],
      notes: "Test accuracy peaks at a moderate depth and then declines while training accuracy keeps rising. In scikit-learn use ccp_alpha with cross-validation to pick the pruning strength." });

    await d.divider(2, "Rule induction", "IF … THEN … knowledge");
    await d.compare({ title: "From a tree to a rule set",
      left: { h: "Tree paths", items: ["Outlook = Overcast", "Outlook = Sunny ∧ Humidity = High", "Outlook = Sunny ∧ Humidity = Normal", "Outlook = Rain ∧ Wind = Strong", "Outlook = Rain ∧ Wind = Weak"] },
      right: { h: "Rules", items: ["→ Play = Yes", "→ Play = No", "→ Play = Yes", "→ Play = No", "→ Play = Yes"] },
      takeaway: "Rules from a tree are **mutually exclusive and exhaustive**. C4.5rules then simplifies each rule by dropping conditions that do not hurt accuracy.",
      notes: "One rule per leaf. Simplified rules may overlap, so they need an ordering or a voting scheme." });
    await d.process({ title: "Sequential covering: learning rules directly", steps: [
      { h: "Learn one rule", t: "Greedily add conditions that maximise accuracy for one class", icon: "FaPlusCircle" },
      { h: "Evaluate", t: "Keep the rule if it beats a quality threshold (e.g. FOIL gain)", icon: "FaCheck" },
      { h: "Remove covered", t: "Delete training records the rule covers", icon: "FaEraser" },
      { h: "Repeat", t: "Until no positives remain or rules stop improving", icon: "FaRedo" }],
      takeaway: "**RIPPER** (Cohen, 1995) adds incremental reduced-error pruning (IREP) — fast and accurate on noisy data.",
      notes: "Learn-one-rule starts from the empty rule and specialises it. CN2 uses beam search with entropy. RIPPER grows on a 2/3 split and prunes on the remaining 1/3." });
    await d.compare({ title: "Ordered vs. unordered rule sets",
      left: { h: "Ordered (decision list)", items: ["Rules tried top-down; first match fires", "Default rule at the end", "Compact, easy to apply", "Meaning of a rule depends on those above it"] },
      right: { h: "Unordered (rule set)", items: ["All matching rules vote", "Each rule readable on its own", "Needs conflict resolution", "Used by CN2 (unordered mode), associative classifiers (Ch. 9)"] },
      notes: "Interpretable rule models have seen a revival for high-stakes decisions: certifiably optimal rule lists (CORELS, Angelino et al., 2018) and Rudin's argument for interpretable models instead of explaining black boxes (2019)." });

    await d.divider(3, "Ensembles", "Many weak trees make a strong model");
    await d.bigfig({ title: "One tree vs. many trees", img: "ch4_ensembles",
      takeaway: "Averaging many decorrelated trees (**bagging**) reduces variance; adding trees that fix previous errors (**boosting**) reduces bias.",
      notes: "Same moons data as in Chapter 3. The single deep tree carves rectangles around noise; the forest and boosting models produce smoother boundaries and higher test accuracy." });
    await d.process({ title: "Bagging and Random Forests", steps: [
      { h: "Bootstrap", t: "Draw B samples with replacement (Ch. 3)", icon: "FaRandom" },
      { h: "Grow trees", t: "One deep tree per sample", icon: "FaTree" },
      { h: "Random features", t: "At each split consider only √p random features (RF)", icon: "FaDice" },
      { h: "Aggregate", t: "Majority vote / average", icon: "FaVoteYea" },
      { h: "OOB estimate", t: "Out-of-bag records give free validation", icon: "FaClipboardCheck" }],
      notes: "Breiman (2001). Feature sub-sampling decorrelates the trees, which is why random forests beat plain bagging. Robust defaults: 500 trees, max_features = sqrt(p). Extremely randomised trees (ExtraTrees) also randomise thresholds." });
    await d.figure({ title: "Boosting: learn from the residuals", img: "ch4_boosting", stack: true, imgH: 2.6,
      bullets: ["**AdaBoost** (1997): re-weight misclassified records", "**Gradient boosting** (Friedman, 2001): each new tree fits the gradient (residuals) of the loss", "Shallow trees + small **learning rate** + many rounds", "**Early stopping** on a validation set prevents over-fitting"],
      notes: "Gradient boosting with depth-2 trees and learning rate 0.5: after one tree the fit is a step function; after 50 trees it tracks the signal closely. Too many rounds will eventually fit noise — hence early stopping." });
    await d.table({ title: "Modern gradient-boosting libraries", head: ["", "XGBoost (2016)", "LightGBM (2017)", "CatBoost (2018)"], colW: [2.5, 3.2, 3.2, 3.23], rows: [
      ["Key idea", "Regularised objective, sparsity-aware", "Histogram + leaf-wise growth, GOSS", "Ordered boosting, symmetric trees"],
      ["Speed", "Fast, GPU", "Very fast on large data", "Fast inference"], ["Categorical data", "Native (recent versions)", "Native", "Best-in-class (target statistics)"],
      ["Missing values", "Learned default direction", "Learned", "Learned"], ["Typical use", "General purpose, Kaggle", "Millions of rows", "Many categorical features"]],
      takeaway: "Default choice for tabular data in industry. Start with one of these before trying deep learning.",
      notes: "scikit-learn's HistGradientBoostingClassifier implements the LightGBM-style histogram algorithm and is a good dependency-free option for labs." });
    await d.cards({ title: "Are trees still state of the art on tables?", cols: 3, items: [
      { h: "Yes, mostly", t: "Tree ensembles beat deep nets on typical medium-sized tabular benchmarks (Grinsztajn et al., NeurIPS 2022)", icon: "FaTrophy", color: "teal" },
      { h: "Foundation models", t: "**TabPFN** (Hollmann et al., Nature 2025): a pre-trained transformer that predicts small tables in one forward pass", icon: "FaCubes", color: "amber" },
      { h: "Practical advice", t: "Baseline: logistic regression → gradient boosting → try TabPFN on small data → deep tabular models only if justified", icon: "FaRoute", color: "coral" }],
      notes: "Grinsztajn, Oyallon & Varoquaux (2022) explain the gap by irregular target functions and uninformative features, which trees handle well. TabPFN v2 (2025) is strong for data sets up to about 10,000 rows. This is a fast-moving area — check current benchmarks such as TabArena." });
    await d.code({ title: "Gradient boosting with early stopping", codeW: 7.4, code:
`from sklearn.ensemble import (
    HistGradientBoostingClassifier)
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=0)

gbm = HistGradientBoostingClassifier(
    learning_rate=0.05, max_iter=2000,
    max_leaf_nodes=31, l2_regularization=1.0,
    early_stopping=True, validation_fraction=0.15,
    n_iter_no_change=50,
    categorical_features="from_dtype",
    random_state=0)
gbm.fit(X_tr, y_tr)
p = gbm.predict_proba(X_te)[:, 1]
print(gbm.n_iter_, roc_auc_score(y_te, p))`,
      bullets: ["Small learning rate, many iterations", "Early stopping picks the number of trees", "Native categorical & missing support", "Tune with Optuna (Ch. 7)"] });

    await d.divider(4, "Explaining models", "Opening the ensemble black box");
    await d.figure({ title: "SHAP: why did the model predict this?", img: "ch4_shap", textW: 4.7,
      bullets: ["Based on **Shapley values** from cooperative game theory", "Each prediction = baseline + Σ feature contributions", "**Local** (one prediction) and **global** (beeswarm) views", "TreeSHAP computes exact values for tree ensembles quickly"],
      notes: "Beeswarm plot: each dot is one house; position = contribution to the predicted price; colour = feature value. High income (red) pushes prices up; long distance to the CBD pushes them down. Values here are exact SHAP values of a linear model on synthetic housing-like data." });
    await d.cards({ title: "The interpretability toolbox", cols: 3, tSize: 15, items: [
      { h: "Impurity importance", t: "Built into trees — fast but biased towards high-cardinality features", icon: "FaSortAmountDown" },
      { h: "Permutation importance", t: "Drop in score when a feature is shuffled — model-agnostic", icon: "FaRandom" },
      { h: "PDP / ICE plots", t: "Average and individual effect of one feature", icon: "FaChartLine" },
      { h: "SHAP", t: "Consistent additive attributions, local + global", icon: "FaPuzzlePiece" },
      { h: "LIME", t: "Local surrogate linear model around one point", icon: "FaSearchLocation" },
      { h: "Counterfactuals", t: "'Approved if income were 2,000 SAR higher'", icon: "FaExchangeAlt" }],
      notes: "Chapter 7 revisits explainability alongside fairness and regulation. Warn students that explanations of correlated features can be misleading." });
    await d.lab({"num": "04", "file": "Lab04_Decision_Trees_and_Ensembles.ipynb", "name": "Trees & Ensembles", "data": "Play Tennis (by hand) and Wine — or your own CSV", "steps": ["Code **entropy** and **information gain**; pick the root", "Train and **plot a decision tree**; print its IF-THEN rules", "Show **over-fitting** with an accuracy-vs-depth curve", "Compare a tree, **random forest** and **gradient boosting**", "Explain with **impurity** and **permutation importance**"]});
    await d.spotlight({ pubs: [
      { ...P.traffic, why: "Tabular **traffic and safety** indicators for Al-Kharj modelled with ML classifiers — a natural setting for tree ensembles and feature importance." },
      { ...P.realEstate, why: "Riyadh **price forecasting**: comparing regression models, where boosted trees and interpretability of location features matter." },
      { ...P.scAnomaly, why: "AI-based detection and optimisation for **smart-contract** transactions — learning decision rules from tabular transaction features." },
      { ...P.tourism, why: "Data-driven tourism analytics for Saudi Arabia — explaining **which factors** drive the predictions." }]});
    await d.summary(["Trees split greedily on the attribute with the largest **purity gain** (entropy, Gini)",
      "Deep trees over-fit — **prune** or limit depth",
      "Trees convert to **rules**; sequential covering (RIPPER) learns rules directly",
      "**Random forests** reduce variance; **gradient boosting** reduces bias — the tabular default",
      "Explain ensembles with **permutation importance** and **SHAP**; TabPFN is the new contender"]);
    await d.quiz(["Compute the information gain of Humidity on the tennis data and confirm 0.151.",
      "Why does information gain favour an attribute such as 'customer ID', and how does C4.5 fix it?",
      "Why do random forests sample features at each split, not only records?",
      "Your boosted model's validation loss starts increasing after 400 trees. What do you do?"],
      { notes: "(1) High: 3Y/4N → H = 0.985; Normal: 6Y/1N → H = 0.592; weighted = 0.5·0.985 + 0.5·0.592 = 0.789; gain = 0.151. (2) Each ID gives a pure leaf, maximal gain; gain ratio divides by split information. (3) To decorrelate trees so averaging reduces variance. (4) Early stopping — keep ~400 trees, or lower the learning rate / add regularisation." });
    await d.references([
      "Quinlan, J. R. (1986). Induction of decision trees. *Machine Learning*, 1, 81–106.",
      "Quinlan, J. R. (1993). *C4.5: Programs for Machine Learning*. Morgan Kaufmann.",
      "Breiman, L., Friedman, J., Olshen, R., & Stone, C. (1984). *Classification and Regression Trees*. Wadsworth.",
      "Cohen, W. W. (1995). Fast effective rule induction (RIPPER). *ICML*.",
      "Breiman, L. (2001). Random forests. *Machine Learning*, 45, 5–32.",
      "Friedman, J. H. (2001). Greedy function approximation: A gradient boosting machine. *Annals of Statistics*, 29(5).",
      "Chen, T., & Guestrin, C. (2016). XGBoost. *KDD*. · Ke, G., et al. (2017). LightGBM. *NeurIPS*. · Prokhorenkova, L., et al. (2018). CatBoost. *NeurIPS*.",
      "Grinsztajn, L., Oyallon, E., & Varoquaux, G. (2022). Why do tree-based models still outperform deep learning on tabular data? *NeurIPS*.",
      "Hollmann, N., et al. (2025). Accurate predictions on small data with a tabular foundation model. *Nature*, 637.",
      "Lundberg, S. M., & Lee, S.-I. (2017). A unified approach to interpreting model predictions. *NeurIPS*.",
      "Rudin, C. (2019). Stop explaining black box models for high stakes decisions. *Nature Machine Intelligence*, 1.",
      P.traffic.ref, P.realEstate.ref, P.scAnomaly.ref, P.tourism.ref], { size: 11.5 });
    await d.closing({ next: "Chapter 5 — Clustering" });
  },
};
