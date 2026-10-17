const P = require("./pubs");
module.exports = {
  meta: { num: 3, title: "Classification & Rigorous Evaluation", short: "Classification" },
  async build(d) {
    await d.cover({ subtitle: "Learning from labelled data — and proving that it works",
      notes: "This chapter merges the old 'Supervised learning – classifiers' material with modern evaluation practice: ROC/PR curves, calibration, proper cross-validation, temporal validation and statistical comparison of models." });
    await d.objectives([
      ["FaTags", "**Formulate** a supervised learning problem: features, labels, train / validation / test"],
      ["FaProjectDiagram", "**Explain** four classic classifiers: k-NN, Naïve Bayes, logistic regression, SVM"],
      ["FaChartArea", "**Evaluate** classifiers with confusion-matrix metrics, ROC, PR and calibration"],
      ["FaRandom", "**Design** sound validation: k-fold, stratified, grouped, out-of-time, nested"],
      ["FaBalanceScale", "**Diagnose** under- and over-fitting with the bias–variance trade-off"],
    ]);
    await d.agenda([["Supervised learning", "Problem set-up"], ["Four classifiers", "k-NN, NB, LR, SVM"], ["Measuring performance", "Metrics, curves, calibration"], ["Validating honestly", "Splits, CV, bias–variance"]]);

    await d.divider(1, "Supervised learning", "Learning a mapping from examples");
    await d.concept({ title: "The supervised learning set-up", icon: "FaTags", kicker: "FORMALLY",
      def: "Given labelled examples D = {(xᵢ, yᵢ)}, learn a function **f : X → Y** that predicts y for **new, unseen** x.",
      bullets: ["**Classification** — y is a discrete class (fraud / legit)", "**Regression** — y is a number (price, demand)", "**Training set** fits the model; **validation set** tunes it; **test set** estimates future performance — touched once", "Goal = **generalisation**, not memorisation"],
      notes: "Same notation as the old slides but condensed. Emphasise the three-way split and that the test set must be used only once at the end — every extra look leaks information." });
    await d.table({ title: "A running example: Play Tennis", head: ["Day", "Outlook", "Temp.", "Humidity", "Wind", "Play?"], colW: [1.0, 1.5, 1.3, 1.5, 1.3, 1.2], w: 7.8, size: 14, rowH: 0.33,
      rows: [["D1", "Sunny", "Hot", "High", "Weak", "No"], ["D2", "Sunny", "Hot", "High", "Strong", "No"], ["D3", "Overcast", "Hot", "High", "Weak", "Yes"], ["D4", "Rain", "Mild", "High", "Weak", "Yes"],
        ["D5", "Rain", "Cool", "Normal", "Weak", "Yes"], ["D6", "Rain", "Cool", "Normal", "Strong", "No"], ["D7", "Overcast", "Cool", "Normal", "Strong", "Yes"], ["D8", "Sunny", "Mild", "High", "Weak", "No"],
        ["D9", "Sunny", "Cool", "Normal", "Weak", "Yes"], ["D10", "Rain", "Mild", "Normal", "Weak", "Yes"], ["D11", "Sunny", "Mild", "Normal", "Strong", "Yes"], ["D12", "Overcast", "Mild", "High", "Strong", "Yes"],
        ["D13", "Overcast", "Hot", "Normal", "Weak", "Yes"], ["D14", "Rain", "Mild", "High", "Strong", "No"]],
      img: "ch4_tennis_tree",
      notes: "The classic Quinlan data set: 14 days, 4 categorical attributes, 9 Yes / 5 No. On the right, the tree learned by ID3 — derived step by step in Chapter 4. We use the data for Naïve Bayes on the next slides." });

    await d.divider(2, "Four classic classifiers", "Different inductive biases, different boundaries");
    await d.bigfig({ title: "Same data, four decision boundaries", img: "ch3_boundaries",
      takeaway: "Every algorithm makes assumptions (**inductive bias**). No single classifier is best on all problems — *no free lunch*.",
      notes: "Two interleaving half-moons with noise. k-NN gives a flexible local boundary; Naïve Bayes assumes independent Gaussian features; logistic regression is linear; the RBF-SVM is smooth and non-linear. Training accuracy is shown — not a fair comparison; we fix that later in the chapter." });
    await d.figure({ title: "k-Nearest Neighbours", img: "ch3_knn", textW: 5.6,
      lead: "Classify a point by the **majority vote** of its k closest training examples.",
      bullets: ["Lazy learner: no training, all work at prediction time", "Needs a **distance** (Euclidean, cosine…) and **scaled** features", "Small k → noisy, complex boundary; large k → smooth", "Here: k = 3 votes B, k = 7 votes A", "Scales with approximate nearest-neighbour indices (FAISS, HNSW)"],
      notes: "k-NN is still used today inside vector databases and retrieval-augmented generation: retrieving nearest embeddings is exactly k-NN. Choose k by cross-validation; use distance weighting to soften ties." });
    await d.formulas({ title: "Naïve Bayes: probabilistic classification", lead: "Pick the class with the highest posterior; assume features are **conditionally independent** given the class.", items: [
      ["Bayes' rule", "P(c | x) = P(x | c) · P(c) / P(x)", "Posterior = likelihood × prior / evidence"],
      ["Naïve assumption", "P(x | c) = Π P(xⱼ | c)", "Turns one hard estimate into many easy counts"],
      ["Decision", "ĉ = argmaxc  P(c) · Π P(xⱼ | c)", "Use log-probabilities to avoid underflow"],
      ["Laplace smoothing", "P(xⱼ = v | c) = (n_vc + 1) / (n_c + |V|)", "Avoids zero probabilities for unseen values"]],
      takeaway: "Tennis, x = (Sunny, Cool, High, Strong): P(Yes)·Π = 9/14·2/9·3/9·3/9·3/9 ≈ **0.0053** vs. P(No)·Π = 5/14·3/5·1/5·4/5·3/5 ≈ **0.0206** → **No**.",
      notes: "Work through the tennis example on the board. Despite the unrealistic independence assumption, Naïve Bayes is fast, robust with little data and a strong baseline for text classification. Its probabilities are usually poorly calibrated (see later)." });
    await d.formulas({ title: "Logistic regression", img: "ch3_calibration", fw: 6.6, items: [
      ["Score", "z = w · x + b", "Linear combination of features"],
      ["Sigmoid", "P(y = 1 | x) = 1 / (1 + e^(−z))", "Squashes the score into a probability"],
      ["Training", "minimise log-loss + λ‖w‖", "L2 (ridge) or L1 (lasso → sparse)"],
      ["Reading w", "e^(wⱼ) = odds ratio", "Interpretable — popular in credit and health"]],
      notes: "Logistic regression is the baseline every project should start with. The calibration plot on the right shows its probabilities are close to the diagonal, while Naïve Bayes is over-confident. Calibration matters whenever the probability itself drives a decision (pricing, triage)." });
    await d.figure({ title: "Support Vector Machines", img: "ch3_svm", textW: 6.0,
      lead: "Find the separating hyperplane with the **maximum margin**.",
      bullets: ["Only the **support vectors** (circled) define the boundary", "Soft margin: parameter **C** trades margin width vs. errors", "**Kernel trick**: RBF, polynomial kernels give non-linear boundaries without computing the mapping", "Strong for text and high-dimensional data"],
      notes: "Vapnik's SVM dominated the 2000s. It remains competitive for medium-sized, high-dimensional data such as TF-IDF text — e.g. our Arabic course-review sentiment study used an SVM. For multi-class problems use one-vs-rest or one-vs-one." });
    await d.table({ title: "Choosing a classifier", head: ["Method", "Strengths", "Weaknesses", "Use when"], colW: [2.1, 3.5, 3.3, 3.23], rows: [
      ["k-NN", "Simple, no training, non-linear", "Slow prediction, needs scaling, high-dim. issues", "Small data; retrieval"],
      ["Naïve Bayes", "Very fast, little data, text", "Independence assumption, poor probabilities", "Baseline; spam / text"],
      ["Logistic reg.", "Interpretable, calibrated, fast", "Linear boundary", "Regulated domains; baseline"],
      ["SVM", "Max margin, kernels, high-dim.", "Slow on > 10⁵ rows, tuning C, γ", "Text, medium data"],
      ["Trees & ensembles", "Mixed types, non-linear, SOTA on tables", "Single trees overfit", "Most tabular problems (Ch. 4)"],
      ["Neural networks", "Images, text, sequences", "Data-hungry, opaque", "Unstructured data (Ch. 8)"]],
      notes: "A practical decision table. Gradient-boosted trees (Chapter 4) are the default for tabular data in industry and competitions; deep learning dominates unstructured data." });

    await d.divider(3, "Measuring performance", "Beyond accuracy");
    await d.figure({ title: "The confusion matrix", img: "ch3_confusion", side: "left", textW: 6.6,
      bullets: ["**Accuracy** = (TP + TN) / N = 130 / 200 = 65 %", "**Precision** = TP / (TP + FP) = 30 / 30 = **100 %**", "**Recall** (sensitivity) = TP / (TP + FN) = 30 / 100 = **30 %**", "**Specificity** = TN / (TN + FP) = 100 %", "**F1** = 2PR / (P + R) = **46 %** — the harmonic mean punishes imbalance"],
      notes: "This is the example from the original slides, now as a picture. Precision is perfect but the model misses 70 % of positives. Which error is worse depends on the cost: a missed fraud vs. a blocked legitimate payment." });
    await d.stats({ title: "Why accuracy misleads on imbalanced data", items: [["99.8 %", "accuracy of a model that predicts **'not fraud'** for every transaction"], ["0 %", "of frauds actually caught by that model (recall)"], ["0.2 %", "typical fraud rate in card-payment data"]],
      takeaway: "With rare positives, report **precision, recall, F1, PR-AUC** — and the cost of each error type.",
      notes: "Illustrative numbers in line with public card-fraud data sets (e.g. the ULB Kaggle data set has 0.17 % fraud). Always compare against the trivial majority-class baseline." });
    await d.bigfig({ title: "Threshold-free evaluation: ROC and PR curves", img: "ch3_rocpr",
      takeaway: "**ROC-AUC** = probability a random positive is ranked above a random negative. With rare positives the **PR curve** is more informative — baseline = prevalence (dashed).",
      notes: "Same three models on a 10 %-positive data set. ROC curves look similar and high for all; the PR curve separates them more clearly. Report both, and choose the operating threshold from the business cost, not 0.5 by default." });
    await d.figure({ title: "Ranking quality: cumulative gains & lift", img: "ch3_gains", textW: 5.0,
      bullets: ["Score customers, sort by predicted probability", "Contacting the **top 20 %** reaches **~80 %** of responders", "**Lift** = gain ÷ random = 4× at 20 %", "The classic direct-marketing use case (mail 5,000 of 10,000)"],
      notes: "Replaces the long Microsoft Adventure Works example from the old slides with one picture. The random line is the expected result without a model; the perfect line reaches all responders as soon as the number contacted equals the number of responders." });
    await d.cards({ title: "Metrics for regression and probabilities", cols: 3, items: [
      { h: "MAE", t: "Mean |y − ŷ| — robust, same unit as y", icon: "FaRulerHorizontal" },
      { h: "RMSE", t: "√ mean (y − ŷ)² — penalises large errors", icon: "FaSquareRootAlt" },
      { h: "MAPE / sMAPE", t: "Relative error in %, careful near zero", icon: "FaPercent" },
      { h: "R²", t: "Share of variance explained", icon: "FaChartLine" },
      { h: "Log-loss", t: "Penalises confident wrong probabilities", icon: "FaBalanceScaleRight" },
      { h: "Brier score / ECE", t: "Calibration of predicted probabilities", icon: "FaBullseye" }],
      notes: "For forecasting (Chapter 6) we also use MASE, which scales errors by a naïve seasonal forecast." });

    await d.divider(4, "Validating honestly", "Estimating future performance without fooling ourselves");
    await d.bigfig({ title: "Under-fitting, good fit, over-fitting", img: "ch3_fit",
      takeaway: "A model that memorises the training data (right) has **low bias but high variance** — it will fail on new data.",
      notes: "Polynomials of degree 1, 4 and 15 on 25 noisy points from a sine curve. The degree-15 fit passes through almost every point but oscillates wildly between them." });
    await d.figure({ title: "The bias–variance trade-off", img: "ch3_biasvar", textW: 4.6,
      bullets: ["**Bias**: error from wrong assumptions → under-fitting", "**Variance**: sensitivity to the training sample → over-fitting", "Expected error = bias² + variance + noise", "Control complexity with **regularisation**, pruning, early stopping, more data"],
      notes: "The U-shaped test-error curve. Note: very large over-parameterised networks can show 'double descent', where test error falls again — a modern nuance worth mentioning to M.Sc. students (Belkin et al., 2019)." });
    await d.cards({ title: "Validation schemes", cols: 3, tSize: 15, items: [
      { h: "Hold-out", t: "One train/test split (e.g. 70/30). Fast, high variance", icon: "FaCut" },
      { h: "k-fold CV", t: "k splits, each fold tests once; average. k = 5 or 10", icon: "FaRedo" },
      { h: "Stratified k-fold", t: "Keeps class proportions in every fold — default for classification", icon: "FaLayerGroup" },
      { h: "Group k-fold", t: "All records of a patient / customer in the same fold", icon: "FaUsers" },
      { h: "Out-of-time", t: "Train on the past, test on the future — mandatory for temporal data", icon: "FaHistory" },
      { h: "Nested CV", t: "Inner loop tunes hyper-parameters, outer loop estimates performance", icon: "FaCubes" }],
      notes: "Leave-one-out is k-fold with k = n: nearly unbiased but expensive and high-variance. The choice of scheme must mirror how the model will be used: if you will predict next month, validate on a later month." });
    await d.formulas({ title: "The bootstrap and the 63.2 % rule", items: [
      ["Bootstrap sample", "draw n records **with replacement**", "Some records appear several times, others never"],
      ["P(not chosen)", "(1 − 1/n)ⁿ → e⁻¹ ≈ 0.368", "for large n"],
      ["Split", "≈ 63.2 % unique records train · 36.8 % 'out-of-bag' test", "Repeat B times and average"],
      ["Also used for", "confidence intervals · bagging · random forests (Ch. 4)", ""]],
      notes: "Derivation from Han & Kamber kept because students like it: each record has a 1/n chance per draw; after n draws the chance of never being chosen tends to 1/e. The .632 bootstrap estimator combines training and out-of-bag error." });
    await d.cards({ title: "Comparing models fairly", cols: 3, items: [
      { h: "Same folds", t: "Evaluate all models on identical splits", icon: "FaClone" },
      { h: "Report variability", t: "Mean ± std over folds, or bootstrap CIs", icon: "FaChartBar" },
      { h: "Statistical tests", t: "Paired t-test on folds (corrected), McNemar, Friedman + Nemenyi for many data sets", icon: "FaCheckDouble" }],
      takeaway: "A 0.3 % accuracy gain inside the standard deviation is **not** a result. Demšar (2006) is the reference for multi-dataset comparisons.",
      notes: "Reviewers increasingly ask for these tests. Nadeau & Bengio's corrected resampled t-test accounts for overlapping training sets in CV." });
    await d.code({ title: "Honest evaluation in scikit-learn", codeW: 7.6, code:
`from sklearn.model_selection import (
    StratifiedKFold, cross_validate)
from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

cv = StratifiedKFold(n_splits=10, shuffle=True,
                     random_state=42)
model = make_pipeline(StandardScaler(),
                      SVC(C=1.0, probability=True))
res = cross_validate(model, X, y, cv=cv,
        scoring=["f1", "roc_auc", "average_precision"])
for k, v in res.items():
    if k.startswith("test_"):
        print(f"{k:24s} {v.mean():.3f} ± {v.std():.3f}")`,
      bullets: ["Stratified 10-fold CV", "Scaling **inside** the pipeline", "Several metrics at once", "Report **mean ± std**", "Time series? use **TimeSeriesSplit** (Ch. 6)"],
      notes: "A template students should reuse in their projects." });
    await d.lab({"num": "03", "file": "Lab03_Classification_and_Evaluation.ipynb", "name": "Classification & Evaluation", "data": "Breast-cancer diagnosis (569 tumours) — or your own labelled CSV", "steps": ["Stratified **train/test split** and leak-free pipelines", "Train **k-NN, Naïve Bayes, logistic regression, SVM**", "Compare with **10-fold stratified CV** (accuracy, F1, ROC-AUC)", "Read the **confusion matrix, ROC and PR curves**", "Plot **decision boundaries** and tune k"]});
    await d.spotlight({ pubs: [
      { ...P.arabicSVM, why: "**SVM** on TF-IDF features for Arabic course reviews — text classification with precision / recall / F1 reporting." },
      { ...P.hate, why: "Multi-class classification of **emotional responses** on social media; class imbalance and comparison of classifiers." },
      { ...P.gosi, why: "Wage-band classification with **out-of-time validation** and leakage control — evaluation done right." },
      { ...P.xray, why: "Chest X-ray classification: sensitivity / specificity trade-offs in **medical** decision support." }]});
    await d.summary(["Supervised learning learns f: X → Y and is judged on **unseen** data",
      "k-NN, Naïve Bayes, logistic regression and SVM embody **different inductive biases**",
      "Accuracy misleads on imbalanced data — use **precision, recall, F1, ROC/PR-AUC**, calibration",
      "Validation must mirror deployment: **stratified, grouped, out-of-time, nested** CV",
      "Manage complexity through the **bias–variance** trade-off; compare models statistically"]);
    await d.quiz(["Compute precision, recall and F1 for TP = 40, FP = 10, FN = 20.",
      "Classify (Rain, Hot, High, Weak) with Naïve Bayes on the tennis data.",
      "Your churn model has ROC-AUC 0.92 but PR-AUC 0.18. Is it good? Explain.",
      "Why is a random 10-fold CV wrong for forecasting next month's sales?"],
      { notes: "(1) P = 0.80, R = 0.667, F1 = 0.727. (2) Yes: 9/14·3/9·2/9·3/9·6/9 ≈ 0.0106; No: 5/14·2/5·2/5·4/5·2/5 ≈ 0.0183 → No. (3) Prevalence is probably very low; PR-AUC must be compared with the prevalence baseline — it may still be useful but precision at useful recall is low. (4) Future information leaks into training; use out-of-time / rolling-origin validation." });
    await d.references([
      "Tan, P.-N., Steinbach, M., Karpatne, A., & Kumar, V. (2019). *Introduction to Data Mining* (2nd ed.), ch. 3–4. Pearson.",
      "Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The Elements of Statistical Learning* (2nd ed.). Springer.",
      "Cortes, C., & Vapnik, V. (1995). Support-vector networks. *Machine Learning*, 20, 273–297.",
      "Fawcett, T. (2006). An introduction to ROC analysis. *Pattern Recognition Letters*, 27(8), 861–874.",
      "Saito, T., & Rehmsmeier, M. (2015). The precision-recall plot is more informative than the ROC plot on imbalanced datasets. *PLOS ONE*, 10(3).",
      "Niculescu-Mizil, A., & Caruana, R. (2005). Predicting good probabilities with supervised learning. *ICML*.",
      "Demšar, J. (2006). Statistical comparisons of classifiers over multiple data sets. *JMLR*, 7, 1–30.",
      "Belkin, M., et al. (2019). Reconciling modern ML practice and the bias–variance trade-off. *PNAS*, 116(32).",
      P.arabicSVM.ref, P.hate.ref, P.gosi.ref, P.xray.ref]);
    await d.closing({ next: "Chapter 4 — Trees, Rules & Ensembles" });
  },
};
