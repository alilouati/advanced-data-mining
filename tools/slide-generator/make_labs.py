"""Generate the Colab-ready lab notebooks for Advanced Data Mining (Dr. Ali Louati)."""
import json, os

REPO = "alilouati/advanced-data-mining"
OUT = os.path.join(os.path.dirname(__file__), "repo", "labs")
os.makedirs(OUT, exist_ok=True)


def badge(fname):
    return (f"[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)]"
            f"(https://colab.research.google.com/github/{REPO}/blob/main/labs/{fname})")


def nb(fname, cells):
    out = []
    for kind, src in cells:
        src = src.strip("\n")
        lines = [l + "\n" for l in src.split("\n")]
        lines[-1] = lines[-1].rstrip("\n")
        if kind == "md":
            out.append({"cell_type": "markdown", "metadata": {}, "source": lines})
        else:
            out.append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": lines})
    doc = {"cells": out, "metadata": {"colab": {"provenance": []}, "kernelspec": {"name": "python3", "display_name": "Python 3"},
                                      "language_info": {"name": "python"}}, "nbformat": 4, "nbformat_minor": 5}
    with open(os.path.join(OUT, fname), "w") as f:
        json.dump(doc, f, indent=1, ensure_ascii=False)
    print("wrote", fname)


def header(fname, num, title, chapter, goals):
    g = "\n".join(f"- {x}" for x in goals)
    return ("md", f"""# Lab {num} · {title}
**Advanced Data Mining — M.Sc. Data Science** · Dr. Ali Louati · Prince Sattam Bin Abdulaziz University
Companion to **Chapter {chapter}**.

{badge(fname)}

**In this lab you will:**
{g}

> **How to use:** run the cells from top to bottom (`Shift + Enter`). Cells marked ✏️ are for you to modify.
> Every step works with the built-in data set; set `USE_MY_CSV = True` to try your own CSV file.""")


SETUP = ("code", """# Setup: libraries used in this lab (all pre-installed on Google Colab)
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid", palette="Set2")
plt.rcParams["figure.figsize"] = (8, 4.5)
np.random.seed(42)""")


def own_csv(default_note):
    return ("code", f"""# ✏️ Optional: use your own data set instead of the built-in one
USE_MY_CSV = False   # change to True, run the cell, then choose a .csv file

if USE_MY_CSV:
    from google.colab import files          # works on Google Colab
    uploaded = files.upload()
    df = pd.read_csv(next(iter(uploaded)))
    print("Loaded your file:", df.shape)
else:
    print("Using the built-in data set ({default_note}).")""")


# =====================================================================================
# LAB 2 — EDA & preprocessing
# =====================================================================================
f = "Lab02_EDA_and_Preprocessing.ipynb"
nb(f, [
    header(f, "02", "Exploratory Data Analysis & Preprocessing", 2, [
        "load a real data set and inspect its structure",
        "visualise distributions, outliers and correlations",
        "handle missing values, encode categories and scale features",
        "reduce dimensions with PCA and t-SNE"]),
    SETUP,
    ("md", "## 1 · Load the data\nWe use the **Titanic** passenger data (891 rows): survival, class, sex, age, fare … It contains missing values and mixed attribute types — ideal for practice."),
    ("code", """df = sns.load_dataset("titanic")
df.head()"""),
    own_csv("Titanic"),
    ("md", "## 2 · First look: size, types, summary statistics"),
    ("code", """print("Rows, columns:", df.shape)
df.info()"""),
    ("code", """# Numeric summary (mean, std, quartiles) and categorical summary (counts, top value)
display(df.describe().round(2))
display(df.describe(include="object"))"""),
    ("md", "## 3 · Missing values\nWhich columns have gaps, and how many?"),
    ("code", """missing = df.isna().mean().sort_values(ascending=False) * 100
missing = missing[missing > 0]
ax = missing.plot(kind="barh", color="tomato")
ax.set_xlabel("% missing"); ax.set_title("Missing values per column")
plt.show()"""),
    ("md", "## 4 · Distributions and outliers"),
    ("code", """num_cols = df.select_dtypes("number").columns.tolist()
print("Numeric columns:", num_cols)

fig, axes = plt.subplots(1, 2, figsize=(12, 4))
sns.histplot(df[num_cols[min(2, len(num_cols)-1)]].dropna(), kde=True, ax=axes[0])
sns.boxplot(x=df[num_cols[-1]], ax=axes[1], color="lightblue")
axes[0].set_title("Histogram"); axes[1].set_title("Boxplot (dots = potential outliers)")
plt.show()"""),
    ("code", """# The IQR rule: values below Q1 - 1.5*IQR or above Q3 + 1.5*IQR are potential outliers
col = num_cols[-1]                      # ✏️ choose another column
q1, q3 = df[col].quantile([0.25, 0.75])
iqr = q3 - q1
outliers = df[(df[col] < q1 - 1.5 * iqr) | (df[col] > q3 + 1.5 * iqr)]
print(f"{col}: Q1={q1:.2f}, Q3={q3:.2f}, IQR={iqr:.2f} -> {len(outliers)} potential outliers")"""),
    ("md", "## 5 · Categorical attributes and relationships"),
    ("code", """cat_cols = df.select_dtypes(exclude="number").columns.tolist()
print("Categorical columns:", cat_cols)
if "sex" in df and "survived" in df:
    sns.barplot(data=df, x="sex", y="survived", hue="class" if "class" in df else None)
    plt.title("Survival rate by sex and class"); plt.show()"""),
    ("code", """corr = df[num_cols].corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdBu_r", vmin=-1, vmax=1)
plt.title("Correlation matrix (numeric attributes)"); plt.show()"""),
    ("md", "## 6 · Cleaning: impute, encode, scale\nWe build the cleaned table step by step so that each operation is visible."),
    ("code", """clean = df.copy()

# 6.1 drop columns that are mostly empty or duplicate other columns
too_empty = [c for c in clean.columns if clean[c].isna().mean() > 0.5]
clean = clean.drop(columns=too_empty)
print("Dropped (more than 50% missing):", too_empty)

# 6.2 numeric -> median, categorical -> most frequent value
for c in clean.columns:
    if clean[c].dtype.kind in "biufc":
        clean[c] = clean[c].fillna(clean[c].median())
    else:
        clean[c] = clean[c].astype("object").fillna(clean[c].mode()[0])
print("Missing values left:", int(clean.isna().sum().sum()))"""),
    ("code", """# 6.3 one-hot encoding of categorical attributes
encoded = pd.get_dummies(clean, drop_first=True, dtype=int)
print("Shape after encoding:", encoded.shape)

# 6.4 z-score scaling of numeric attributes
from sklearn.preprocessing import StandardScaler
scaled = encoded.copy()
scaled[encoded.columns] = StandardScaler().fit_transform(encoded)
scaled.head()"""),
    ("md", "> ⚠️ **Leakage reminder:** in a real project you fit the imputer and scaler on the **training set only** (see Lab 03 pipelines)."),
    ("md", "## 7 · Dimensionality reduction: PCA vs. t-SNE\nWe project the 64-pixel **digits** data set to 2-D."),
    ("code", """from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

digits = load_digits()
X_pca = PCA(n_components=2).fit_transform(digits.data)
X_tsne = TSNE(n_components=2, random_state=0, init="pca").fit_transform(digits.data)

fig, axes = plt.subplots(1, 2, figsize=(13, 5))
for ax, X2, name in [(axes[0], X_pca, "PCA (linear)"), (axes[1], X_tsne, "t-SNE (non-linear)")]:
    sc = ax.scatter(X2[:, 0], X2[:, 1], c=digits.target, cmap="tab10", s=8)
    ax.set_title(name)
fig.colorbar(sc, ax=axes, label="digit")
plt.show()"""),
    ("code", """# How much variance does each principal component explain?
pca = PCA().fit(StandardScaler().fit_transform(digits.data))
plt.plot(np.cumsum(pca.explained_variance_ratio_), marker=".")
plt.axhline(0.95, ls="--", color="red")
plt.xlabel("number of components"); plt.ylabel("cumulative explained variance")
plt.title("Components needed for 95% of the variance"); plt.show()"""),
    ("md", """## ✏️ Exercises
1. Which column has the most missing values? Propose a better imputation than the median (hint: group by `pclass` or `sex`).
2. Use the IQR rule on `age`. Are the outliers errors or real passengers?
3. Replace `StandardScaler` with `MinMaxScaler` and `RobustScaler`; compare histograms of `fare`.
4. Load a CSV of your own (`USE_MY_CSV = True`) and repeat sections 2–6."""),
])

# =====================================================================================
# LAB 3 — Classification & evaluation
# =====================================================================================
f = "Lab03_Classification_and_Evaluation.ipynb"
nb(f, [
    header(f, "03", "Classification & Rigorous Evaluation", 3, [
        "train k-NN, Naïve Bayes, logistic regression and SVM classifiers",
        "compare them with stratified cross-validation",
        "read confusion matrices, ROC and precision–recall curves",
        "visualise decision boundaries and tune k"]),
    SETUP,
    ("md", "## 1 · Data: breast-cancer diagnosis\n569 tumours, 30 numeric features, target = malignant (0) or benign (1)."),
    ("code", """from sklearn.datasets import load_breast_cancer
data = load_breast_cancer(as_frame=True)
df = data.frame
TARGET = "target"
print(df.shape); df[TARGET].value_counts()"""),
    own_csv("breast cancer"),
    ("code", """# ✏️ If you loaded your own CSV, set TARGET to the name of your label column
X = df.drop(columns=[TARGET]).select_dtypes("number")
y = df[TARGET]
sns.countplot(x=y); plt.title("Class distribution"); plt.show()"""),
    ("md", "## 2 · Train / test split (stratified)"),
    ("code", """from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42)
print("train:", X_train.shape, " test:", X_test.shape)"""),
    ("md", "## 3 · Four classifiers inside pipelines\nScaling is part of each pipeline, so it is fitted on training data only (no leakage)."),
    ("code", """from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC

models = {
    "k-NN (k=5)":   make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5)),
    "Naive Bayes":  make_pipeline(StandardScaler(), GaussianNB()),
    "Logistic reg": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "SVM (RBF)":    make_pipeline(StandardScaler(), SVC(probability=True)),
}"""),
    ("md", "## 4 · Compare with 10-fold stratified cross-validation"),
    ("code", """from sklearn.model_selection import StratifiedKFold, cross_validate
cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)

rows = []
for name, model in models.items():
    res = cross_validate(model, X_train, y_train, cv=cv, scoring=["accuracy", "f1", "roc_auc"])
    rows.append({"model": name,
                 "accuracy": res["test_accuracy"].mean(),
                 "F1": res["test_f1"].mean(),
                 "ROC-AUC": res["test_roc_auc"].mean(),
                 "F1 std": res["test_f1"].std()})
results = pd.DataFrame(rows).set_index("model").round(3)
display(results)
results[["accuracy", "F1", "ROC-AUC"]].plot(kind="bar", ylim=(0.85, 1.0), rot=0)
plt.title("10-fold CV scores"); plt.show()"""),
    ("md", "## 5 · Final evaluation on the test set"),
    ("code", """from sklearn.metrics import ConfusionMatrixDisplay, classification_report

best = models["Logistic reg"]          # ✏️ try another model
best.fit(X_train, y_train)
y_pred = best.predict(X_test)
print(classification_report(y_test, y_pred, digits=3))
ConfusionMatrixDisplay.from_predictions(y_test, y_pred, cmap="Blues")
plt.title("Confusion matrix"); plt.show()"""),
    ("code", """from sklearn.metrics import RocCurveDisplay, PrecisionRecallDisplay
fig, axes = plt.subplots(1, 2, figsize=(13, 5))
for name, model in models.items():
    model.fit(X_train, y_train)
    RocCurveDisplay.from_estimator(model, X_test, y_test, name=name, ax=axes[0])
    PrecisionRecallDisplay.from_estimator(model, X_test, y_test, name=name, ax=axes[1])
axes[0].plot([0, 1], [0, 1], "k--"); axes[0].set_title("ROC curves")
axes[1].set_title("Precision-Recall curves"); plt.show()"""),
    ("md", "## 6 · Visualising decision boundaries (2 features)"),
    ("code", """from sklearn.inspection import DecisionBoundaryDisplay
two = X.columns[:2]                     # ✏️ pick two other features
X2 = X_train[two]
fig, axes = plt.subplots(1, 4, figsize=(18, 4))
for ax, (name, model) in zip(axes, models.items()):
    model.fit(X2, y_train)
    DecisionBoundaryDisplay.from_estimator(model, X2, ax=ax, alpha=0.4, cmap="coolwarm", response_method="predict")
    ax.scatter(X2.iloc[:, 0], X2.iloc[:, 1], c=y_train, cmap="coolwarm", s=10, edgecolor="k", linewidth=0.2)
    ax.set_title(name); ax.set_xlabel(two[0]); ax.set_ylabel(two[1])
plt.tight_layout(); plt.show()"""),
    ("md", "## 7 · Choosing k for k-NN (validation curve)"),
    ("code", """from sklearn.model_selection import cross_val_score
ks = range(1, 31, 2)
scores = [cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier(k)),
                          X_train, y_train, cv=cv).mean() for k in ks]
plt.plot(list(ks), scores, marker="o")
plt.xlabel("k"); plt.ylabel("CV accuracy"); plt.title("k-NN: accuracy vs. k"); plt.show()
print("best k =", list(ks)[int(np.argmax(scores))])"""),
    ("md", """## ✏️ Exercises
1. Which model has the best F1? Is the difference larger than the standard deviation?
2. Remove `StandardScaler` from the k-NN pipeline. What happens and why?
3. Change the decision threshold of logistic regression to 0.3 (`predict_proba`) and recompute recall.
4. Run the notebook on your own labelled CSV."""),
])

# =====================================================================================
# LAB 4 — Trees & ensembles
# =====================================================================================
f = "Lab04_Decision_Trees_and_Ensembles.ipynb"
nb(f, [
    header(f, "04", "Decision Trees, Rules & Ensembles", 4, [
        "compute entropy and information gain by hand (Play Tennis)",
        "train, plot and prune a decision tree and read its rules",
        "compare a single tree with random forests and gradient boosting",
        "explain models with feature and permutation importance"]),
    SETUP,
    ("md", "## 1 · Information gain by hand — the Play Tennis data"),
    ("code", """tennis = pd.DataFrame({
    "Outlook":  ["Sunny","Sunny","Overcast","Rain","Rain","Rain","Overcast","Sunny","Sunny","Rain","Sunny","Overcast","Overcast","Rain"],
    "Temp":     ["Hot","Hot","Hot","Mild","Cool","Cool","Cool","Mild","Cool","Mild","Mild","Mild","Hot","Mild"],
    "Humidity": ["High","High","High","High","Normal","Normal","Normal","High","Normal","Normal","Normal","High","Normal","High"],
    "Wind":     ["Weak","Strong","Weak","Weak","Weak","Strong","Strong","Weak","Weak","Weak","Strong","Strong","Weak","Strong"],
    "Play":     ["No","No","Yes","Yes","Yes","No","Yes","No","Yes","Yes","Yes","Yes","Yes","No"]})
tennis"""),
    ("code", """def entropy(labels):
    p = labels.value_counts(normalize=True)
    return -(p * np.log2(p)).sum()

def information_gain(data, attribute, target="Play"):
    total = entropy(data[target])
    weighted = sum(len(part) / len(data) * entropy(part[target])
                   for _, part in data.groupby(attribute))
    return total - weighted

print(f"H(Play) = {entropy(tennis['Play']):.3f} bits")
gains = {a: information_gain(tennis, a) for a in ["Outlook", "Temp", "Humidity", "Wind"]}
pd.Series(gains).sort_values().plot(kind="barh", color="teal")
plt.title("Information gain of each attribute (root choice)"); plt.show()
gains"""),
    ("md", "## 2 · A decision tree on a real data set"),
    ("code", """from sklearn.datasets import load_wine
data = load_wine(as_frame=True)
df = data.frame
TARGET = "target"
print(df.shape); df.head()"""),
    own_csv("wine"),
    ("code", """from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree, export_text

X = df.drop(columns=[TARGET]).select_dtypes("number"); y = df[TARGET]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)

tree = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_train, y_train)
print("test accuracy:", round(tree.score(X_test, y_test), 3))
plt.figure(figsize=(16, 7))
plot_tree(tree, feature_names=X.columns, class_names=[str(c) for c in sorted(y.unique())],
          filled=True, rounded=True, fontsize=9)
plt.show()"""),
    ("code", """# Every root-to-leaf path is an IF-THEN rule
print(export_text(tree, feature_names=list(X.columns)))"""),
    ("md", "## 3 · Over-fitting: accuracy vs. depth"),
    ("code", """depths = range(1, 16)
train_acc, test_acc = [], []
for d in depths:
    m = DecisionTreeClassifier(max_depth=d, random_state=0).fit(X_train, y_train)
    train_acc.append(m.score(X_train, y_train)); test_acc.append(m.score(X_test, y_test))
plt.plot(depths, train_acc, "o-", label="train"); plt.plot(depths, test_acc, "o-", label="test")
plt.xlabel("max_depth"); plt.ylabel("accuracy"); plt.legend(); plt.title("Deeper is not always better"); plt.show()"""),
    ("md", "## 4 · Ensembles: random forest and gradient boosting"),
    ("code", """from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold

cv = StratifiedKFold(5, shuffle=True, random_state=0)
models = {
    "Decision tree":     DecisionTreeClassifier(random_state=0),
    "Random forest":     RandomForestClassifier(n_estimators=300, random_state=0),
    "Gradient boosting": HistGradientBoostingClassifier(random_state=0),
}
scores = {name: cross_val_score(m, X, y, cv=cv) for name, m in models.items()}
pd.DataFrame(scores).plot(kind="box"); plt.ylabel("CV accuracy"); plt.title("Single tree vs. ensembles"); plt.show()
pd.DataFrame(scores).agg(["mean", "std"]).round(3)"""),
    ("md", "## 5 · Which features matter?"),
    ("code", """from sklearn.inspection import permutation_importance
rf = RandomForestClassifier(n_estimators=300, random_state=0).fit(X_train, y_train)

imp = pd.Series(rf.feature_importances_, index=X.columns).sort_values()
perm = permutation_importance(rf, X_test, y_test, n_repeats=20, random_state=0)
perm_s = pd.Series(perm.importances_mean, index=X.columns).sort_values()

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
imp.tail(10).plot(kind="barh", ax=axes[0], color="teal", title="Impurity importance (built-in)")
perm_s.tail(10).plot(kind="barh", ax=axes[1], color="orange", title="Permutation importance (test set)")
plt.tight_layout(); plt.show()"""),
    ("md", """> 💡 For SHAP explanations run `!pip install shap` and then `shap.TreeExplainer(rf)`.

## ✏️ Exercises
1. Verify by hand that Gain(Humidity) = 0.151.
2. Use `criterion="entropy"` vs. `"gini"` — does the tree change?
3. Prune with `ccp_alpha` (try 0.01, 0.02 …) and plot test accuracy.
4. Which ensemble is best on your own CSV?"""),
])

# =====================================================================================
# LAB 5 — Clustering
# =====================================================================================
f = "Lab05_Clustering.ipynb"
nb(f, [
    header(f, "05", "Clustering", 5, [
        "scale data and run k-means",
        "choose k with the elbow method and silhouette scores",
        "build a dendrogram (hierarchical clustering)",
        "compare k-means, DBSCAN and Gaussian mixtures on different shapes"]),
    SETUP,
    ("md", "## 1 · Data: iris flowers (we hide the species labels)"),
    ("code", """from sklearn.datasets import load_iris
iris = load_iris(as_frame=True)
df = iris.frame.drop(columns="target")
true_labels = iris.target            # used only at the end to evaluate
df.head()"""),
    own_csv("iris"),
    ("code", """from sklearn.preprocessing import StandardScaler
X = StandardScaler().fit_transform(df.select_dtypes("number"))
sns.pairplot(df.select_dtypes("number").iloc[:, :4], corner=True, plot_kws={"s": 12}); plt.show()"""),
    ("md", "## 2 · How many clusters? Elbow and silhouette"),
    ("code", """from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

ks = range(2, 11)
sse, sil = [], []
for k in ks:
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    sse.append(km.inertia_); sil.append(silhouette_score(X, km.labels_))

fig, axes = plt.subplots(1, 2, figsize=(13, 4))
axes[0].plot(list(ks), sse, "o-"); axes[0].set_title("Elbow method (SSE)"); axes[0].set_xlabel("k")
axes[1].bar(list(ks), sil, color="teal"); axes[1].set_title("Mean silhouette"); axes[1].set_xlabel("k")
plt.show()"""),
    ("md", "## 3 · k-means result, shown in 2-D with PCA"),
    ("code", """from sklearn.decomposition import PCA
K = 3                                   # ✏️ choose k from the plots above
km = KMeans(n_clusters=K, n_init=10, random_state=0).fit(X)
X2 = PCA(2).fit_transform(X)
centers2 = PCA(2).fit(X).transform(km.cluster_centers_)

plt.scatter(X2[:, 0], X2[:, 1], c=km.labels_, cmap="Set2", s=25)
plt.scatter(centers2[:, 0], centers2[:, 1], c="red", marker="X", s=200, label="centroids")
plt.title(f"k-means with k={K}"); plt.legend(); plt.show()"""),
    ("code", """# Profile the clusters: average value of each attribute per cluster
profile = df.select_dtypes("number").assign(cluster=km.labels_).groupby("cluster").mean().round(2)
sns.heatmap(profile, annot=True, cmap="YlGnBu"); plt.title("Cluster profiles"); plt.show()"""),
    ("md", "## 4 · Hierarchical clustering and the dendrogram"),
    ("code", """from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
Z = linkage(X, method="ward")            # ✏️ try "single", "complete", "average"
plt.figure(figsize=(12, 4))
dendrogram(Z, truncate_mode="lastp", p=30)
plt.title("Dendrogram (Ward linkage)"); plt.ylabel("merge distance"); plt.show()
hier_labels = fcluster(Z, t=3, criterion="maxclust")"""),
    ("md", "## 5 · Shapes matter: k-means vs. DBSCAN vs. Gaussian mixture"),
    ("code", """from sklearn.datasets import make_moons, make_blobs
from sklearn.cluster import DBSCAN
from sklearn.mixture import GaussianMixture

moons, _ = make_moons(400, noise=0.06, random_state=0)
blobs = make_blobs(400, centers=3, cluster_std=[1.0, 2.5, 0.5], random_state=170)[0]

fig, axes = plt.subplots(2, 3, figsize=(15, 8))
for row, data in enumerate([moons, StandardScaler().fit_transform(blobs)]):
    algos = {"k-means": KMeans(n_clusters=2 if row == 0 else 3, n_init=10, random_state=0),
             "DBSCAN": DBSCAN(eps=0.2 if row == 0 else 0.3, min_samples=5),
             "Gaussian mixture": GaussianMixture(n_components=2 if row == 0 else 3, random_state=0)}
    for col, (name, algo) in enumerate(algos.items()):
        labels = algo.fit_predict(data)
        axes[row, col].scatter(data[:, 0], data[:, 1], c=labels, cmap="Set2", s=10)
        axes[row, col].set_title(name)
plt.tight_layout(); plt.show()"""),
    ("md", "## 6 · Evaluate against the hidden labels (external validation)"),
    ("code", """from sklearn.metrics import adjusted_rand_score
if not USE_MY_CSV:
    print("ARI k-means      :", round(adjusted_rand_score(true_labels, km.labels_), 3))
    print("ARI hierarchical :", round(adjusted_rand_score(true_labels, hier_labels), 3))
    print("ARI GMM          :", round(adjusted_rand_score(true_labels, GaussianMixture(3, random_state=0).fit_predict(X)), 3))"""),
    ("md", """## ✏️ Exercises
1. Run k-means **without** scaling. How do the clusters change?
2. Compare single, complete and average linkage dendrograms.
3. For DBSCAN on the moons, find an `eps` that produces noise points (label −1).
4. Cluster your own CSV and describe each cluster in one sentence."""),
])

# =====================================================================================
# LAB 6 — Anomalies & time series
# =====================================================================================
f = "Lab06_Anomaly_Detection_and_Time_Series.ipynb"
nb(f, [
    header(f, "06", "Anomaly Detection & Time-Series Mining", 6, [
        "detect outliers with the IQR rule, Isolation Forest and LOF",
        "decompose a time series into trend, seasonality and residual",
        "forecast with lag features and validate with TimeSeriesSplit",
        "beat (or not!) the seasonal-naïve baseline"]),
    SETUP,
    ("md", "## Part A · Anomaly detection\n### 1 · A data set with planted anomalies"),
    ("code", """from sklearn.datasets import make_blobs
X_normal, _ = make_blobs(n_samples=400, centers=[[0, 0], [4, 4]], cluster_std=[0.8, 0.5], random_state=1)
X_anom = np.random.uniform(-4, 8, size=(20, 2))
X = np.vstack([X_normal, X_anom])
is_anomaly = np.r_[np.zeros(400), np.ones(20)]
plt.scatter(X[:, 0], X[:, 1], c=is_anomaly, cmap="coolwarm", s=15)
plt.title("Red = planted anomalies"); plt.show()"""),
    ("md", "### 2 · Isolation Forest and Local Outlier Factor"),
    ("code", """from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.metrics import average_precision_score

iso = IsolationForest(n_estimators=300, contamination=0.05, random_state=0).fit(X)
lof = LocalOutlierFactor(n_neighbors=20, contamination=0.05)

pred_iso = iso.predict(X)                # -1 = anomaly
pred_lof = lof.fit_predict(X)
score_iso = -iso.score_samples(X)        # higher = more anomalous
score_lof = -lof.negative_outlier_factor_

fig, axes = plt.subplots(1, 2, figsize=(13, 5))
for ax, pred, name in [(axes[0], pred_iso, "Isolation Forest"), (axes[1], pred_lof, "LOF")]:
    ax.scatter(X[:, 0], X[:, 1], c=(pred == -1), cmap="coolwarm", s=15); ax.set_title(name + " (red = flagged)")
plt.show()
print("PR-AUC Isolation Forest:", round(average_precision_score(is_anomaly, score_iso), 3))
print("PR-AUC LOF             :", round(average_precision_score(is_anomaly, score_lof), 3))"""),
    ("md", "## Part B · Time-series mining\n### 3 · Monthly airline passengers (1949–1960)"),
    ("code", """flights = sns.load_dataset("flights")
flights["date"] = pd.to_datetime(flights["year"].astype(str) + "-" + flights["month"].astype(str), format="%Y-%b")
ts = flights.set_index("date")["passengers"]
ts.plot(title="Monthly airline passengers"); plt.ylabel("passengers (thousands)"); plt.show()"""),
    ("md", "### 4 · Decomposition: trend + seasonality + residual (multiplicative → use log)"),
    ("code", """log_ts = np.log(ts)
trend = log_ts.rolling(12, center=True).mean()                    # 12-month moving average
detrended = log_ts - trend
seasonal = detrended.groupby(detrended.index.month).transform("mean")
residual = log_ts - trend - seasonal

fig, axes = plt.subplots(4, 1, figsize=(10, 8), sharex=True)
for ax, s, name in zip(axes, [log_ts, trend, seasonal, residual], ["log(observed)", "trend", "seasonal", "residual"]):
    s.plot(ax=ax); ax.set_ylabel(name)
plt.tight_layout(); plt.show()"""),
    ("code", """# Anomalies in a time series = unusually large residuals (|z| > 2.5)
z = (residual - residual.mean()) / residual.std()
odd = z[abs(z) > 2.5]
ax = ts.plot(); ax.scatter(odd.index, ts[odd.index], color="red", zorder=3, label="unusual month")
ax.legend(); ax.set_title("Residual-based anomaly detection"); plt.show()"""),
    ("md", "### 5 · Forecasting with lag features + rolling-origin validation"),
    ("code", """data = pd.DataFrame({"y": log_ts})
for lag in [1, 2, 3, 12]:
    data[f"lag_{lag}"] = data["y"].shift(lag)
data["month"] = data.index.month
data = data.dropna()
X_ts, y_ts = data.drop(columns="y"), data["y"]
X_ts.head()"""),
    ("code", """from sklearn.model_selection import TimeSeriesSplit
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

tscv = TimeSeriesSplit(n_splits=4, test_size=12)
rows = []
for fold, (tr, te) in enumerate(tscv.split(X_ts)):
    model = LinearRegression().fit(X_ts.iloc[tr], y_ts.iloc[tr])
    pred = np.exp(model.predict(X_ts.iloc[te]))
    actual = np.exp(y_ts.iloc[te])
    naive = np.exp(X_ts["lag_12"].iloc[te])                       # seasonal naive: same month last year
    rows.append({"fold": fold + 1, "MAE model": mean_absolute_error(actual, pred),
                 "MAE seasonal naive": mean_absolute_error(actual, naive)})
pd.DataFrame(rows).round(1)"""),
    ("code", """# Plot the last fold
plt.plot(actual.index, actual, "k.-", label="actual")
plt.plot(actual.index, pred, "o-", label="lag-feature model")
plt.plot(actual.index, naive, "s--", label="seasonal naive")
plt.legend(); plt.title("Forecast for the last 12 months"); plt.show()"""),
    ("md", """## ✏️ Exercises
1. Change `contamination` and `n_neighbors`. How do PR-AUC values move?
2. Replace `LinearRegression` with `HistGradientBoostingRegressor`. Better or worse than the naïve baseline?
3. Remove the `lag_12` feature. What happens to the forecast and why?
4. Load your own monthly series (two columns: date, value) and repeat Part B."""),
])

# =====================================================================================
# LAB 8 — Text & graph mining
# =====================================================================================
f = "Lab08_Text_and_Graph_Mining.ipynb"
nb(f, [
    header(f, "08", "Text & Graph Mining", 8, [
        "turn text into TF-IDF vectors and inspect important words",
        "classify sentiment with Naïve Bayes and a linear SVM",
        "discover topics by clustering documents",
        "compute centralities, PageRank and communities in a social network"]),
    SETUP,
    ("md", "## Part A · Text mining\n### 1 · A small corpus of course reviews (English & Arabic)"),
    ("code", """reviews = [
    ("The lectures were clear and the labs were very useful", "pos"),
    ("Excellent course, I learned clustering and classification", "pos"),
    ("The instructor explains difficult concepts with great examples", "pos"),
    ("Very practical labs with real data sets", "pos"),
    ("I enjoyed the projects and the Python notebooks", "pos"),
    ("Great slides and helpful feedback on assignments", "pos"),
    ("The course was well organised and interesting", "pos"),
    ("Useful content for my career in data science", "pos"),
    ("Clear explanations of decision trees and ensembles", "pos"),
    ("I liked the research examples from Saudi Arabia", "pos"),
    ("المحاضرات واضحة والمعامل مفيدة جدا", "pos"),
    ("مقرر ممتاز وتعلمت الكثير", "pos"),
    ("الدكتور يشرح بطريقة رائعة", "pos"),
    ("The lectures were too fast and confusing", "neg"),
    ("Too much theory and not enough practice", "neg"),
    ("The exam was very difficult and unfair", "neg"),
    ("I did not understand the association rules chapter", "neg"),
    ("The labs were boring and the data was messy", "neg"),
    ("Assignments took too much time", "neg"),
    ("Poor organisation and late feedback", "neg"),
    ("The slides had too much text", "neg"),
    ("I was lost during the clustering lectures", "neg"),
    ("The workload was heavy and stressful", "neg"),
    ("المحاضرات سريعة وغير واضحة", "neg"),
    ("الاختبار صعب جدا", "neg"),
    ("الواجبات كثيرة ومرهقة", "neg"),
]
text_df = pd.DataFrame(reviews, columns=["text", "label"])
text_df.sample(5, random_state=1)"""),
    ("md", "### 2 · TF-IDF representation"),
    ("code", """from sklearn.feature_extraction.text import TfidfVectorizer
vec = TfidfVectorizer(stop_words="english")
T = vec.fit_transform(text_df["text"])
print("documents x terms:", T.shape)

# Top words per class (mean TF-IDF weight)
weights = pd.DataFrame(T.toarray(), columns=vec.get_feature_names_out())
top = weights.groupby(text_df["label"]).mean().T
fig, axes = plt.subplots(1, 2, figsize=(13, 4))
for ax, lab, col in zip(axes, ["pos", "neg"], ["seagreen", "tomato"]):
    top[lab].nlargest(10).sort_values().plot(kind="barh", ax=ax, color=col, title=f"Top words: {lab}")
plt.tight_layout(); plt.show()"""),
    ("md", "### 3 · Sentiment classification"),
    ("code", """from sklearn.pipeline import make_pipeline
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.model_selection import cross_val_score, StratifiedKFold

cv = StratifiedKFold(5, shuffle=True, random_state=0)
for name, clf in [("Naive Bayes", MultinomialNB()), ("Linear SVM", LinearSVC())]:
    pipe = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), clf)
    print(f"{name:12s} CV accuracy = {cross_val_score(pipe, text_df['text'], text_df['label'], cv=cv).mean():.2f}")

svm = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LinearSVC()).fit(text_df["text"], text_df["label"])
new = ["The labs were really useful", "The exam was confusing", "المعامل مفيدة"]   # ✏️ write your own
print(dict(zip(new, svm.predict(new))))"""),
    ("md", "### 4 · Topic discovery by clustering the documents"),
    ("code", """from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(T)
terms = vec.get_feature_names_out()
for c in range(3):
    centre = km.cluster_centers_[c]
    print(f"Topic {c}:", ", ".join(terms[i] for i in centre.argsort()[::-1][:6]))"""),
    ("md", "## Part B · Graph mining\n### 5 · Zachary's karate club network"),
    ("code", """import networkx as nx
G = nx.karate_club_graph()
print(G.number_of_nodes(), "members,", G.number_of_edges(), "friendships")
degrees = [d for _, d in G.degree()]
plt.hist(degrees, bins=range(1, max(degrees) + 2), color="teal", edgecolor="white")
plt.xlabel("degree"); plt.ylabel("number of members"); plt.title("Degree distribution"); plt.show()"""),
    ("code", """cent = pd.DataFrame({
    "degree": nx.degree_centrality(G),
    "betweenness": nx.betweenness_centrality(G),
    "closeness": nx.closeness_centrality(G),
    "pagerank": nx.pagerank(G, alpha=0.85)}).round(3)
cent.sort_values("pagerank", ascending=False).head(8)"""),
    ("code", """from networkx.algorithms.community import louvain_communities, modularity
communities = louvain_communities(G, seed=0)
colour = {n: i for i, c in enumerate(communities) for n in c}
pos = nx.spring_layout(G, seed=3)
pr = nx.pagerank(G)
plt.figure(figsize=(8, 6))
nx.draw_networkx(G, pos, node_color=[colour[n] for n in G], cmap="Set2",
                 node_size=[4000 * pr[n] for n in G], with_labels=True, font_size=8, edge_color="#bbbbbb")
plt.title(f"{len(communities)} Louvain communities, modularity = {modularity(G, communities):.2f}  (size = PageRank)")
plt.axis("off"); plt.show()"""),
    ("md", """## ✏️ Exercises
1. Add 10 new reviews of your own and retrain. Does accuracy change?
2. Use `TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))` — useful for Arabic morphology.
3. Which member has the highest betweenness? Why might that person be a 'broker'?
4. Compare the Louvain communities with the real split stored in `G.nodes[n]["club"]`."""),
])

# =====================================================================================
# LAB 9 — Association rules
# =====================================================================================
f = "Lab09_Association_Rules.ipynb"
nb(f, [
    header(f, "09", "Association Rules & Frequent Itemsets", 9, [
        "count itemset supports by hand",
        "mine frequent itemsets with Apriori and FP-Growth",
        "generate rules and rank them by confidence and lift",
        "visualise rules as a scatter plot, heatmap and network"]),
    ("code", """# mlxtend provides Apriori / FP-Growth (pre-installed on Colab; this line installs it elsewhere)
!pip install -q mlxtend"""),
    SETUP,
    ("md", "## 1 · Shopping baskets"),
    ("code", """baskets = [
    ["bread", "milk", "dates"], ["bread", "coffee", "dates"], ["milk", "coffee", "cardamom", "dates"],
    ["bread", "milk", "eggs"], ["bread", "milk", "dates", "eggs"], ["coffee", "cardamom", "dates"],
    ["bread", "eggs", "cheese"], ["milk", "cheese", "bread"], ["coffee", "cardamom"],
    ["bread", "milk", "cheese", "eggs"], ["dates", "coffee", "milk"], ["bread", "dates"],
    ["coffee", "cardamom", "dates", "milk"], ["eggs", "cheese"], ["bread", "milk", "dates", "coffee"],
    ["cardamom", "coffee", "bread"], ["milk", "eggs"], ["bread", "cheese", "dates"],
    ["coffee", "dates", "cardamom"], ["bread", "milk"],
]
print(len(baskets), "transactions")"""),
    ("code", """# ✏️ Optional: your own transactions — a CSV with one row per (transaction_id, item)
USE_MY_CSV = False
if USE_MY_CSV:
    from google.colab import files
    up = files.upload()
    raw = pd.read_csv(next(iter(up)))
    baskets = raw.groupby(raw.columns[0])[raw.columns[1]].apply(list).tolist()
    print(len(baskets), "transactions loaded")"""),
    ("md", "## 2 · Support by hand"),
    ("code", """from itertools import combinations
from collections import Counter

n = len(baskets)
item_counts = Counter(item for b in baskets for item in set(b))
pair_counts = Counter(pair for b in baskets for pair in combinations(sorted(set(b)), 2))

support_items = pd.Series({k: v / n for k, v in item_counts.items()}).sort_values()
support_items.plot(kind="barh", color="teal"); plt.axvline(0.3, ls="--", color="red")
plt.title("Item support (red line = minsup 0.3)"); plt.show()
pd.Series({f"{a} & {b}": v / n for (a, b), v in pair_counts.most_common(8)}, name="support")"""),
    ("code", """def confidence(X, Y):
    \"\"\"conf(X -> Y) = support(X and Y) / support(X)\"\"\"
    both = sum(1 for b in baskets if X in b and Y in b)
    return both / sum(1 for b in baskets if X in b)

def lift(X, Y):
    return confidence(X, Y) / (sum(1 for b in baskets if Y in b) / n)

print(f"coffee -> cardamom : conf = {confidence('coffee', 'cardamom'):.2f}, lift = {lift('coffee', 'cardamom'):.2f}")
print(f"bread  -> milk     : conf = {confidence('bread', 'milk'):.2f}, lift = {lift('bread', 'milk'):.2f}")"""),
    ("md", "## 3 · Apriori and FP-Growth with mlxtend"),
    ("code", """from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, fpgrowth, association_rules

te = TransactionEncoder()
onehot = pd.DataFrame(te.fit(baskets).transform(baskets), columns=te.columns_)
display(onehot.head())

MIN_SUPPORT = 0.15                                   # ✏️ try 0.1, 0.2 …
freq = fpgrowth(onehot, min_support=MIN_SUPPORT, use_colnames=True)
freq["size"] = freq["itemsets"].apply(len)
print(len(freq), "frequent itemsets")
freq.sort_values("support", ascending=False).head(10)"""),
    ("code", """# Apriori gives exactly the same itemsets (it is just slower on big data)
same = set(map(frozenset, apriori(onehot, min_support=MIN_SUPPORT, use_colnames=True)["itemsets"])) == set(map(frozenset, freq["itemsets"]))
print("Apriori == FP-Growth:", same)"""),
    ("md", "## 4 · Association rules ranked by lift"),
    ("code", """MIN_CONF = 0.6                                       # ✏️ minimum confidence
try:    # newer mlxtend versions ask for the number of transactions
    rules = association_rules(freq, num_itemsets=len(onehot), metric="confidence", min_threshold=MIN_CONF)
except TypeError:
    rules = association_rules(freq, metric="confidence", min_threshold=MIN_CONF)
rules = rules.sort_values("lift", ascending=False)
rules["rule"] = rules["antecedents"].apply(lambda s: ", ".join(s)) + "  ->  " + rules["consequents"].apply(lambda s: ", ".join(s))
rules[["rule", "support", "confidence", "lift"]].round(2).head(10)"""),
    ("code", """sc = plt.scatter(rules["support"], rules["confidence"], c=rules["lift"], s=200 * rules["lift"], cmap="viridis", edgecolor="k")
plt.colorbar(sc, label="lift"); plt.xlabel("support"); plt.ylabel("confidence")
plt.title("Rules: support vs. confidence (colour & size = lift)"); plt.show()"""),
    ("code", """import networkx as nx
G = nx.DiGraph()
for _, r in rules.head(12).iterrows():
    for a in r["antecedents"]:
        for c in r["consequents"]:
            G.add_edge(a, c, weight=r["lift"])
pos = nx.circular_layout(G)
nx.draw_networkx(G, pos, node_color="lightblue", node_size=1800, font_size=9,
                 width=[1.5 * G[u][v]["weight"] for u, v in G.edges()], edge_color="gray", arrowsize=15)
plt.title("Top rules as a network (thicker = higher lift)"); plt.axis("off"); plt.show()"""),
    ("md", """## ✏️ Exercises
1. Lower `MIN_SUPPORT` to 0.1. How many itemsets and rules appear now?
2. Find a rule with high confidence but lift < 1. Why is it misleading?
3. Add a new item (e.g. `"tea"`) to several baskets and observe the rules.
4. Run the lab on your own transaction CSV."""),
])
