const P = require("./pubs");
module.exports = {
  meta: { num: 8, title: "Text, Graph & Representation Mining", short: "Text & Graph Mining" },
  async build(d) {
    await d.cover({ subtitle: "Mining unstructured and relational data with embeddings, transformers and graph learning",
      notes: "New chapter. Most enterprise data is text or relational. Modern mining turns both into vectors (embeddings) so the techniques of Chapters 3–7 apply." });
    await d.objectives([
      ["FaFileAlt", "**Build** a text-mining pipeline, including Arabic-specific preprocessing"],
      ["FaCubes", "**Explain** TF-IDF, word embeddings and transformer sentence embeddings"],
      ["FaTags", "**Apply** topic modelling (LDA, BERTopic) and text classification"],
      ["FaShareAlt", "**Compute** centralities, PageRank and communities in networks"],
      ["FaProjectDiagram", "**Describe** node embeddings and graph neural networks"],
    ]);
    await d.agenda([["Text mining", "From words to vectors"], ["Mining with text", "Topics, classification, search"], ["Graph mining", "Centrality, PageRank, communities"], ["Graph learning", "Embeddings and GNNs"]]);

    await d.divider(1, "Text mining", "From words to vectors");
    await d.process({ title: "A text-mining pipeline", steps: [
      { h: "Collect", t: "Reviews, tweets, reports, papers", icon: "FaInbox" },
      { h: "Normalise", t: "Lower-case, remove noise, unify Arabic letter forms, strip diacritics", icon: "FaBroom" },
      { h: "Tokenise", t: "Words, sub-words (BPE / WordPiece), lemmas or stems", icon: "FaCut" },
      { h: "Represent", t: "Bag-of-words, TF-IDF or embeddings", icon: "FaCubes" },
      { h: "Mine", t: "Classify, cluster, extract topics, search", icon: "FaCogs" }],
      notes: "Arabic normalisation typically unifies alef variants (أ إ آ → ا), taa marbuta / haa, and alef maqsura / yaa, and removes tatweel and diacritics. Tools: CAMeL Tools, Farasa." });
    await d.formulas({ title: "TF-IDF: weighting words by informativeness", img: "ch8_tfidf", fw: 6.6, items: [
      ["Term frequency", "tf(t, d) = count of t in d / |d|", "Important within the document"],
      ["Inverse doc. freq.", "idf(t) = log( N / df(t) )", "Rare across the corpus → informative"],
      ["Weight", "tf-idf(t, d) = tf(t, d) · idf(t)", "Sparse vector per document"],
      ["Similarity", "cos(d₁, d₂) = d₁ · d₂ / (‖d₁‖ ‖d₂‖)", "Document retrieval and clustering"]],
      notes: "Salton's vector-space model (1970s) is still a strong baseline for classification with linear models and for keyword search (BM25 is its probabilistic cousin). 'mining' appears everywhere, so its weight is low; 'lung' appears in one document, so it is highly weighted there." });
    await d.cards({ title: "Mining Arabic text", cols: 3, tSize: 15, items: [
      { h: "Rich morphology", t: "One word = prefix + stem + suffix: وسيكتبونها", icon: "FaPuzzlePiece" },
      { h: "Dialects", t: "MSA vs. Gulf, Egyptian, Levantine… on social media", icon: "FaComments" },
      { h: "Orthography", t: "Optional diacritics, letter variants, Arabizi, code-switching", icon: "FaFont" },
      { h: "Tools", t: "CAMeL Tools, Farasa, MADAMIRA for segmentation & lemmas", icon: "FaTools" },
      { h: "Pre-trained models", t: "AraBERT, CAMeLBERT, MARBERT; multilingual & Arabic LLMs (e.g. ALLaM, Jais)", icon: "FaCubes" },
      { h: "Our work", t: "Arabic course-review sentiment with SVM (Applied Sciences, 2023)", icon: "FaUniversity" }],
      notes: "Local relevance: Saudi data — reviews, government services feedback, social media — is mostly Arabic and often dialectal. ALLaM is SDAIA's Arabic LLM." });
    await d.figure({ title: "Word embeddings: meaning as geometry", img: "ch8_embeddings", textW: 4.6,
      bullets: ["Dense vectors (100–1,000 dims) learned from context", "**'You shall know a word by the company it keeps'** (Firth)", "word2vec (2013), GloVe (2014), fastText (sub-words)", "Directions encode relations: king − man + woman ≈ queen"],
      notes: "Schematic 2-D illustration. word2vec trains a shallow network to predict a word from its context (CBOW) or the context from a word (skip-gram). fastText's character n-grams help morphologically rich languages such as Arabic." });
    await d.figure({ title: "Transformers and contextual embeddings", img: "ch8_attention", textW: 6.4,
      lead: "Self-attention lets every token look at every other token.",
      bullets: ["Same word, different meaning: 'bank' of a river vs. a bank loan", "**BERT** (2018): bidirectional encoder → contextual embeddings", "**Sentence-transformers**: one vector per sentence for search & clustering", "**LLMs** (GPT, Llama, ALLaM): decoder models, also used as embedders"],
      notes: "Illustrative attention weights: 'bank' attends strongly to 'loan' and 'approved', which disambiguates it. Vaswani et al. (2017) introduced the transformer." });
    await d.timeline({ title: "Five decades of text representation", items: [
      ["1972", "TF-IDF (Spärck Jones)"], ["1990", "Latent Semantic Analysis (SVD)"], ["2003", "LDA topic models (Blei)"], ["2013", "word2vec (Mikolov)"],
      ["2018", "BERT — contextual embeddings"], ["2020", "GPT-3 — few-shot learning"], ["2023–26", "LLM embeddings, RAG, multilingual & Arabic LLMs"]],
      notes: "Each step made representations denser and more contextual. TF-IDF remains useful as a fast, interpretable baseline." });

    await d.divider(2, "Mining with text", "Topics, classification and semantic search");
    await d.figure({ title: "Topic modelling", img: "ch8_topics", stack: true, imgH: 2.9,
      bullets: ["**LDA**: documents = mixtures of topics; topics = distributions over words", "Needs k topics; works on bag-of-words", "**BERTopic**: embeddings → UMAP → HDBSCAN → c-TF-IDF labels", "Better coherence on short texts (tweets, reviews); LLMs can name topics"],
      notes: "Illustrative topics from a corpus of applied-AI abstracts. BERTopic links back to the HDBSCAN clustering of Chapter 5. Evaluate topics with coherence scores and human judgement." });
    await d.cards({ title: "What we mine from text", cols: 3, items: [
      { h: "Classification & sentiment", t: "Spam, intent, opinion polarity, emotion", icon: "FaSmile" },
      { h: "Named entities", t: "People, organisations, places, amounts", icon: "FaUserTag" },
      { h: "Topics & trends", t: "What themes rise or fall over time", icon: "FaChartLine" },
      { h: "Information extraction", t: "Relations and events → structured tables", icon: "FaTable" },
      { h: "Semantic search", t: "Vector similarity over embeddings", icon: "FaSearch" },
      { h: "RAG", t: "Retrieval-augmented generation: retrieve documents, let an LLM answer (Ch. 7)", icon: "FaRobot" }]});
    await d.compare({ title: "Classifying text: classic vs. modern",
      left: { h: "TF-IDF + linear model", items: ["Logistic regression or linear SVM", "Trains in seconds on a laptop", "Strong with a few thousand labels", "Coefficients are interpretable"] },
      right: { h: "Fine-tuned transformer / LLM", items: ["AraBERT / multilingual BERT fine-tuned", "Captures context, negation, dialect", "Zero- or few-shot with LLM prompting", "Needs GPU; harder to explain"] },
      takeaway: "Start with TF-IDF + linear SVM as a baseline; move to transformers when context matters and data or compute allow.",
      notes: "Our Arabic course-review study used an SVM; our hateful-content study compared several ML classifiers. A fair comparison uses the same splits and reports macro-F1 for imbalanced classes." });
    await d.code({ title: "Text mining in Python", codeW: 7.6, code:
`from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import make_pipeline
from sentence_transformers import SentenceTransformer
from sklearn.cluster import HDBSCAN

# 1) baseline classifier
clf = make_pipeline(
    TfidfVectorizer(ngram_range=(1, 2), min_df=2),
    LinearSVC()).fit(train_texts, train_labels)

# 2) semantic embeddings + clustering
enc = SentenceTransformer(
    "paraphrase-multilingual-MiniLM-L12-v2")
E = enc.encode(texts, normalize_embeddings=True)
topics = HDBSCAN(min_cluster_size=15).fit_predict(E)`,
      bullets: ["TF-IDF n-grams + linear SVM", "Multilingual model handles Arabic", "Embeddings → HDBSCAN = topic discovery", "Label clusters with top terms or an LLM"] });

    await d.divider(3, "Graph mining", "Relationships are data too");
    await d.concept({ title: "Graphs are everywhere", icon: "FaShareAlt", kicker: "G = (V, E)",
      def: "**Nodes** are entities; **edges** are relationships — directed or undirected, weighted or not, possibly typed.",
      img: "ch8_degree", imgH: 3.0,
      bullets: ["Social, citation, payment, road and knowledge graphs", "Real networks are **scale-free**: a few hubs, many low-degree nodes"],
      notes: "Degree distribution on log–log axes: the Barabási–Albert graph shows a heavy tail (hubs), unlike the Erdős–Rényi random graph. Hubs matter for influence, robustness and fraud rings." });
    await d.cards({ title: "Who is important? Centrality measures", cols: 3, tSize: 15, items: [
      { h: "Degree", t: "Number of connections — popularity", icon: "FaUserFriends" },
      { h: "Closeness", t: "Inverse average distance to all others — reach", icon: "FaCompressArrowsAlt" },
      { h: "Betweenness", t: "Share of shortest paths through a node — brokers, bottlenecks", icon: "FaRoad" },
      { h: "Eigenvector", t: "Connected to important nodes", icon: "FaStar" },
      { h: "PageRank", t: "Random-surfer importance for directed graphs", icon: "FaGoogle" },
      { h: "k-core", t: "Membership in the densely connected core", icon: "FaBullseye" }],
      notes: "In a road network, betweenness identifies critical intersections; in transaction networks, it can reveal money-mule accounts that link otherwise separate groups." });
    await d.formulas({ title: "PageRank (Brin & Page, 1998)", img: "ch8_pagerank", fw: 6.8, items: [
      ["Idea", "a node is important if important nodes link to it", "Random surfer follows links, sometimes teleports"],
      ["Formula", "PR(v) = (1 − α)/N + α Σ_{u → v} PR(u) / out(u)", "α ≈ 0.85 damping factor"],
      ["Computation", "power iteration until convergence", "Eigenvector of the Google matrix"],
      ["Beyond the web", "citations, fraud scoring, keyword extraction (TextRank)", "Personalised PageRank for recommendation"]],
      notes: "In the toy graph, C receives links from many nodes but passes all its rank to A, which explains why A and B end up with the highest PageRank. This is a good exercise to compute by hand with two iterations." });
    await d.figure({ title: "Community detection", img: "ch8_karate", textW: 4.6,
      bullets: ["Groups with dense internal and sparse external links", "**Modularity** Q compares edges inside groups with a random graph", "**Louvain** (2008) and **Leiden** (2019) maximise Q fast — millions of nodes", "Spectral and label-propagation methods also common"],
      notes: "Zachary's karate club (1977): the club split into two factions after a dispute. Greedy modularity finds groups closely matching the real split. Node size = PageRank; nodes 0 and 33 are the instructor and the administrator." });
    await d.cards({ title: "More graph-mining tasks", cols: 3, items: [
      { h: "Link prediction", t: "Which new friendship, citation or transaction will appear?", icon: "FaLink" },
      { h: "Frequent subgraphs", t: "gSpan: recurring motifs in molecules or fraud rings", icon: "FaShapes" },
      { h: "Knowledge graphs", t: "Entities + typed relations; combine with LLMs (GraphRAG)", icon: "FaBrain" }]});

    await d.divider(4, "Graph representation learning", "Embeddings and graph neural networks");
    await d.process({ title: "Node embeddings: DeepWalk & node2vec", steps: [
      { h: "Random walks", t: "Generate walks from each node (biased in node2vec)", icon: "FaShoePrints" },
      { h: "Walks = sentences", t: "Treat node sequences like words in text", icon: "FaStream" },
      { h: "Skip-gram", t: "Learn vectors predicting neighbours in the walk", icon: "FaCubes" },
      { h: "Use vectors", t: "Clustering, classification, link prediction", icon: "FaCogs" }],
      takeaway: "The same idea as word2vec — **graphs become tables** of embeddings usable by any Chapter 3–5 method.",
      notes: "Perozzi et al. (2014) DeepWalk; Grover & Leskovec (2016) node2vec with return/in-out parameters p and q controlling BFS- versus DFS-like walks." });
    await d.process({ title: "Graph neural networks: message passing", steps: [
      { h: "Messages", t: "Each node receives its neighbours' features", icon: "FaEnvelope" },
      { h: "Aggregate", t: "Sum / mean / attention-weighted (GAT)", icon: "FaLayerGroup" },
      { h: "Update", t: "Neural layer combines own state + aggregate", icon: "FaSyncAlt" },
      { h: "Stack L layers", t: "Information from L-hop neighbourhood", icon: "FaClone" },
      { h: "Read-out", t: "Node, edge or whole-graph prediction", icon: "FaSignOutAlt" }],
      takeaway: "Popular layers: **GCN** (Kipf & Welling, 2017), **GraphSAGE** (sampling, inductive), **GAT** (attention). Libraries: PyTorch Geometric, DGL.",
      notes: "Too many layers cause over-smoothing: all node representations become similar. Spatio-temporal GNNs combine graph convolution over road networks with temporal models for traffic forecasting." });
    await d.cards({ title: "Graph learning in practice", cols: 4, items: [
      { h: "Fraud rings", t: "Accounts sharing devices, merchants, IPs", icon: "FaUserSecret" },
      { h: "Recommendation", t: "User–item bipartite graphs (PinSage, LightGCN)", icon: "FaThumbsUp" },
      { h: "Traffic forecasting", t: "Sensors as nodes on the road graph", icon: "FaTrafficLight" },
      { h: "Science", t: "Molecules, proteins, materials", icon: "FaAtom" }],
      notes: "Traffic forecasting on road graphs connects to our smart-mobility research line." });
    await d.code({ title: "Graph mining with NetworkX", codeW: 7.2, code:
`import networkx as nx
from networkx.algorithms.community import (
    louvain_communities, modularity)

G = nx.karate_club_graph()
pr  = nx.pagerank(G, alpha=0.85)
btw = nx.betweenness_centrality(G)
top = sorted(pr, key=pr.get, reverse=True)[:5]
print("Top PageRank:", top)

comms = louvain_communities(G, seed=0)
print(len(comms), "communities, Q =",
      round(modularity(G, comms), 3))`,
      bullets: ["Centralities in one line each", "Louvain communities + modularity", "Scale up: igraph, graph-tool, Spark GraphFrames", "GNNs: PyTorch Geometric"] });
    await d.lab({"num": "08", "file": "Lab08_Text_and_Graph_Mining.ipynb", "name": "Text & Graph Mining", "data": "English & Arabic course reviews; Zachary karate-club network", "steps": ["Build **TF-IDF** vectors and plot top words per class", "Classify sentiment with **Naïve Bayes** and **linear SVM**", "Discover **topics** by clustering documents", "Compute **degree, betweenness, closeness, PageRank**", "Detect **Louvain communities** and draw the network"]});
    await d.spotlight({ pubs: [
      { ...P.textANN, why: "**Text mining** of the ANN literature: keyword and topic trends that map the field's future directions." },
      { ...P.arabicSVM, why: "**Arabic sentiment analysis** of course reviews with TF-IDF features and SVM." },
      { ...P.hate, why: "Emotion mining of responses to **hateful content** on social media." },
      { ...P.designText, why: "Keyword **co-occurrence and trend** analysis across design-research journals — a text-and-graph study." }]});
    await d.summary(["Text mining = **normalise → tokenise → represent → mine**; Arabic needs special care",
      "Representations evolved from **TF-IDF** to **embeddings** and **transformers**",
      "Topic models (**LDA, BERTopic**) and classifiers turn text into insight",
      "Graph mining: **centrality, PageRank, communities, link prediction**",
      "**Node embeddings** and **GNNs** bring relational data into the learning toolbox"]);
    await d.quiz(["Why does a word that appears in every document get an IDF of zero?",
      "Name two Arabic-specific normalisation steps and why they matter.",
      "In a payment network, which centrality would you use to find accounts bridging two fraud rings?",
      "How is node2vec related to word2vec?"],
      { notes: "(1) idf = log(N/N) = 0 — it does not discriminate. (2) Unifying alef forms, removing diacritics/tatweel, taa marbuta normalisation — reduce sparsity from spelling variants. (3) Betweenness centrality. (4) Random walks are treated as sentences and fed to the skip-gram model." });
    await d.references([
      "Jurafsky, D., & Martin, J. H. (2025). *Speech and Language Processing* (3rd ed. draft).",
      "Mikolov, T., et al. (2013). Distributed representations of words and phrases. *NeurIPS*.",
      "Vaswani, A., et al. (2017). Attention is all you need. *NeurIPS*.",
      "Devlin, J., et al. (2019). BERT. *NAACL*. · Antoun, W., et al. (2020). AraBERT. *OSACT*.",
      "Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet allocation. *JMLR*, 3.",
      "Grootendorst, M. (2022). BERTopic. arXiv:2203.05794.",
      "Brin, S., & Page, L. (1998). The anatomy of a large-scale hypertextual web search engine. *WWW*.",
      "Blondel, V. D., et al. (2008). Fast unfolding of communities in large networks. *J. Stat. Mech.*",
      "Grover, A., & Leskovec, J. (2016). node2vec. *KDD*.",
      "Kipf, T. N., & Welling, M. (2017). Semi-supervised classification with graph convolutional networks. *ICLR*.",
      "Hamilton, W. L. (2020). *Graph Representation Learning*. Morgan & Claypool.",
      P.textANN.ref, P.arabicSVM.ref, P.hate.ref, P.designText.ref], { size: 11.5 });
    await d.closing({ next: "Chapter 9 — Association Rules & Sequential Patterns" });
  },
};
