const P = require("./pubs");
module.exports = {
  meta: { num: 7, title: "Trustworthy, Scalable & LLM-Driven Data Mining", short: "Trustworthy & Scalable DM" },
  async build(d) {
    await d.cover({ subtitle: "Fairness, privacy, big-data systems, AutoML, MLOps and large language models",
      notes: "This chapter connects the techniques of the course to the questions every deployed system must answer: is it fair, private and explainable; does it scale; can it be maintained; and how do LLMs change the data-mining workflow?" });
    await d.objectives([
      ["FaBalanceScale", "**Measure** fairness and choose a bias-mitigation strategy"],
      ["FaUserShield", "**Explain** k-anonymity, differential privacy and federated learning"],
      ["FaServer", "**Design** scalable pipelines with MapReduce / Spark and streaming algorithms"],
      ["FaRobot", "**Use** AutoML, MLOps and LLMs responsibly in a mining workflow"],
      ["FaFlask", "**Identify** open research directions for a master's thesis"],
    ]);
    await d.agenda([["Trustworthy mining", "Explainability, fairness, privacy, law"], ["Mining at scale", "MapReduce, Spark, streams"], ["Automation", "AutoML and MLOps"], ["The LLM era", "LLMs, RAG, agents, frontiers"]]);

    await d.divider(1, "Trustworthy data mining", "Accurate is not enough");
    await d.cards({ title: "Six pillars of trustworthy data mining", cols: 3, items: [
      { h: "Transparency", t: "Explain models and decisions (SHAP, rules, model cards)", icon: "FaSearch" },
      { h: "Fairness", t: "No unjustified disparity between groups", icon: "FaBalanceScale" },
      { h: "Privacy", t: "Protect individuals in data and in models", icon: "FaUserShield" },
      { h: "Robustness", t: "Stable under drift, noise and attacks", icon: "FaShieldAlt" },
      { h: "Accountability", t: "Documentation, audit trails, human oversight", icon: "FaClipboardList" },
      { h: "Sustainability", t: "Energy and cost of training and inference", icon: "FaLeaf" }],
      notes: "These pillars appear, with slightly different names, in SDAIA's AI Ethics Principles (2023), the OECD AI Principles and the EU AI Act." });
    await d.compare({ title: "Interpretable by design vs. explained after the fact",
      left: { h: "Interpretable models", items: ["Logistic regression, small trees, rule lists, GAMs (EBM)", "The model **is** the explanation", "Preferred for high-stakes decisions (Rudin, 2019)", "Often only slightly less accurate on tabular data"] },
      right: { h: "Post-hoc explanations", items: ["SHAP, LIME, counterfactuals, saliency maps", "Work with any black box", "Approximate — can be unstable or misleading", "Useful for debugging and auditing"] },
      notes: "Explainable Boosting Machines (InterpretML) are generalised additive models with boosted shape functions — competitive accuracy with full transparency." });
    await d.bigfig({ title: "Measuring fairness", img: "ch9_fairness",
      takeaway: "Different fairness definitions **cannot all hold at once** when base rates differ (Kleinberg et al., 2016; Chouldechova, 2017) — choosing one is a policy decision.",
      notes: "Illustrative loan-approval model. Demographic parity compares approval rates; equal opportunity compares true-positive rates among qualified applicants; predictive parity compares precision. Here precision is equal but selection and TPR differ." });
    await d.process({ title: "Where to intervene against bias", steps: [
      { h: "Data", t: "Audit representation and labels; collect missing groups", icon: "FaDatabase" },
      { h: "Pre-processing", t: "Re-weighing, resampling, removing proxy features", icon: "FaFilter" },
      { h: "In-processing", t: "Fairness constraints or adversarial debiasing during training", icon: "FaCogs" },
      { h: "Post-processing", t: "Group-specific thresholds, calibration", icon: "FaSlidersH" },
      { h: "Monitor", t: "Track fairness metrics after deployment", icon: "FaChartLine" }],
      takeaway: "Removing a sensitive attribute is **not** enough — proxies (district, name, school) can encode it. Toolkits: Fairlearn, AIF360.",
      notes: "Fairness interventions trade off against accuracy and against each other; document the choice in a model card (Mitchell et al., 2019)." });
    await d.cards({ title: "Privacy-preserving data mining", cols: 4, items: [
      { h: "Anonymisation", t: "k-anonymity, l-diversity, t-closeness — vulnerable to linkage attacks", icon: "FaUserSecret" },
      { h: "Differential privacy", t: "Calibrated noise; provable guarantee ε", icon: "FaRandom" },
      { h: "Federated learning", t: "Train where the data lives; share only model updates", icon: "FaNetworkWired" },
      { h: "Synthetic data", t: "Generative models create realistic, privacy-safer data", icon: "FaClone" }],
      takeaway: "Removing names is not anonymisation: 87 % of Americans are unique by ZIP code, birth date and sex (Sweeney, 2000).",
      notes: "Sweeney's classic result motivated k-anonymity. Differential privacy is now used by national statistics offices and big tech companies." });
    await d.formulas({ title: "Differential privacy in one slide", img: "ch9_dp", fw: 6.2, items: [
      ["Guarantee", "P[M(D) ∈ S] ≤ e^ε · P[M(D′) ∈ S]", "D and D′ differ in one person"],
      ["Laplace mechanism", "M(D) = f(D) + Laplace(Δf / ε)", "Δf = sensitivity of the query"],
      ["Budget", "smaller ε → more noise → more privacy", "Budgets add up over queries"],
      ["In ML", "DP-SGD: clip gradients + add noise", "Opacus, TensorFlow Privacy"]],
      notes: "Dwork et al. (2006). For a counting query the sensitivity is 1, so the noise scale is 1/ε. The figure shows the released-count distribution for different ε." });
    await d.process({ title: "Federated learning", steps: [
      { h: "Broadcast", t: "Server sends the global model to clients", icon: "FaBroadcastTower" },
      { h: "Local training", t: "Hospitals, banks or phones train on private data", icon: "FaHospital" },
      { h: "Send updates", t: "Only weights / gradients leave the device", icon: "FaUpload" },
      { h: "Aggregate", t: "FedAvg: weighted average of updates", icon: "FaLayerGroup" },
      { h: "Repeat", t: "Until convergence", icon: "FaRedo" }],
      takeaway: "Challenges: non-IID data across clients, communication cost, and attacks on updates — combine with secure aggregation and DP.",
      notes: "McMahan et al. (2017). Natural fit for multi-hospital medical imaging or multi-bank fraud models where data cannot be pooled." });
    await d.table({ title: "The regulatory landscape", head: ["Framework", "Scope", "What it means for data miners"], colW: [3.2, 3.0, 5.93], rows: [
      ["Saudi PDPL (in force 2023, enforced 2024)", "Personal data in KSA", "Lawful basis, purpose limitation, data-subject rights, cross-border transfer rules"],
      ["SDAIA AI Ethics Principles (2023)", "AI systems in KSA", "Fairness, privacy, transparency, accountability, human-centricity"],
      ["EU AI Act (2024)", "AI placed on EU market", "Risk tiers; high-risk systems need data governance, documentation, oversight"],
      ["NIST AI RMF (2023)", "Voluntary, international", "Govern, map, measure, manage AI risks"]],
      notes: "Not legal advice — the point is that data-mining design decisions (which features, how long data is kept, which explanations are offered) now have legal consequences." });

    await d.divider(2, "Mining at scale", "When data does not fit on one machine");
    await d.cards({ title: "Big data: the four Vs", cols: 4, items: [
      { h: "Volume", t: "Terabytes to petabytes", icon: "FaDatabase" }, { h: "Velocity", t: "Streams: payments, sensors, clicks", icon: "FaTachometerAlt" },
      { h: "Variety", t: "Tables, text, images, graphs", icon: "FaShapes" }, { h: "Veracity", t: "Noise, bias, missing data", icon: "FaCheckDouble" }],
      takeaway: "Rule of thumb: try **one big machine** first (DuckDB, Polars handle 100s of GB) — distribute only when you must.",
      notes: "Single-node engines have become very powerful; distributed systems add complexity and cost." });
    await d.bigfig({ title: "MapReduce: divide, process, combine", img: "ch9_mapreduce",
      takeaway: "**Map** emits key–value pairs in parallel · **Shuffle** groups by key · **Reduce** aggregates. Many mining algorithms (counting supports, k-means steps) fit this pattern.",
      notes: "Dean & Ghemawat (2004). Word count is the 'hello world'. Apriori support counting maps each transaction to its candidate itemsets and reduces by summing; one k-means iteration maps points to nearest centroids and reduces by averaging." });
    await d.compare({ title: "Hadoop MapReduce vs. Apache Spark",
      left: { h: "Hadoop MapReduce", items: ["Writes intermediate results to disk", "Slow for iterative algorithms", "Batch only", "Largely legacy today"] },
      right: { h: "Apache Spark", items: ["In-memory resilient datasets / DataFrames", "10–100× faster for iterative ML", "SQL, streaming, MLlib (FP-Growth, k-means, GBT), GraphFrames", "Python API: PySpark"] },
      notes: "Zaharia et al. (2012). Other options: Dask and Ray in the Python ecosystem; cloud warehouses (BigQuery, Snowflake) for SQL-centric mining." });
    await d.figure({ title: "Mining data streams", img: "ch9_stream", textW: 5.6,
      lead: "One pass, bounded memory, answers at any time.",
      bullets: ["**Windows**: sliding, tumbling, decaying", "**Reservoir sampling**: uniform sample of an unbounded stream", "**Sketches**: Count-Min (frequencies), HyperLogLog (distinct counts), Bloom filter (membership)", "**Online learning**: Hoeffding trees, adaptive random forests (River)"],
      notes: "Leskovec, Rajaraman & Ullman, Mining of Massive Datasets, ch. 4. Sketches trade a small, bounded error for huge memory savings — HyperLogLog counts billions of distinct items with a few kilobytes." });
    await d.cards({ title: "The modern data stack for mining", cols: 3, tSize: 15, items: [
      { h: "Lakehouse", t: "Parquet + Delta Lake / Apache Iceberg tables", icon: "FaWater" },
      { h: "Fast single-node", t: "DuckDB, Polars for analytics on a laptop", icon: "FaBolt" },
      { h: "Distributed compute", t: "Spark, Ray, Dask", icon: "FaServer" },
      { h: "Feature stores", t: "Consistent features for training and serving", icon: "FaWarehouse" },
      { h: "Vector databases", t: "FAISS, pgvector, Milvus for embedding search", icon: "FaCubes" },
      { h: "Orchestration", t: "Airflow, Dagster, Prefect pipelines", icon: "FaProjectDiagram" }]});

    await d.divider(3, "Automation", "AutoML and MLOps");
    await d.figure({ title: "AutoML: searching the pipeline space", img: "ch9_automl", textW: 4.8,
      bullets: ["**Hyper-parameter optimisation**: random search, Bayesian optimisation (Optuna), Hyperband", "**Full pipelines**: auto-sklearn, AutoGluon, FLAML", "**Neural architecture search** — evolutionary and bi-level methods", "Still needs: problem framing, leakage control, evaluation design"],
      notes: "Each dot is one trial; the red line is the best score so far. Our group's work on bi-level evolutionary CNN design and pruning is an example of architecture search and model compression." });
    await d.process({ title: "MLOps: keeping mined models alive", steps: [
      { h: "Version", t: "Data, code and features (DVC, lakehouse)", icon: "FaCodeBranch" },
      { h: "Track", t: "Experiments, metrics, artefacts (MLflow)", icon: "FaClipboardList" },
      { h: "Validate", t: "Tests for data quality, fairness, performance", icon: "FaCheckCircle" },
      { h: "Deploy", t: "Batch or real-time serving; model registry", icon: "FaRocket" },
      { h: "Monitor", t: "Drift, errors, latency, fairness → retrain", icon: "FaHeartbeat" }],
      notes: "Sculley et al. (2015) 'Hidden technical debt in ML systems': the model is a small part of a real system. Monitoring links back to concept drift in Chapter 6." });

    await d.divider(4, "The LLM era", "Large language models as data-mining tools");
    await d.cards({ title: "What LLMs change in the mining workflow", cols: 3, tSize: 15, items: [
      { h: "Zero-shot mining", t: "Classify, extract entities or sentiment from a prompt — no training set", icon: "FaMagic" },
      { h: "Labelling at scale", t: "LLM-assisted annotation, then human verification", icon: "FaTags" },
      { h: "Feature engineering", t: "Suggest features, turn text into structured attributes", icon: "FaWrench" },
      { h: "Code & SQL generation", t: "Natural-language analytics, notebook copilots", icon: "FaCode" },
      { h: "Data agents", t: "Agents that plan, query, run models and report — with tools", icon: "FaRobot" },
      { h: "Synthetic data", t: "Augment rare classes; privacy-aware sharing", icon: "FaClone" }],
      notes: "LLMs are best seen as a new set of tools inside the KDD process, not a replacement for it. Every output still needs validation against ground truth." });
    await d.process({ title: "Retrieval-augmented generation (RAG)", steps: [
      { h: "Chunk", t: "Split documents into passages", icon: "FaCut" },
      { h: "Embed", t: "Sentence embeddings (Ch. 8)", icon: "FaCubes" },
      { h: "Index", t: "Vector database / approximate k-NN", icon: "FaDatabase" },
      { h: "Retrieve", t: "Top-k passages for the question (Ch. 3 k-NN!)", icon: "FaSearch" },
      { h: "Generate", t: "LLM answers grounded in retrieved text, with citations", icon: "FaCommentDots" }],
      takeaway: "RAG reuses classic mining components — **embeddings, nearest neighbours, ranking metrics** — and is evaluated with precision@k, recall@k and faithfulness.",
      notes: "Lewis et al. (2020). GraphRAG adds a knowledge graph built from the corpus (Chapter 8). RAG reduces but does not eliminate hallucination." });
    await d.cards({ title: "Using LLMs responsibly in data mining", cols: 3, tSize: 15, items: [
      { h: "Hallucination", t: "Plausible but false outputs — verify against data", icon: "FaGhost", color: "coral" },
      { h: "Contamination", t: "Benchmarks may be in the training data — results look too good", icon: "FaBiohazard", color: "amber" },
      { h: "Privacy", t: "Do not send personal data to external APIs; prefer local models", icon: "FaLock", color: "plum" },
      { h: "Bias", t: "LLMs reproduce social and cultural biases, incl. against Arabic dialects", icon: "FaBalanceScaleRight", color: "teal" },
      { h: "Reproducibility", t: "Pin model versions, seeds, prompts; log everything", icon: "FaRedo", color: "green" },
      { h: "Cost & energy", t: "Compare with a small model — often good enough", icon: "FaLeaf", color: "slate" }]});
    await d.cards({ title: "Research frontiers — ideas for your thesis", cols: 3, tSize: 15, items: [
      { h: "Foundation models", t: "Tabular & time-series: when do TabPFN / Chronos beat tuned trees and ARIMA?", icon: "FaCubes" },
      { h: "Causal data mining", t: "From association to causation: causal discovery, uplift modelling", icon: "FaProjectDiagram" },
      { h: "Agentic data science", t: "Reliable LLM agents for end-to-end analysis", icon: "FaRobot" },
      { h: "Efficient models", t: "Pruning, compression, NAS for edge deployment", icon: "FaCompress" },
      { h: "Arabic data mining", t: "Dialect-aware text mining and evaluation resources", icon: "FaLanguage" },
      { h: "Smart-city analytics", t: "Mobility, energy and safety mining for Saudi cities", icon: "FaCity" }],
      notes: "Each frontier links to work in our group: model compression and NAS, Arabic text mining, LLM-in-the-loop traffic control, and smart-city analytics." });
    await d.spotlight({ pubs: [
      { ...P.llmSecurity, why: "**LLMs** generating security claims for autonomous vehicles — LLM-assisted analysis in a safety-critical domain." },
      { ...P.llmTraffic, why: "**LLM + deep learning in the loop** for disturbed traffic control — combining language models with learned controllers." },
      { ...P.pruning, why: "Bi-level **pruning** of CNNs — efficient, deployable models (AutoML / NAS)." },
      { ...P.marl, why: "**Multi-agent RL** for cooperative autonomous vehicles in sustainable smart cities." }]});
    await d.process({ title: "Course project: from question to paper", steps: [
      { h: "Proposal", t: "Question, data source, ethics check (week 4)", icon: "FaLightbulb" },
      { h: "Data & EDA", t: "Cleaning, leakage audit, baseline (week 7)", icon: "FaBroom" },
      { h: "Mining", t: "≥ 2 methods from Ch. 3–9, proper validation (week 11)", icon: "FaCogs" },
      { h: "Trust", t: "Explanation, fairness / privacy analysis (week 13)", icon: "FaShieldAlt" },
      { h: "Report", t: "Conference-style paper + reproducible notebook (week 15)", icon: "FaFileAlt" }],
      notes: "Suggested milestones — adapt weeks to the academic calendar. Strong projects can be extended into a conference or journal submission." });
    await d.summary(["Trustworthy mining = **explainable, fair, private, robust, accountable** — and lawful (PDPL)",
      "Fairness metrics conflict; privacy needs **DP, federated learning** or careful anonymisation",
      "Scale with **Spark**, single-node engines and **streaming sketches**",
      "**AutoML** searches pipelines; **MLOps** keeps models healthy after deployment",
      "**LLMs** and **RAG** are powerful mining tools — verify, document and evaluate them like any model"]);
    await d.quiz(["Your loan model has equal precision across groups but different approval rates. Which fairness definitions hold and which fail?",
      "Why is deleting names and IDs not sufficient to anonymise a data set?",
      "Express Apriori's support counting as a MapReduce job.",
      "List three checks before trusting LLM-generated labels for training a classifier."],
      { notes: "(1) Predictive parity holds; demographic parity (and probably equal opportunity) fail. (2) Quasi-identifiers allow linkage (Sweeney). (3) Map: for each transaction emit (candidate, 1) for every candidate it contains; Reduce: sum per candidate and keep ≥ minsup. (4) Agreement with a human-labelled sample, class-wise error analysis / bias, stability across prompts and model versions, no test-set contamination." });
    await d.references([
      "Rudin, C. (2019). Stop explaining black box machine learning models for high stakes decisions. *Nature Machine Intelligence*, 1.",
      "Barocas, S., Hardt, M., & Narayanan, A. (2023). *Fairness and Machine Learning*. MIT Press.",
      "Kleinberg, J., Mullainathan, S., & Raghavan, M. (2017). Inherent trade-offs in the fair determination of risk scores. *ITCS*.",
      "Dwork, C., & Roth, A. (2014). The algorithmic foundations of differential privacy. *FnT TCS*, 9(3–4).",
      "McMahan, B., et al. (2017). Communication-efficient learning of deep networks from decentralized data. *AISTATS*.",
      "Dean, J., & Ghemawat, S. (2004). MapReduce. *OSDI*. · Zaharia, M., et al. (2012). Resilient distributed datasets. *NSDI*.",
      "Leskovec, J., Rajaraman, A., & Ullman, J. D. (2020). *Mining of Massive Datasets* (3rd ed.), ch. 2–4.",
      "Sculley, D., et al. (2015). Hidden technical debt in machine learning systems. *NeurIPS*.",
      "Lewis, P., et al. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *NeurIPS*.",
      "SDAIA (2023). *AI Ethics Principles*. · Saudi Personal Data Protection Law (2021, amended 2023).",
      "Regulation (EU) 2024/1689 (Artificial Intelligence Act).",
      P.llmSecurity.ref, P.llmTraffic.ref, P.pruning.ref, P.marl.ref], { size: 11.5 });
    await d.closing({ next: "Chapter 8 — Text, Graph & Representation Mining" });
  },
};
