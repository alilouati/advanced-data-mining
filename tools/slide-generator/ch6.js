const P = require("./pubs");
module.exports = {
  meta: { num: 6, title: "Anomaly Detection & Time-Series Mining", short: "Anomalies & Time Series" },
  async build(d) {
    await d.cover({ subtitle: "Finding the unusual and predicting what comes next",
      notes: "New chapter. Anomaly detection and time-series mining are now core topics in leading data-mining syllabi and are central to fintech, cybersecurity, IoT and smart-city applications in the Kingdom." });
    await d.objectives([
      ["FaExclamationTriangle", "**Classify** anomalies as point, contextual or collective"],
      ["FaTree", "**Apply** Isolation Forest, LOF and autoencoders, and evaluate them correctly"],
      ["FaWaveSquare", "**Decompose** a time series into trend, seasonality and residual"],
      ["FaChartLine", "**Compare** forecasting families from ARIMA to foundation models"],
      ["FaHistory", "**Validate** forecasts with rolling-origin evaluation and monitor drift"],
    ]);
    await d.agenda([["Anomaly detection", "Types and methods"], ["Detecting in practice", "Evaluation, tooling"], ["Time-series mining", "Structure, tasks, similarity"], ["Forecasting", "Models, validation, drift"]]);

    await d.divider(1, "Anomaly detection", "Patterns that do not conform to expected behaviour");
    await d.bigfig({ title: "Three kinds of anomaly", img: "ch7_types",
      takeaway: "**Point**: unusual on its own · **Contextual**: unusual given its context (time, place) · **Collective**: a sequence that is unusual as a group.",
      notes: "Chandola, Banerjee & Kumar (2009) taxonomy. 36 °C is normal in Riyadh in July but anomalous in January — context matters. A flat segment in an ECG or a vibration signal is a collective anomaly even though each value is normal." });
    await d.cards({ title: "Where anomalies cost money — or lives", cols: 3, items: [
      { h: "Payment fraud", t: "Card, POS and instant-payment transactions", icon: "FaCreditCard" },
      { h: "Smart contracts", t: "Malicious or fraudulent blockchain transactions", icon: "FaLink" },
      { h: "Cyber-intrusion", t: "Network traffic, logins, fibre-optic perimeter sensors", icon: "FaUserSecret" },
      { h: "Industrial IoT", t: "Vibration, temperature, predictive maintenance", icon: "FaIndustry" },
      { h: "Healthcare", t: "Abnormal vital signs, unusual claims", icon: "FaHeartbeat" },
      { h: "Mobility", t: "Incidents, sensor faults, traffic disturbances", icon: "FaCarCrash" }]});
    await d.cards({ title: "A map of detection approaches", cols: 3, tSize: 15, items: [
      { h: "Statistical", t: "z-score, IQR, Grubbs, Gaussian / mixture likelihood", icon: "FaCalculator" },
      { h: "Distance-based", t: "Distance to k-th nearest neighbour", icon: "FaRulerHorizontal" },
      { h: "Density-based", t: "LOF, DBSCAN noise — local density compared with neighbours", icon: "FaBraille" },
      { h: "Isolation-based", t: "Isolation Forest — anomalies are easy to separate", icon: "FaTree" },
      { h: "Reconstruction", t: "PCA, autoencoders — high reconstruction error = anomaly", icon: "FaCompressArrowsAlt" },
      { h: "Supervised", t: "When labelled frauds exist: gradient boosting with imbalance handling", icon: "FaTags" }],
      takeaway: "Label availability decides the setting: **supervised** (labels for both), **semi-supervised** (only normal data), **unsupervised** (no labels — most common).",
      notes: "In fraud, a common production pattern combines an unsupervised detector for novel attacks with a supervised model trained on investigated cases." });
    await d.figure({ title: "Isolation Forest: the key intuition", img: "ch7_isolation", textW: 6.2,
      lead: "Anomalies are **few and different** — so random splits isolate them quickly.",
      bullets: ["Build many random trees: pick a random feature and a random split value", "**Path length** h(x) to isolate a point is short for anomalies", "Score: s(x) = 2^(−E[h(x)] / c(n)) — close to 1 = anomaly", "Linear time, no distance computations, works in high dimensions"],
      notes: "Liu, Ting & Zhou (ICDM 2008). c(n) is the average path length of an unsuccessful search in a binary search tree, used to normalise. Sub-sampling (256 points per tree) is enough in practice. Extended Isolation Forest uses oblique splits." });
    await d.bigfig({ title: "Global vs. local views: Isolation Forest and LOF", img: "ch7_iforest_lof",
      takeaway: "**LOF** compares a point's density with that of its k neighbours, so it catches points near a dense cluster that a global method might miss.",
      notes: "Left: Isolation Forest score surface (darker = more anomalous) and predicted anomalies. Right: circle size grows with the Local Outlier Factor (Breunig et al., SIGMOD 2000). LOF ≈ 1 means similar density to neighbours; LOF ≫ 1 indicates an outlier." });
    await d.figure({ title: "Deep anomaly detection: autoencoders", img: "ch7_ae_error", textW: 4.8,
      bullets: ["Train an autoencoder on (mostly) **normal** data", "It learns to reconstruct normal patterns well", "Anomalies → **high reconstruction error**", "Threshold e.g. at the 99th percentile of normal errors", "Variants: LSTM-AE for sequences, Deep SVDD, VAEs"],
      notes: "Illustrative distributions of reconstruction error for normal and fraudulent transactions. Overlap between the two histograms is where false positives and missed frauds occur; the threshold sets the trade-off." });
    await d.cards({ title: "Evaluating detectors honestly", cols: 3, tSize: 15, items: [
      { h: "Rare labels", t: "Use PR-AUC, precision@k, recall at fixed alert budget", icon: "FaBalanceScale" },
      { h: "Alert fatigue", t: "Analysts can review only k alerts per day — optimise top-k", icon: "FaBell" },
      { h: "Time leakage", t: "Train on the past, test on later periods", icon: "FaHistory" },
      { h: "No universal winner", t: "ADBench (57 data sets): no method dominates; simple baselines are competitive", icon: "FaTrophy" },
      { h: "Ensembles", t: "Combine scores of several detectors (rank averaging)", icon: "FaLayerGroup" },
      { h: "Feedback loop", t: "Investigated cases become labels for supervised models", icon: "FaSyncAlt" }],
      notes: "Han et al. (NeurIPS 2022) ADBench compared 30 algorithms on 57 data sets. Isolation Forest remains a strong unsupervised baseline; semi-supervised methods win when even a few labels are available." });
    await d.code({ title: "Anomaly detection in a few lines", codeW: 7.4, code:
`from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.metrics import average_precision_score

iso = IsolationForest(n_estimators=300,
                      contamination="auto",
                      random_state=0).fit(X_train)
s_iso = -iso.score_samples(X_test)      # higher = worse

lof = LocalOutlierFactor(n_neighbors=20,
                         novelty=True).fit(X_train)
s_lof = -lof.score_samples(X_test)

for name, s in [("iForest", s_iso), ("LOF", s_lof)]:
    print(name, average_precision_score(y_test, s))
# PyOD offers 40+ detectors with the same API`,
      bullets: ["Fit on training period only", "Scores, not hard labels", "Evaluate with **PR-AUC**", "PyOD for AE, ECOD, COPOD, Deep SVDD"] });

    await d.divider(2, "Time-series mining", "When order and time carry the signal");
    await d.concept({ title: "What makes time series special?", icon: "FaWaveSquare", kicker: "KEY PROPERTIES",
      def: "Observations are **ordered and dependent**: today depends on yesterday. Random shuffling destroys the information.",
      bullets: ["**Autocorrelation** — correlation with lagged values", "**Trend** — long-term increase or decrease", "**Seasonality** — weekly, monthly, Ramadan, summer", "**Non-stationarity** — mean / variance change over time", "**Exogenous drivers** — holidays, prices, weather, policy"],
      notes: "Hijri calendar effects (Ramadan, Eid) move through the Gregorian year by about 11 days per year — an important feature for Saudi retail, payment and mobility series." });
    await d.figure({ title: "Classical decomposition", img: "ch7_decomp", textW: 4.4,
      bullets: ["**y = trend + seasonal + residual** (additive)", "Multiplicative when seasonal swings grow with level (log-transform)", "**STL** (Loess) — robust, flexible seasonality", "Residuals are where anomalies live"],
      notes: "Synthetic monthly series: linear trend, 12-month seasonality and noise. Decomposition is the first exploratory step for any forecasting or anomaly task." });
    await d.cards({ title: "Time-series mining tasks", cols: 3, items: [
      { h: "Forecasting", t: "Predict future values — demand, sales, traffic", icon: "FaChartLine" },
      { h: "Classification", t: "Label whole series — ECG, activity recognition (ROCKET, InceptionTime)", icon: "FaTags" },
      { h: "Clustering", t: "Group similar series with DTW distance", icon: "FaObjectGroup" },
      { h: "Motifs & discords", t: "Repeated patterns and most unusual subsequences — Matrix Profile", icon: "FaFingerprint" },
      { h: "Change-point detection", t: "When did behaviour shift? (PELT, BOCPD)", icon: "FaCodeBranch" },
      { h: "Anomaly detection", t: "Point, contextual and collective anomalies in streams", icon: "FaExclamationTriangle" }]});
    await d.formulas({ title: "Comparing series: Euclidean vs. DTW", items: [
      ["Euclidean", "d(x, y) = √ Σₜ (xₜ − yₜ)²", "Point-to-point; fails when patterns are shifted in time"],
      ["DTW", "D(i, j) = |xᵢ − yⱼ| + min{ D(i−1, j), D(i, j−1), D(i−1, j−1) }", "Warps the time axis to align similar shapes"],
      ["Constraint", "Sakoe–Chiba band  |i − j| ≤ w", "Prevents pathological warping; speeds up to O(n·w)"],
      ["Matrix Profile", "distance of each subsequence to its nearest neighbour", "Low = motif · high = discord (anomaly)"]],
      notes: "Dynamic Time Warping (Sakoe & Chiba, 1978) remains a strong baseline for time-series classification with 1-NN. The Matrix Profile (Yeh et al., 2016; STUMPY library) gives motifs and discords for any subsequence length." });

    await d.divider(3, "Forecasting", "From ARIMA to foundation models");
    await d.timeline({ title: "The evolution of forecasting models", items: [
      ["1950s–70s", "Exponential smoothing, Box–Jenkins ARIMA"], ["2000s", "State-space ETS, Prophet-style decomposition (2017)"], ["2010s", "Gradient boosting with lag features"],
      ["2015–19", "LSTM/GRU, TCN, DeepAR, N-BEATS"], ["2020–23", "Transformers: Informer, PatchTST; strong linear baselines"], ["2024–26", "Foundation models: Chronos, TimesFM, Moirai — zero-shot"]],
      notes: "Key lesson from the M4/M5 competitions (Makridakis et al.): combinations and gradient-boosted global models do very well; simple baselines are hard to beat. Zeng et al. (2023) showed a single linear layer can rival early transformers, prompting better designs such as PatchTST." });
    await d.figure({ title: "Forecasts are distributions, not numbers", img: "ch7_forecast", textW: 4.4,
      bullets: ["Report **prediction intervals** (e.g. 50 % and 95 %)", "Uncertainty grows with the **horizon** h", "Quantile loss / conformal prediction for calibrated intervals", "Decisions (stock, staffing) depend on the quantiles"],
      notes: "Fan chart for a 12-step horizon. Models such as DeepAR and Chronos produce probabilistic forecasts directly; conformal prediction wraps any model to give coverage guarantees under exchangeability." });
    await d.figure({ title: "Validating forecasts: rolling origin", img: "ch7_tscv", textW: 4.6,
      bullets: ["Never shuffle — train on the **past**, test on the **future**", "Expanding or sliding window, several origins", "Evaluate **per horizon** h = 1 … H", "Leave a gap if features use future-aggregated data"],
      notes: "Also called time-series cross-validation (Hyndman & Athanasopoulos). scikit-learn's TimeSeriesSplit implements the expanding window with an optional gap." });
    await d.formulas({ title: "Forecast accuracy metrics", items: [
      ["MAE / RMSE", "mean |e| ,  √ mean e²", "Scale-dependent — compare on the same series only"],
      ["MAPE", "mean |e / y| × 100 %", "Undefined at y = 0; penalises over-forecasts more"],
      ["sMAPE", "mean 2|e| / (|y| + |ŷ|)", "Symmetric version used in M3/M4"],
      ["MASE", "MAE / MAE of seasonal naïve forecast", "Scale-free; < 1 beats the naïve benchmark"]],
      takeaway: "Always include a **naïve** and a **seasonal naïve** baseline — many sophisticated models fail to beat them on some horizons.",
      notes: "Hyndman & Koehler (2006) proposed MASE. For probabilistic forecasts use CRPS or the weighted quantile loss." });
    await d.compare({ title: "Local statistical vs. global learned models",
      left: { h: "Local (one model per series)", items: ["ARIMA, ETS, Theta", "Few parameters, interpretable", "Works with short series", "Does not share information across series"] },
      right: { h: "Global (one model for many series)", items: ["Gradient boosting, DeepAR, N-BEATS, PatchTST", "Learns patterns shared across thousands of series", "Needs more data and careful validation", "**Foundation models**: pre-trained, zero-shot on new series"] },
      takeaway: "Which wins depends on data size, horizon and regularity — **benchmark both** with rolling-origin evaluation.",
      notes: "Foundation models (Ansari et al., 2024 Chronos; Das et al., 2024 TimesFM) are attractive when history is short, but should be compared with tuned local baselines on the target data." });
    await d.figure({ title: "After deployment: concept drift", img: "ch7_drift", textW: 4.6,
      bullets: ["Data distribution or relationship changes over time", "Causes: new regulation, pandemics, new payment channels", "Detect: ADWIN, Page–Hinkley, PSI on inputs, error monitoring", "React: retrain on recent windows, weight recent data"],
      notes: "Gama et al. (2014) survey. Monitoring is part of CRISP-ML / MLOps (Chapter 7). The COVID-19 period is a classic example of abrupt drift in mobility and payment data." });
    await d.code({ title: "Forecasting with lag features and rolling validation", codeW: 7.6, code:
`import pandas as pd
from sklearn.model_selection import TimeSeriesSplit
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error

df = sales.to_frame("y")
for lag in [1, 2, 3, 12]:
    df[f"lag{lag}"] = df["y"].shift(lag)
df["month"] = df.index.month
df = df.dropna()
X, y = df.drop(columns="y"), df["y"]

tscv = TimeSeriesSplit(n_splits=5, test_size=12)
for tr, te in tscv.split(X):
    m = HistGradientBoostingRegressor().fit(X.iloc[tr],
                                             y.iloc[tr])
    print(mean_absolute_error(y.iloc[te],
                              m.predict(X.iloc[te])))`,
      bullets: ["Lag & calendar features turn forecasting into regression", "**TimeSeriesSplit** = rolling origin", "Compare with seasonal-naïve MAE", "Multi-step: recursive vs. direct strategies"] });
    await d.lab({"num": "06", "file": "Lab06_Anomaly_Detection_and_Time_Series.ipynb", "name": "Anomalies & Time Series", "data": "Synthetic anomalies; monthly airline passengers 1949–1960", "steps": ["Flag outliers with **Isolation Forest** and **LOF**; compare PR-AUC", "**Decompose** a series into trend, seasonality, residual", "Find unusual months from **residual z-scores**", "Forecast with **lag features** and **TimeSeriesSplit**", "Compare against the **seasonal-naïve** baseline"]});
    await d.spotlight({ pubs: [
      { ...P.scAnomaly, why: "**Anomaly detection** framework for blockchain smart contracts — unsupervised scoring plus optimisation." },
      { ...P.intrusion, why: "**Intrusion detection** from optical-fibre sensor signals in rainy weather — separating true events from noise." },
      { ...P.jobs, why: "**Forecasting** trending job roles from a Saudi technology mega-corporation's data." },
      { ...P.emergency, why: "Deep learning + case-based reasoning for **predictive** traffic emergency management." }]});
    await d.summary(["Anomalies are **point, contextual or collective**; label availability decides the method family",
      "**Isolation Forest** and **LOF** are strong unsupervised baselines; autoencoders handle complex data",
      "Evaluate detectors with **PR-AUC, precision@k** and time-aware splits",
      "Time series need **order-aware** methods: decomposition, DTW, Matrix Profile",
      "Forecast with intervals, validate by **rolling origin**, beat **naïve** baselines, monitor **drift**"]);
    await d.quiz(["Give an example of a contextual anomaly in Saudi retail or payment data.",
      "Why does Isolation Forest need no distance computations, and why is that an advantage?",
      "A model has MASE = 1.2 at horizon 6. What does this tell you?",
      "Why is random k-fold CV invalid for forecasting, and what replaces it?"],
      { notes: "(1) E.g. high sales of dates outside Ramadan, or a large transaction at 3 a.m. for a customer who never shops at night. (2) It uses random axis-parallel splits; avoids O(n²) distances and the curse of dimensionality. (3) It is 20 % worse than the seasonal naïve forecast — not useful at that horizon. (4) Future information leaks into training; use rolling-origin / TimeSeriesSplit." });
    await d.references([
      "Chandola, V., Banerjee, A., & Kumar, V. (2009). Anomaly detection: A survey. *ACM Computing Surveys*, 41(3).",
      "Liu, F. T., Ting, K. M., & Zhou, Z.-H. (2008). Isolation forest. *ICDM*.",
      "Breunig, M. M., Kriegel, H.-P., Ng, R. T., & Sander, J. (2000). LOF: Identifying density-based local outliers. *SIGMOD*.",
      "Han, S., et al. (2022). ADBench: Anomaly detection benchmark. *NeurIPS Datasets & Benchmarks*.",
      "Hyndman, R. J., & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice* (3rd ed.). OTexts.",
      "Makridakis, S., Spiliotis, E., & Assimakopoulos, V. (2022). M5 accuracy competition. *Int. J. Forecasting*, 38(4).",
      "Nie, Y., et al. (2023). A time series is worth 64 words (PatchTST). *ICLR*.",
      "Ansari, A. F., et al. (2024). Chronos: Learning the language of time series. *TMLR*.",
      "Das, A., et al. (2024). A decoder-only foundation model for time-series forecasting (TimesFM). *ICML*.",
      "Yeh, C.-C. M., et al. (2016). Matrix Profile I. *ICDM*.",
      "Gama, J., et al. (2014). A survey on concept drift adaptation. *ACM Computing Surveys*, 46(4).",
      P.scAnomaly.ref, P.intrusion.ref, P.jobs.ref, P.emergency.ref], { size: 11.5 });
    await d.closing({ next: "Chapter 7 — Trustworthy, Scalable & LLM-Driven Data Mining" });
  },
};
