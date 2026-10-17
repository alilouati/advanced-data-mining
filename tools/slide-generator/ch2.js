const P = require("./pubs");
module.exports = {
  meta: { num: 2, title: "Data Understanding & Preprocessing", short: "Preprocessing" },
  async build(d) {
    await d.cover({ subtitle: "Data-centric AI: exploring, cleaning, transforming and reducing data",
      notes: "Preprocessing typically consumes the majority of a data mining project. This chapter replaces the long list of definitions in the old version with visual intuition, modern practice (pipelines, leakage control) and dimensionality reduction including t-SNE." });
    await d.objectives([
      ["FaRulerCombined", "**Characterise** attributes by type and measurement scale"],
      ["FaChartBar", "**Summarise** distributions with robust statistics and plots"],
      ["FaBroom", "**Clean** data: missing values, noise, outliers, duplicates"],
      ["FaExchangeAlt", "**Transform** features: scaling, encoding, discretisation, imbalance handling"],
      ["FaCompressArrowsAlt", "**Reduce** dimensionality with PCA and t-SNE — and avoid data leakage"],
    ]);
    await d.agenda([["Know your data", "Types, scales, statistics"], ["Clean", "Missing, noisy, outliers, integration"], ["Transform", "Scale, encode, discretise, balance"], ["Reduce & guard", "PCA, t-SNE, leakage, pipelines"]]);

    await d.divider(1, "Know your data", "Attribute types and descriptive statistics");
    await d.table({ title: "Four measurement scales (Stevens, 1946)", head: ["Scale", "Meaning", "Example", "Valid statistics"], colW: [1.8, 3.6, 3.4, 3.33], rows: [
      ["Nominal", "Labels, no order", "City, blood type, colour", "Mode, frequency"],
      ["Ordinal", "Ordered, unequal gaps", "Rating 1–5, education level", "+ median, percentiles"],
      ["Interval", "Equal gaps, arbitrary zero", "°C, calendar year", "+ mean, std. deviation"],
      ["Ratio", "True zero, ratios meaningful", "Salary, age, kg, Kelvin", "+ geometric mean, CV"]],
      takeaway: "**Categorical** = nominal + ordinal · **Numeric** = interval + ratio · Binary attributes may be **symmetric** (gender) or **asymmetric** (test positive).",
      notes: "Each scale inherits the operations of the one above. A common error: computing the mean of an ordinal survey answer, or treating a city code as a number. The scale decides the distance function used later in clustering (Chapter 5)." });
    await d.figure({ title: "Central tendency: mean vs. median", img: "ch2_skew", textW: 4.3,
      bullets: ["**Mean** — sensitive to extreme values", "**Median** — robust middle value", "**Mode** — most frequent value (categorical data)", "Right-skewed data (income, prices): mean > median"],
      takeaway: "Report the **median** for skewed variables such as salaries or waiting times.",
      notes: "Synthetic log-normal salary distribution. The long right tail pulls the mean above the median. Trimmed mean (drop the extreme 1–5%) is a compromise. Empirical relation for unimodal moderately skewed data: mean − mode ≈ 3(mean − median)." });
    await d.formulas({ title: "Dispersion in four numbers", img: "ch2_boxplot", fw: 6.2, items: [
      ["Range", "max − min", "Uses only two values — very sensitive"],
      ["Quartiles", "Q1 = 25th, Q2 = median, Q3 = 75th pct.", "Five-number summary: min, Q1, Q2, Q3, max"],
      ["IQR", "IQR = Q3 − Q1", "Outlier rule: < Q1 − 1.5·IQR  or  > Q3 + 1.5·IQR"],
      ["Std. deviation", "σ = √( Σ (xᵢ − μ)² / n )", "Variance = σ²; same unit as the data"]],
      notes: "The boxplot visualises the five-number summary. Whiskers extend to the most extreme points within 1.5·IQR; points beyond are flagged as potential outliers. Sensor B shows outliers on both sides; waiting time is right-skewed." });
    await d.figure({ title: "Look at relationships before modelling", img: "ch2_corr", side: "left", textW: 5.2,
      bullets: ["Pearson correlation **r ∈ [−1, 1]** measures linear association", "Highly correlated features (area–rooms, r = 0.82) are **redundant**", "Spearman / Kendall for monotonic or ordinal data", "χ² test for two categorical attributes", "**Correlation ≠ causation**"],
      notes: "A correlation heatmap is the quickest exploratory view of a tabular data set. Redundant attributes inflate variance in some models and slow mining; they are candidates for removal or for PCA." });

    await d.divider(2, "Clean", "Missing values, noise, outliers and integration");
    await d.figure({ title: "Why are values missing?", img: "ch2_missing", textW: 4.6,
      bullets: ["**MCAR** — completely at random (sensor glitch)", "**MAR** — depends on observed data (older patients skip BMI)", "**MNAR** — depends on the missing value itself (high earners hide income)", "Visualise the pattern first: random speckle vs. blocks"],
      notes: "Rubin's taxonomy. The mechanism determines whether deletion is unbiased: only under MCAR. Blocks of missing values often indicate a system change or an integration problem — ask the data owner." });
    await d.cards({ title: "Strategies for missing values", cols: 3, items: [
      { h: "Delete", t: "Drop rows or columns — only when few and MCAR", icon: "FaTrashAlt", color: "coral" },
      { h: "Simple imputation", t: "Mean / median / mode, optionally per class", icon: "FaEquals", color: "amber" },
      { h: "Model-based", t: "k-NN imputer, iterative (MICE), regression, EM", icon: "FaBrain", color: "teal" },
      { h: "Indicator flag", t: "Add an 'is_missing' column — missingness can be informative", icon: "FaFlag", color: "plum" },
      { h: "Native handling", t: "Gradient-boosted trees (XGBoost, LightGBM) learn a default branch", icon: "FaTree", color: "green" },
      { h: "Domain rule", t: "'Not applicable' ≠ missing — e.g. spouse income for a single person", icon: "FaUserTie", color: "slate" }],
      notes: "Modern practice: impute inside a pipeline fitted on training data only, add missing indicators, and compare strategies with cross-validation instead of picking one by habit." });
    await d.figure({ title: "Smoothing noise by binning", img: "ch2_binning", textW: 4.6,
      bullets: ["Sort values, split into **equal-frequency bins**", "Replace each value by the bin **mean**, **median** or nearest **boundary**", "Other smoothers: regression, moving average, clustering"],
      caption: "Data: 1, 2, 4, 6, 9 | 12, 16, 17, 18, 23 | 34, 56, 78, 79, 81",
      notes: "Worked example from the previous version of the course, now visual. With bin means: 4,4,4,4,4 | 17,… | 66,… With bin medians: 4 | 17 | 78. With boundaries: each value snaps to the closer bin edge." });
    await d.cards({ title: "Detecting outliers", cols: 4, items: [
      { h: "Statistical", t: "IQR rule, z-score |z| > 3, Grubbs test", icon: "FaCalculator" },
      { h: "Distance", t: "Far from k nearest neighbours", icon: "FaRulerHorizontal" },
      { h: "Density", t: "LOF, DBSCAN noise points", icon: "FaBraille" },
      { h: "Model-based", t: "Isolation Forest, autoencoders (Ch. 6)", icon: "FaRobot" }],
      takeaway: "An outlier is not automatically an error — the CEO's salary is real. **Investigate before deleting**; sometimes the outlier *is* the finding (fraud).",
      notes: "k-means and any algorithm using the mean are sensitive to outliers. Chapter 6 treats anomaly detection as a mining task in its own right." });
    await d.process({ title: "Integrating multiple sources", steps: [
      { h: "Schema matching", t: "Cust_ID = CustNo = CID? Same name, different meaning?", icon: "FaColumns" },
      { h: "Entity resolution", t: "Is 'M. Alharbi, Riyadh' the same person as 'Mohammed Al-Harbi'?", icon: "FaUserFriends" },
      { h: "Redundancy", t: "Derived or duplicated attributes — detect with correlation / χ²", icon: "FaClone" },
      { h: "Conflicts", t: "Units (SAR vs USD), formats (Hijri vs Gregorian dates), scales", icon: "FaExclamationCircle" }],
      notes: "Entity resolution (record linkage) is now often done with learned similarity models or embeddings; Arabic name transliteration is a classic local challenge. Unit and calendar conflicts are frequent in Saudi government data." });

    await d.divider(3, "Transform", "Scaling, encoding, discretisation and class balance");
    await d.figure({ title: "Feature scaling", img: "ch2_scaling", stack: true, imgH: 2.9,
      bullets: ["**Min–max**: (x − min)/(max − min) → [0, 1]", "**z-score**: (x − μ)/σ", "**Robust**: (x − median)/IQR — resists outliers", "Required for distance- and gradient-based methods (k-NN, SVM, k-means, neural nets); **not** for trees"],
      notes: "Same 302 values under three scalers. Two extreme values compress the min–max result into a narrow band; the robust scaler keeps the bulk well spread. Always fit the scaler on the training set only." });
    await d.table({ title: "Encoding categorical attributes", head: ["Encoding", "How", "Good for", "Watch out"], colW: [2.3, 3.8, 2.9, 3.13], rows: [
      ["One-hot", "One binary column per category", "Nominal, few levels", "Explodes with high cardinality"],
      ["Ordinal", "Map to ranks 1, 2, 3 …", "Ordinal attributes; trees", "Implies spacing for linear models"],
      ["Target / mean", "Replace category by mean target", "High cardinality (city, merchant)", "Leakage — use out-of-fold"],
      ["Hashing", "Hash category into k buckets", "Streams, huge vocabularies", "Collisions"],
      ["Learned embedding", "Dense vector trained with a model", "Deep tabular models", "Needs enough data"]],
      notes: "CatBoost uses ordered target statistics precisely to avoid target leakage. Embeddings for categorical variables come from entity-embedding work (Guo & Berkhahn, 2016)." });
    await d.cards({ title: "Discretisation and concept hierarchies", cols: 3, items: [
      { h: "Equal-width", t: "Fixed interval size — simple, sensitive to outliers", icon: "FaGripLines" },
      { h: "Equal-frequency", t: "Same count per bin — quantiles", icon: "FaBars" },
      { h: "Supervised (entropy)", t: "Cut points that best separate classes — MDLP, used by C4.5", icon: "FaCut" },
      { h: "Clustering-based", t: "k-means on one attribute", icon: "FaObjectUngroup" },
      { h: "Concept hierarchy", t: "street → district → city → region → country", icon: "FaLayerGroup" },
      { h: "Why?", t: "Needed by Apriori-style rule mining; improves readability", icon: "FaQuestion" }],
      notes: "Discretisation turns numeric attributes into categories. It is essential for association rule mining (Chapter 9) and makes rules readable (age 25–34 instead of 27.3)." });
    await d.figure({ title: "Imbalanced classes", img: "ch2_smote", stack: true, imgH: 2.9,
      bullets: ["Fraud, intrusion, rare disease: positives ≪ 1 %", "**Resample**: undersample majority, oversample minority", "**SMOTE**: synthesise points on segments between minority neighbours", "**Cost-sensitive** learning: class weights", "Evaluate with **PR-AUC / F1**, not accuracy (Ch. 3)"],
      notes: "SMOTE (Chawla et al., 2002) interpolates between a minority point and one of its k minority neighbours. Recent evidence shows that for strong learners such as gradient boosting, class weights and threshold tuning are often as good as SMOTE. Resample only the training folds." });
    await d.cards({ title: "Feature engineering: where domain knowledge pays", cols: 3, items: [
      { h: "Ratios & differences", t: "debt / income, price per m²", icon: "FaDivide" },
      { h: "Date & time", t: "Day of week, Ramadan flag, payday, holiday", icon: "FaCalendarAlt" },
      { h: "Aggregates", t: "Customer's mean spend over last 30 days", icon: "FaLayerGroup" },
      { h: "Text → vectors", t: "TF-IDF, sentence embeddings (Ch. 8)", icon: "FaFont" },
      { h: "Geo features", t: "Distance to city centre, POI density", icon: "FaMapMarkerAlt" },
      { h: "LLM-assisted", t: "LLMs propose candidate features and code — verify them!", icon: "FaRobot" }],
      notes: "Local calendar effects such as Ramadan, Eid and government payday are strong signals in Saudi retail and payment data. LLM-generated features (e.g. CAAFE, Hollmann et al., 2023) can help but must be validated like any other feature." });

    await d.divider(4, "Reduce & guard", "Fewer dimensions, no leakage");
    await d.cards({ title: "Data reduction strategies", cols: 4, items: [
      { h: "Feature selection", t: "Filter (correlation, mutual information), wrapper (RFE), embedded (L1, tree importance)", icon: "FaFilter" },
      { h: "Feature extraction", t: "PCA, autoencoders, embeddings", icon: "FaCompress" },
      { h: "Numerosity", t: "Sampling, clustering, histograms", icon: "FaSortAmountDown" },
      { h: "Compression", t: "Wavelets, quantisation, sketches", icon: "FaFileArchive" }],
      takeaway: "**Curse of dimensionality**: as dimensions grow, distances concentrate and data become sparse — reduction often *improves* accuracy.",
      notes: "In high dimensions, the ratio between the nearest and the farthest neighbour distance tends to 1, which breaks k-NN and clustering. Reduction fights this and speeds up mining." });
    await d.concept({ title: "Principal Component Analysis", icon: "FaCompressArrowsAlt", kicker: "PCA IN ONE SENTENCE",
      def: "Rotate the axes so that the first new axis captures the **maximum variance**, the second the maximum remaining variance, and so on.",
      img: "ch2_pca", imgH: 3.1,
      bullets: ["Eigenvectors of the covariance matrix = **principal components**", "Keep k components explaining e.g. 95 % of variance", "Standardise first; linear only"],
      notes: "Here two correlated attributes are almost entirely explained by PC1 (92 %). Projecting onto PC1 halves the dimension with little information loss. Computation: SVD of the centred data matrix." });
    await d.bigfig({ title: "Linear vs. non-linear projection", img: "ch2_tsne",
      takeaway: "**t-SNE / UMAP** preserve local neighbourhoods — excellent for visualisation, but distances between clusters and cluster sizes are **not** meaningful.",
      notes: "PCA mixes the digit classes; t-SNE separates them into clear groups. UMAP (McInnes et al., 2018) is faster and preserves more global structure. Do not run clustering on t-SNE coordinates without care, and never use them as model features fitted on test data." });
    await d.concept({ title: "Data leakage: the silent killer", icon: "FaExclamationTriangle", kicker: "DEFINITION",
      def: "Information that **would not be available at prediction time** sneaks into training, producing optimistic results that collapse in production.",
      bullets: ["**Target leakage** — a feature derived from the label (e.g. 'claim_paid' when predicting fraud)", "**Train–test contamination** — scaling, imputation or SMOTE fitted on all data", "**Temporal leakage** — random split of time-ordered data", "**Group leakage** — same patient in train and test",
        "**Cure**: pipelines, out-of-time validation, group-aware splits"],
      notes: "Kapoor & Narayanan (2023) documented leakage in hundreds of published ML papers across fields. Our GOSI wage-band study (Forecasting, 2026) is an example of designing leakage control and out-of-time validation explicitly." });
    await d.code({ title: "Leak-free preprocessing with a pipeline", code:
`from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, RobustScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

num = ["age", "income", "tenure"]
cat = ["city", "channel"]
prep = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median",
                                            add_indicator=True)),
                      ("sc", RobustScaler())]), num),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat)])

model = Pipeline([("prep", prep),
                  ("clf", LogisticRegression(class_weight="balanced"))])
# every fold re-fits imputer & scaler on its own training part
print(cross_val_score(model, X, y, cv=5, scoring="average_precision"))`,
      bullets: ["Preprocessing is **part of the model**", "Fitted only on training folds", "Same object used in deployment", "Imbalance handled by **class weights**"],
      notes: "This pattern removes the most common form of leakage. For resampling (SMOTE) use imblearn.pipeline.Pipeline so that resampling only happens on training folds." });
    await d.lab({"num": "02", "file": "Lab02_EDA_and_Preprocessing.ipynb", "name": "EDA & Preprocessing", "data": "Titanic passengers, handwritten digits — or your own CSV", "steps": ["Inspect types, summary statistics and **missing values**", "Plot **histograms, boxplots** and a correlation heatmap", "Detect outliers with the **IQR rule**", "**Impute, one-hot encode** and **scale** the data", "Project the digits with **PCA** and **t-SNE**"]});
    await d.spotlight({ pubs: [
      { ...P.gosi, why: "Explicit **leakage control** and **out-of-time validation** on Saudi social-insurance records — the practices from this chapter applied at national scale." },
      { ...P.realEstate, why: "Riyadh property data: cleaning, encoding location and engineering features before regression." },
      { ...P.tourism, why: "Integrating heterogeneous tourism indicators into a single analytical data set." },
      { ...P.designText, why: "Text preprocessing (tokenisation, keyword normalisation) before trend mining of journal keywords." }],
      notes: "Ask students to identify which preprocessing steps each study needed and how they would check for leakage." });
    await d.summary(["Identify the **scale** of each attribute — it constrains statistics and distances",
      "Use **robust** summaries and plots; investigate outliers before removing them",
      "Choose missing-value handling by **mechanism** (MCAR/MAR/MNAR), not habit",
      "Scale, encode and balance **inside a pipeline** fitted on training data only",
      "Reduce dimensions with selection, **PCA** or **t-SNE/UMAP** (visualisation)",
      "Guard against **leakage** — the most common cause of over-optimistic results"]);
    await d.quiz(["Why can't you compute a meaningful mean of a 1–5 satisfaction rating? What would you report?",
      "A hospital data set has BMI missing mostly for elderly patients. Which mechanism is this, and what is the risk of deleting those rows?",
      "You standardised all data, then split into train/test. What went wrong?",
      "When would you prefer PCA over t-SNE, and vice versa?"],
      { notes: "Answers: (1) ordinal scale — report median/mode and distribution; (2) MAR — deletion biases the sample toward younger patients; (3) leakage: test statistics influenced the scaler; (4) PCA for features/compression and linear structure; t-SNE for visual exploration of clusters." });
    await d.references([
      "Han, J., Pei, J., & Tong, H. (2022). *Data Mining: Concepts and Techniques* (4th ed.), ch. 2–3. Morgan Kaufmann.",
      "Stevens, S. S. (1946). On the theory of scales of measurement. *Science*, 103(2684), 677–680.",
      "Little, R. J. A., & Rubin, D. B. (2019). *Statistical Analysis with Missing Data* (3rd ed.). Wiley.",
      "Chawla, N. V., et al. (2002). SMOTE: Synthetic minority over-sampling technique. *JAIR*, 16, 321–357.",
      "van der Maaten, L., & Hinton, G. (2008). Visualizing data using t-SNE. *JMLR*, 9, 2579–2605.",
      "McInnes, L., Healy, J., & Melville, J. (2018). UMAP. arXiv:1802.03426.",
      "Kapoor, S., & Narayanan, A. (2023). Leakage and the reproducibility crisis in ML-based science. *Patterns*, 4(9).",
      "Hollmann, N., Müller, S., & Hutter, F. (2023). LLMs for automated data science: CAAFE. *NeurIPS*.",
      "Kuhn, M., & Johnson, K. (2019). *Feature Engineering and Selection*. CRC Press.",
      P.gosi.ref, P.realEstate.ref, P.tourism.ref, P.designText.ref]);
    await d.closing({ next: "Chapter 3 — Classification & Rigorous Evaluation" });
  },
};
