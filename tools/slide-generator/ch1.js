const P = require("./pubs");
module.exports = {
  meta: { num: 1, title: "The Modern Data Mining Landscape", short: "Data Mining Landscape" },
  async build(d) {
    await d.cover({ subtitle: "From knowledge discovery to foundation models — what data mining is in 2026",
      notes: "Welcome to Advanced Data Mining for the M.Sc. in Data Science. This chapter sets the scene: what data mining is, the process we follow, the families of tasks we will study, and how the field has changed with deep learning and large language models." });
    await d.objectives([
      ["FaBullseye", "**Define** data mining and position it within KDD, machine learning and AI"],
      ["FaProjectDiagram", "**Apply** the KDD / CRISP-DM process to frame a real data project"],
      ["FaSitemap", "**Distinguish** predictive and descriptive mining tasks and match them to algorithms"],
      ["FaRocket", "**Discuss** current trends: data-centric AI, foundation models, LLM-assisted analytics"],
      ["FaBalanceScale", "**Recognise** ethical, legal and scalability challenges (e.g. Saudi PDPL)"],
    ], { notes: "Read these as the measurable outcomes for the chapter. The final quiz slide maps back to them." });
    await d.agenda([["Why data mining?", "Data growth, definition, history"], ["The process", "KDD and CRISP-DM"], ["Mining tasks", "Predictive vs descriptive"], ["The 2026 landscape", "Trends, tools, ethics, course map"]]);

    await d.divider(1, "Why data mining?", "Data is abundant; insight is scarce");
    await d.figure({ title: "The data deluge", img: "ch1_datagrowth", textW: 4.4,
      bullets: ["Global data created per year has grown **~90×** in 15 years", "Sources: sensors & IoT, transactions, social media, mobile, satellites, generative AI", "Most of it is **never analysed** — the bottleneck is turning data into decisions"],
      caption: "Zettabytes created/consumed per year (IDC/Statista estimates; 2025 = forecast)",
      notes: "Figures are IDC / Statista estimates of data created, captured, copied and consumed worldwide. The point is not the exact number but the order of magnitude: storage is cheap, analysis is the bottleneck. Data mining is the discipline that closes this gap." });
    await d.concept({ title: "What is data mining?", icon: "FaGem", kicker: "DEFINITION",
      def: "The non-trivial extraction of **implicit, previously unknown and potentially useful** patterns from large data sets.",
      img: "ch1_venn", imgH: 3.3,
      bullets: ["Core step of **Knowledge Discovery in Databases (KDD)** — Fayyad et al., 1996", "Patterns must be **valid, novel, useful and understandable**"],
      notes: "Classic definition from Fayyad, Piatetsky-Shapiro and Smyth (1996). Data mining sits at the intersection of statistics (inference, uncertainty), machine learning (algorithms that learn from data) and database / big-data systems (scale). Emphasise the four criteria: valid, novel, useful, understandable." });
    await d.compare({ title: "Mining is discovery, not querying",
      left: { h: "Not data mining", items: ["Looking up a phone number in a directory", "SQL: total sales per region last month", "A dashboard of predefined KPIs", "Keyword search on the web"] },
      right: { h: "Data mining", items: ["Discovering which customers are likely to churn", "Finding product bundles bought together", "Grouping patients with similar disease trajectories", "Flagging unusual payment transactions"] },
      takeaway: "**Rule of thumb:** a query answers a question you already know how to ask; mining finds patterns you did not know to look for.",
      notes: "Ask students for more examples of each. Querying retrieves known facts; mining infers unknown structure. Note that in practice both work together — mining results often become new queries or dashboards." });
    await d.timeline({ title: "Sixty years in one slide", items: [
      ["1960s", "Data collection & database systems"], ["1989", "First KDD workshop (Piatetsky-Shapiro)"], ["1993–94", "Association rules & Apriori (Agrawal)"],
      ["1996–2000", "KDD process; CRISP-DM standard"], ["2004–2012", "MapReduce, Hadoop, Spark — big data"], ["2012–2017", "Deep learning; transformers (2017)"],
      ["2022–2026", "LLMs, foundation models, agentic data science"]],
      notes: "The field moved from databases (store and retrieve) to KDD (discover), to big data (scale), to deep learning (representation learning), and now to foundation models that can be prompted to perform many mining tasks. Each wave added capabilities without making the earlier ideas obsolete." });

    await d.divider(2, "The data mining process", "Mining is one step in a larger loop");
    await d.process({ title: "The KDD process (Fayyad et al., 1996)", lead: "Knowledge discovery is iterative — expect to loop back from any step.", steps: [
      { h: "Selection", t: "Choose target data relevant to the goal", icon: "FaDatabase" }, { h: "Preprocessing", t: "Clean, integrate, handle missing & noisy data", icon: "FaBroom" },
      { h: "Transformation", t: "Feature engineering, reduction, encoding", icon: "FaExchangeAlt" }, { h: "Data mining", t: "Apply algorithms to extract patterns or models", icon: "FaCogs" },
      { h: "Evaluation", t: "Interpret, validate and visualise; turn into knowledge", icon: "FaChartLine" }],
      notes: "Five steps of KDD. Stress the feedback loops: poor evaluation results usually send you back to preprocessing or feature engineering, not to a fancier algorithm." });
    await d.process({ title: "CRISP-DM: the industry standard", steps: [
      { h: "Business understanding", t: "Objectives, success criteria, constraints" }, { h: "Data understanding", t: "Collect, explore, assess quality" },
      { h: "Data preparation", t: "Select, clean, construct, integrate, format" }, { h: "Modelling", t: "Select technique, tune, build" },
      { h: "Evaluation", t: "Does it meet the business goal?" }, { h: "Deployment", t: "Integrate, monitor, maintain (MLOps)" }],
      takeaway: "Modern extensions — **CRISP-ML(Q)** and MLOps — add monitoring, drift detection and retraining after deployment.",
      notes: "CRISP-DM (Chapman et al., 2000) remains the most used process model in surveys of practitioners. Highlight the first phase: most failed projects fail because the business question was not clear. CRISP-ML(Q) (Studer et al., 2021) adds quality assurance and monitoring." });
    await d.statement("Better data usually beats a better algorithm.", { icon: "FaDatabase", by: "The data-centric AI view — Andrew Ng; Zha et al., ACM Computing Surveys (2025)",
      notes: "Data-centric AI shifts effort from model architecture to systematic improvement of data: labelling quality, coverage, cleaning, augmentation. Chapter 2 develops this in detail." });

    await d.divider(3, "Data mining tasks", "Predictive and descriptive families");
    await d.bigfig({ title: "Four tasks at a glance", img: "ch1_tasks",
      takeaway: "**Predictive** tasks learn a mapping to a known target; **descriptive** tasks reveal structure without labels.",
      notes: "Left to right: classification (learn a decision boundary from labelled data), clustering (find groups without labels), association (find co-occurring items), anomaly detection (find observations that deviate from normal behaviour). The whole course is organised around these families." });
    await d.cards({ title: "The task families we will study", items: [
      { h: "Classification", t: "Predict a discrete label — fraud / not fraud, disease type. **Ch. 3–4**", icon: "FaTags" },
      { h: "Regression & forecasting", t: "Predict a number or a future value — price, demand. **Ch. 3, 6**", icon: "FaChartLine" },
      { h: "Clustering", t: "Group similar objects with no labels — customer segments. **Ch. 5**", icon: "FaObjectGroup" },
      { h: "Association & sequences", t: "Items or events that co-occur or follow each other. **Ch. 9**", icon: "FaShoppingBasket" },
      { h: "Anomaly detection", t: "Rare, suspicious observations — intrusions, faults. **Ch. 6**", icon: "FaExclamationTriangle" },
      { h: "Text & graph mining", t: "Unstructured and relational data — topics, communities. **Ch. 8**", icon: "FaProjectDiagram" }],
      notes: "Map each task to the chapter where it is covered. Point out that real projects often chain tasks, e.g. clustering to create segments, then classification within each segment." });
    await d.table({ title: "Matching questions to tasks", head: ["Business question", "Task", "Typical methods"], colW: [5.4, 2.6, 4.13], rows: [
      ["Will this applicant default on a loan?", "Classification", "Logistic regression, gradient boosting"],
      ["What will monthly POS sales be next quarter?", "Forecasting", "ARIMA, LSTM/TCN, foundation models"],
      ["Which customers behave alike?", "Clustering", "k-means, HDBSCAN, GMM"],
      ["Which products are bought together?", "Association", "Apriori, FP-Growth"],
      ["Is this smart-contract transaction fraudulent?", "Anomaly detection", "Isolation Forest, autoencoders"],
      ["What topics dominate student course reviews?", "Text mining", "TF-IDF + SVM, BERTopic"],
      ["Who are the influential users in a network?", "Graph mining", "PageRank, community detection, GNNs"]],
      notes: "Have students propose a question from their own workplace and classify it. Several examples come from Saudi contexts we will meet again in the research spotlights." });
    await d.cards({ title: "Data comes in many shapes", cols: 3, items: [
      { h: "Tabular / relational", t: "Rows = objects, columns = attributes", icon: "FaTable" }, { h: "Time series & streams", t: "Ordered, often high-velocity", icon: "FaWaveSquare" },
      { h: "Text & documents", t: "Unstructured language, multilingual (Arabic!)", icon: "FaFileAlt" }, { h: "Graphs & networks", t: "Entities and their relationships", icon: "FaShareAlt" },
      { h: "Images & video", t: "Pixels → learned representations", icon: "FaImage" }, { h: "Spatio-temporal", t: "GPS traces, traffic, mobility", icon: "FaMapMarkedAlt" }],
      notes: "Classical data mining assumed one flat table. Modern pipelines convert other modalities into vectors (embeddings) so the same mining algorithms can be applied — a recurring theme from Chapter 2 onwards." });

    await d.divider(4, "The 2026 landscape", "What has changed — and what has not");
    await d.cards({ title: "Where data mining creates value", cols: 3, items: [
      { h: "Healthcare", t: "Diagnosis support from X-rays, readmission risk, patient similarity", icon: "FaHeartbeat" },
      { h: "Finance & fintech", t: "Fraud and anomaly detection, credit scoring, payment analytics", icon: "FaMoneyCheckAlt" },
      { h: "Smart cities & mobility", t: "Traffic prediction, signal control, EV planning", icon: "FaCity" },
      { h: "Retail & e-commerce", t: "Recommendation, basket analysis, demand forecasting", icon: "FaShoppingCart" },
      { h: "Energy & sustainability", t: "Load forecasting, emissions monitoring", icon: "FaSolarPanel" },
      { h: "Education", t: "Learning analytics, sentiment of course feedback", icon: "FaGraduationCap" }],
      notes: "Many of these domains are priorities of Saudi Vision 2030. Each application area appears later in the course with a concrete method." });
    await d.cards({ title: "Six trends reshaping the field", cols: 3, tSize: 14, items: [
      { h: "Foundation models", t: "Pre-trained models for text, time series (Chronos, TimesFM) and tables (TabPFN)", icon: "FaCubes" },
      { h: "LLM-assisted mining", t: "LLMs for feature engineering, labelling, code generation and data agents", icon: "FaRobot" },
      { h: "Data-centric AI", t: "Systematic data quality, labelling and augmentation", icon: "FaDatabase" },
      { h: "Graph learning", t: "GNNs and knowledge graphs for relational data", icon: "FaProjectDiagram" },
      { h: "Trustworthy AI", t: "Explainability, fairness, privacy, regulation (EU AI Act, Saudi PDPL)", icon: "FaShieldAlt" },
      { h: "Scale & efficiency", t: "Lakehouse, DuckDB/Polars, model compression, edge & federated mining", icon: "FaServer" }],
      notes: "These trends shape the new chapters 6–8. Foundation models do not replace classical mining: on many tabular problems gradient-boosted trees remain state of the art, and understanding the fundamentals is what lets you evaluate new tools critically." });
    await d.compare({ title: "Classical vs. modern pipelines",
      left: { h: "Classical (≈2000–2015)", items: ["Hand-crafted features", "One algorithm per task", "Batch, single-machine", "Accuracy is the main goal", "Report delivered once"] },
      right: { h: "Modern (2020s)", items: ["Learned representations & embeddings", "Pre-trained / foundation models, fine-tuned", "Distributed, streaming, cloud-native", "Accuracy **+** robustness, fairness, explainability", "Deployed, monitored, retrained (MLOps)"] },
      notes: "Not a replacement but an extension. The classical concepts — distance, impurity, support, validation — are exactly what you need to understand and debug modern systems." });
    await d.code({ title: "The toolbox: a mining workflow in a few lines", code:
`import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import classification_report

df = pd.read_csv("transactions.csv")
X, y = df.drop(columns="is_fraud"), df["is_fraud"]
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=0)

model = make_pipeline(StandardScaler(),
                      HistGradientBoostingClassifier())
model.fit(X_tr, y_tr)
print(classification_report(y_te, model.predict(X_te)))`,
      bullets: ["**Python** is the lingua franca: pandas / Polars, scikit-learn, PyTorch", "**SQL engines**: DuckDB, Spark for scale", "**MLflow** for experiment tracking", "7 Colab-ready labs on **GitHub**"],
      notes: "Every chapter has a companion lab. This snippet shows the canonical pattern: load, split with stratification, build a pipeline, fit, evaluate on held-out data. We will dissect every line over the semester." });
    await d.cards({ title: "Challenges that never go away", cols: 4, items: [
      { h: "Scalability", t: "Billions of rows, high dimensions, streams", icon: "FaExpandArrowsAlt" }, { h: "Data quality", t: "Missing, noisy, biased, leaking data", icon: "FaBug" },
      { h: "Privacy & law", t: "Saudi PDPL (enforced 2024), GDPR, consent", icon: "FaUserShield" }, { h: "Interpretability", t: "Can a decision be explained and contested?", icon: "FaSearch" }],
      takeaway: "Every chapter ends with these four lenses: **does it scale, is the data sound, is it lawful, can we explain it?**",
      notes: "The Saudi Personal Data Protection Law came into force in September 2023 with full enforcement from September 2024. Chapter 7 returns to privacy-preserving mining." });
    await d.spotlight({ pubs: [
      { ...P.textANN, why: "Text mining of the scientific literature to map **where neural-network research is heading** — data mining applied to research itself." },
      { ...P.tourism, why: "End-to-end ML pipeline on Saudi tourism data — a **CRISP-DM** project from business question to insight." },
      { ...P.realEstate, why: "Regression models forecasting Riyadh property prices — **predictive mining** on local tabular data." },
      { ...P.traffic, why: "ML framework for traffic management and safety in Al-Kharj — **smart-city** analytics." }],
      notes: "These papers are used as running case studies throughout the course. Students may choose one as the starting point of their term project." });
    await d.agenda([["Landscape", "Ch. 1"], ["Preprocessing", "Ch. 2"], ["Classification & evaluation", "Ch. 3"], ["Trees & ensembles", "Ch. 4"], ["Clustering", "Ch. 5"],
      ["Anomalies & time series", "Ch. 6"], ["Trustworthy & scalable DM", "Ch. 7"], ["Text & graph mining", "Ch. 8"], ["Association & sequences", "Ch. 9"]], { title: "Course map",
      notes: "Nine chapters, each with a Python lab. Chapters 1–5 cover the core canon of the leading textbooks; chapters 6–8 add topics now standard in top programmes (e.g. Stanford CS246, CMU) — anomaly and time-series mining, trustworthy and scalable LLM-era mining, text and graph mining; chapter 9 closes with association rules and sequential patterns." });
    await d.table({ title: "Python labs on GitHub + Google Colab", lead: "Repository: **github.com/alilouati/advanced-data-mining** · each notebook opens in Colab and runs on built-in data or your own CSV",
      head: ["Lab", "Chapter", "You will practise"], colW: [1.3, 4.0, 6.83], rows: [
      ["02", "Data understanding & preprocessing", "EDA plots, missing values, outliers, encoding, scaling, PCA, t-SNE"],
      ["03", "Classification & evaluation", "k-NN, Naïve Bayes, logistic regression, SVM, CV, ROC / PR curves"],
      ["04", "Trees & ensembles", "Information gain by hand, tree plots, random forest, boosting, importance"],
      ["05", "Clustering", "k-means, elbow, silhouette, dendrograms, DBSCAN, GMM"],
      ["06", "Anomalies & time series", "Isolation Forest, LOF, decomposition, lag-feature forecasting"],
      ["08", "Text & graph mining", "TF-IDF, sentiment (Arabic + English), topics, PageRank, communities"],
      ["09", "Association rules", "Support, confidence, lift, Apriori, FP-Growth, rule networks"]], rowH: 0.5, size: 15,
      notes: "The repository is private: add students as collaborators (or a GitHub Classroom organisation) so the 'Open in Colab' links work. In Colab, File > Open notebook > GitHub > tick 'Include private repos'." });
    await d.summary(["Data mining = discovering **valid, novel, useful, understandable** patterns at scale",
      "It is one step of an **iterative process** (KDD, CRISP-DM) dominated by data preparation",
      "Tasks are **predictive** (classification, regression, forecasting) or **descriptive** (clustering, association, anomalies)",
      "Modern mining adds **representations, foundation models and LLMs** — but rests on the classical ideas",
      "Value depends on **scale, data quality, legality and explainability**"]);
    await d.quiz(["Give one example of a task that is querying and one that is data mining from your own organisation.",
      "Which CRISP-DM phase is most often responsible for project failure, and why?",
      "Classify each as predictive or descriptive: churn prediction, customer segmentation, fraud scoring, basket analysis.",
      "Name two reasons why gradient-boosted trees remain relevant despite foundation models."],
      { notes: "Suggested answers: (1) open; (2) business understanding — unclear objective; also data preparation; (3) predictive, descriptive, predictive (or anomaly), descriptive; (4) strong accuracy on tabular data, fast, cheap, interpretable with SHAP, little data needed." });
    await d.references([
      "Han, J., Pei, J., & Tong, H. (2022). *Data Mining: Concepts and Techniques* (4th ed.). Morgan Kaufmann.",
      "Tan, P.-N., Steinbach, M., Karpatne, A., & Kumar, V. (2019). *Introduction to Data Mining* (2nd ed.). Pearson.",
      "Leskovec, J., Rajaraman, A., & Ullman, J. D. (2020). *Mining of Massive Datasets* (3rd ed.). Cambridge UP. (Stanford CS246)",
      "Aggarwal, C. C. (2015). *Data Mining: The Textbook*. Springer.",
      "Fayyad, U., Piatetsky-Shapiro, G., & Smyth, P. (1996). From data mining to knowledge discovery in databases. *AI Magazine*, 17(3).",
      "Chapman, P., et al. (2000). *CRISP-DM 1.0: Step-by-step data mining guide*. SPSS.",
      "Studer, S., et al. (2021). Towards CRISP-ML(Q). *Machine Learning and Knowledge Extraction*, 3(2).",
      "Zha, D., et al. (2025). Data-centric artificial intelligence: A survey. *ACM Computing Surveys*, 57(5).",
      "Bommasani, R., et al. (2021). On the opportunities and risks of foundation models. arXiv:2108.07258.",
      P.textANN.ref, P.tourism.ref, P.realEstate.ref, P.traffic.ref]);
    await d.closing({ next: "Chapter 2 — Data Understanding & Preprocessing" });
  },
};
