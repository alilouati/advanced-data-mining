"""Figure generator for the Advanced Data Mining course (Dr. Ali Louati).
All figures share one palette and style so the decks read as one system."""
import os, sys, warnings
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, FancyBboxPatch, Rectangle, Circle, FancyArrowPatch
import networkx as nx
from sklearn import datasets
warnings.filterwarnings("ignore")

OUT = os.path.join(os.path.dirname(__file__), "figs")
os.makedirs(OUT, exist_ok=True)

INK, TEAL, TEAL2, AMBER, CORAL, SLATE, PLUM, GREEN, LIGHT = (
    "#0F2A3D", "#0E7C7B", "#5BC0BE", "#F2A541", "#E4572E", "#5B6B7A", "#6C5B9E", "#3E9C5A", "#EEF4F5")
CAT = [TEAL, AMBER, CORAL, PLUM, GREEN, SLATE, "#2F6690", "#B5838D"]

plt.rcParams.update({
    "font.family": "Carlito", "font.size": 13, "axes.edgecolor": "#9AA7B2",
    "axes.labelcolor": INK, "xtick.color": SLATE, "ytick.color": SLATE,
    "axes.spines.top": False, "axes.spines.right": False, "axes.titleweight": "bold",
    "axes.titlesize": 14, "axes.titlecolor": INK, "legend.frameon": False,
    "figure.dpi": 100, "savefig.dpi": 200, "savefig.bbox": "tight", "savefig.pad_inches": 0.08,
})
rng = np.random.default_rng(7)


def save(fig, name):
    fig.savefig(os.path.join(OUT, name + ".png"), facecolor="white")
    plt.close(fig)


def clean(ax):
    ax.set_xticks([]); ax.set_yticks([])
    for s in ax.spines.values():
        s.set_visible(False)


# ---------------------------------------------------------------- Chapter 1
def ch1():
    # four core tasks
    fig, axs = plt.subplots(1, 4, figsize=(13, 3.4))
    X, y = datasets.make_moons(200, noise=0.22, random_state=1)
    from sklearn.svm import SVC
    m = SVC(gamma=2).fit(X, y)
    xx, yy = np.meshgrid(np.linspace(-1.6, 2.6, 200), np.linspace(-1.2, 1.7, 200))
    Z = m.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    axs[0].contourf(xx, yy, Z, alpha=.15, levels=[-.5, .5, 1.5], colors=[TEAL, AMBER])
    axs[0].scatter(X[:, 0], X[:, 1], c=[TEAL if v == 0 else AMBER for v in y], s=14, edgecolor="white", lw=.4)
    axs[0].set_title("Classification")
    Xb, yb = datasets.make_blobs(240, centers=[[0, 0], [4, 1], [1.5, 4]], cluster_std=.8, random_state=3)
    axs[1].scatter(Xb[:, 0], Xb[:, 1], c=[CAT[i] for i in yb], s=14, edgecolor="white", lw=.4)
    axs[1].set_title("Clustering")
    # association: co-occurrence heatmap
    items = ["bread", "milk", "eggs", "dates", "coffee"]
    M = np.array([[1, .62, .41, .12, .2], [.62, 1, .48, .1, .35], [.41, .48, 1, .08, .15], [.12, .1, .08, 1, .55], [.2, .35, .15, .55, 1]])
    axs[2].imshow(M, cmap="BuGn", vmin=0, vmax=1)
    axs[2].set_xticks(range(5), items, rotation=45, fontsize=10); axs[2].set_yticks(range(5), items, fontsize=10)
    axs[2].set_title("Association")
    t = np.arange(120); s = np.sin(t / 8) + rng.normal(0, .15, 120); s[[30, 77, 101]] += [2.2, -2, 1.9]
    axs[3].plot(t, s, color=SLATE, lw=1.2)
    axs[3].scatter([30, 77, 101], s[[30, 77, 101]], color=CORAL, s=60, zorder=3)
    axs[3].set_title("Anomaly detection")
    for a in (axs[0], axs[1], axs[3]):
        clean(a)
    for s_ in axs[2].spines.values(): s_.set_visible(False)
    fig.tight_layout(); save(fig, "ch1_tasks")

    # data growth (IDC-style estimate, zettabytes)
    years = [2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024, 2025]
    zb = [2, 6.5, 12.5, 18, 33, 64, 97, 147, 181]
    fig, ax = plt.subplots(figsize=(6.4, 3.9))
    ax.bar([str(y) for y in years], zb, color=[TEAL] * 8 + [AMBER], width=.65)
    for i, v in enumerate(zb):
        ax.text(i, v + 4, f"{v:g}", ha="center", fontsize=11, color=INK)
    ax.set_ylabel("Zettabytes created / year"); ax.set_ylim(0, 250)
    ax.text(8, 205, "forecast", ha="center", fontsize=10, color=AMBER)
    fig.tight_layout(); save(fig, "ch1_datagrowth")

    # AI/DM convergence venn-like
    fig, ax = plt.subplots(figsize=(6, 4.6))
    for (x, y, c, lab) in [(0, .55, TEAL, "Statistics"), (-.6, -.45, AMBER, "Machine\nLearning"), (.6, -.45, PLUM, "Databases &\nBig-Data Systems")]:
        ax.add_patch(Circle((x, y), 1.05, color=c, alpha=.22, lw=0))
        ax.text(x * 1.75, y * 1.9 + (.25 if y > 0 else -.15), lab, ha="center", va="center", fontsize=14, color=INK, weight="bold")
    ax.text(0, -.08, "DATA\nMINING", ha="center", va="center", fontsize=16, weight="bold", color=INK)
    ax.text(0, -1.95, "+ visualization · domain knowledge · HPC · AI", ha="center", fontsize=11.5, color=SLATE)
    ax.set_xlim(-2.2, 2.2); ax.set_ylim(-2.1, 1.9); ax.set_aspect("equal"); clean(ax)
    save(fig, "ch1_venn")


# ---------------------------------------------------------------- Chapter 2
def ch2():
    # skew: mean vs median
    x = rng.lognormal(10.3, .6, 4000) / 1000
    fig, ax = plt.subplots(figsize=(6.4, 3.8))
    ax.hist(x, bins=60, color=TEAL2, edgecolor="white")
    ax.axvline(np.mean(x), color=CORAL, lw=2.5, label=f"mean = {np.mean(x):.1f}k")
    ax.axvline(np.median(x), color=INK, lw=2.5, ls="--", label=f"median = {np.median(x):.1f}k")
    ax.axvline(x.max() * .0 + np.percentile(x, 50), color=INK, lw=0)
    ax.set_xlabel("Monthly salary (SAR, thousands)"); ax.set_ylabel("count"); ax.legend(fontsize=12)
    ax.set_xlim(0, 100)
    fig.tight_layout(); save(fig, "ch2_skew")

    # boxplot with outliers
    data = [rng.normal(50, 8, 200), np.r_[rng.normal(60, 5, 195), [95, 99, 20, 18, 100]], rng.exponential(10, 200)]
    fig, ax = plt.subplots(figsize=(6.4, 3.8))
    bp = ax.boxplot(data, patch_artist=True, widths=.5, vert=False,
                    flierprops=dict(marker="o", markerfacecolor=CORAL, markeredgecolor="white", markersize=8),
                    medianprops=dict(color=INK, lw=2))
    for b, c in zip(bp["boxes"], [TEAL2, AMBER, PLUM]):
        b.set_facecolor(c); b.set_alpha(.75); b.set_edgecolor(INK)
    ax.set_yticks([1, 2, 3], ["Sensor A", "Sensor B", "Waiting time"])
    ax.set_xlabel("value")
    ax.annotate("outliers: beyond\nQ1 − 1.5·IQR / Q3 + 1.5·IQR", xy=(97, 2), xytext=(70, 2.65), fontsize=11, color=CORAL,
                arrowprops=dict(arrowstyle="->", color=CORAL))
    fig.tight_layout(); save(fig, "ch2_boxplot")

    # missingness matrix
    n, p = 40, 8
    M = rng.random((n, p)) < .07
    M[10:22, 3] = True; M[25:35, 6] = True
    fig, ax = plt.subplots(figsize=(6.0, 3.8))
    ax.imshow(~M, aspect="auto", cmap=matplotlib.colors.ListedColormap([CORAL, "#DDE7EA"]))
    ax.set_xticks(range(p), ["age", "income", "city", "bmi", "visits", "score", "glucose", "label"], rotation=35, fontsize=11)
    ax.set_yticks([]); ax.set_ylabel("records")
    for s_ in ax.spines.values(): s_.set_visible(False)
    ax.set_title("Missing values (red) — random vs. block patterns", fontsize=13)
    fig.tight_layout(); save(fig, "ch2_missing")

    # scaling comparison
    x1 = np.r_[rng.normal(40, 10, 300), [140, 160]]
    mm = (x1 - x1.min()) / (x1.max() - x1.min())
    z = (x1 - x1.mean()) / x1.std()
    q1, q3 = np.percentile(x1, [25, 75]); rb = (x1 - np.median(x1)) / (q3 - q1)
    fig, axs = plt.subplots(1, 3, figsize=(12, 3.2))
    for a, d, t, c in zip(axs, [mm, z, rb], ["Min–max  [0,1]", "z-score  (μ=0, σ=1)", "Robust  (median, IQR)"], [TEAL, AMBER, PLUM]):
        a.hist(d, bins=40, color=c, edgecolor="white"); a.set_title(t); a.set_yticks([])
    fig.tight_layout(); save(fig, "ch2_scaling")

    # binning illustration
    vals = np.array([1, 2, 4, 6, 9, 12, 16, 17, 18, 23, 34, 56, 78, 79, 81])
    fig, ax = plt.subplots(figsize=(6.4, 3.0))
    cols = [TEAL] * 5 + [AMBER] * 5 + [PLUM] * 5
    ax.scatter(vals, np.ones(15), c=cols, s=120, edgecolor="white", zorder=3)
    for i, (lo, hi, c) in enumerate([(0, 5, TEAL), (5, 10, AMBER), (10, 15, PLUM)]):
        m = vals[lo:hi].mean()
        ax.scatter([m], [0.4], marker="D", s=140, color=c, zorder=3)
        for v in vals[lo:hi]:
            ax.plot([v, m], [1, .4], color=c, alpha=.35, lw=1)
        ax.text(m, .12, f"bin mean {m:.0f}", ha="center", fontsize=11, color=c)
    ax.text(-2, 1.2, "raw (sorted)", fontsize=11, color=SLATE); ax.text(-2, .58, "smoothed", fontsize=11, color=SLATE)
    ax.set_ylim(0, 1.4); clean(ax)
    fig.tight_layout(); save(fig, "ch2_binning")

    # PCA
    X = rng.multivariate_normal([0, 0], [[3, 2.4], [2.4, 2.6]], 300)
    from sklearn.decomposition import PCA
    p = PCA().fit(X)
    fig, ax = plt.subplots(figsize=(5.4, 4.2))
    ax.scatter(X[:, 0], X[:, 1], s=12, color=TEAL2, alpha=.7)
    for v, l, c, n_ in zip(p.components_, p.explained_variance_, [CORAL, AMBER], ["PC1", "PC2"]):
        ax.annotate("", xy=v * 2.2 * np.sqrt(l), xytext=(0, 0), arrowprops=dict(arrowstyle="-|>", lw=3, color=c))
        ax.text(*(v * 2.45 * np.sqrt(l) + (np.array([-1.6, .3]) if n_ == "PC2" else 0)), f"{n_} ({l / p.explained_variance_.sum():.0%})", color=c, fontsize=13, weight="bold")
    ax.set_aspect("equal"); ax.set_xlabel("x₁"); ax.set_ylabel("x₂")
    fig.tight_layout(); save(fig, "ch2_pca")

    # t-SNE vs PCA on digits
    from sklearn.manifold import TSNE
    d = datasets.load_digits()
    Xp = PCA(2).fit_transform(d.data)
    Xt = TSNE(2, random_state=0, init="pca", perplexity=30).fit_transform(d.data)
    cm = matplotlib.colormaps["tab10"]
    fig, axs = plt.subplots(1, 2, figsize=(11, 4.6))
    for a, Z, t in zip(axs, [Xp, Xt], ["PCA (linear)", "t-SNE (non-linear)"]):
        a.scatter(Z[:, 0], Z[:, 1], c=d.target, cmap="tab10", s=6)
        a.set_title(t); clean(a)
    for k in range(10):
        c = Xt[d.target == k].mean(0)
        axs[1].text(*c, str(k), fontsize=16, weight="bold", color=INK, ha="center", va="center",
                    bbox=dict(boxstyle="circle,pad=0.2", fc="white", ec=cm(k), alpha=.85))
    fig.suptitle("1,797 handwritten digits (64-D) projected to 2-D", color=INK, fontsize=14)
    fig.tight_layout(); save(fig, "ch2_tsne")

    # SMOTE illustration
    maj = rng.normal([0, 0], 1.1, (120, 2)); mino = rng.normal([2.6, 2.4], .45, (10, 2))
    syn = []
    for _ in range(40):
        i, j = rng.choice(10, 2, replace=False); lam = rng.random(); syn.append(mino[i] + lam * (mino[j] - mino[i]))
    syn = np.array(syn)
    fig, axs = plt.subplots(1, 2, figsize=(10, 4))
    for a, show in zip(axs, [False, True]):
        a.scatter(maj[:, 0], maj[:, 1], s=16, color="#B8C4CC", label="majority")
        a.scatter(mino[:, 0], mino[:, 1], s=60, color=CORAL, edgecolor="white", label="minority", zorder=3)
        if show:
            a.scatter(syn[:, 0], syn[:, 1], s=30, color=AMBER, marker="^", label="synthetic (SMOTE)", zorder=2)
        a.legend(loc="lower right", fontsize=11); clean(a)
    axs[0].set_title("Imbalanced: 120 vs 10"); axs[1].set_title("After SMOTE interpolation")
    fig.tight_layout(); save(fig, "ch2_smote")

    # correlation heatmap
    feats = ["area", "rooms", "baths", "age", "dist_cbd", "price"]
    C = np.array([[1, .82, .71, -.1, -.3, .78], [.82, 1, .66, -.05, -.25, .64], [.71, .66, 1, -.2, -.2, .6],
                  [-.1, -.05, -.2, 1, .15, -.35], [-.3, -.25, -.2, .15, 1, -.52], [.78, .64, .6, -.35, -.52, 1]])
    fig, ax = plt.subplots(figsize=(5.6, 4.6))
    im = ax.imshow(C, cmap="RdBu_r", vmin=-1, vmax=1)
    ax.set_xticks(range(6), feats, rotation=40); ax.set_yticks(range(6), feats)
    for i in range(6):
        for j in range(6):
            ax.text(j, i, f"{C[i, j]:.2f}", ha="center", va="center", fontsize=10, color="white" if abs(C[i, j]) > .6 else INK)
    for s_ in ax.spines.values(): s_.set_visible(False)
    fig.colorbar(im, fraction=.046); fig.tight_layout(); save(fig, "ch2_corr")


# ---------------------------------------------------------------- Chapter 3
def ch3():
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.naive_bayes import GaussianNB
    from sklearn.svm import SVC
    from sklearn.linear_model import LogisticRegression
    X, y = datasets.make_moons(220, noise=.28, random_state=4)
    models = [("k-NN (k=7)", KNeighborsClassifier(7)), ("Naïve Bayes", GaussianNB()),
              ("Logistic regression", LogisticRegression()), ("SVM (RBF kernel)", SVC(gamma=1.5, C=2))]
    xx, yy = np.meshgrid(np.linspace(-2, 3, 250), np.linspace(-1.5, 2, 250))
    cmap = matplotlib.colors.LinearSegmentedColormap.from_list("ta", [TEAL, "white", AMBER])
    fig, axs = plt.subplots(1, 4, figsize=(14, 3.6))
    for a, (n, m) in zip(axs, models):
        m.fit(X, y)
        Z = (m.predict_proba(np.c_[xx.ravel(), yy.ravel()])[:, 1] if hasattr(m, "predict_proba") and not isinstance(m, SVC)
             else 1 / (1 + np.exp(-m.decision_function(np.c_[xx.ravel(), yy.ravel()])))).reshape(xx.shape)
        a.contourf(xx, yy, Z, 20, cmap=cmap, alpha=.55)
        a.contour(xx, yy, Z, [.5], colors=INK, linewidths=1.5)
        a.scatter(X[:, 0], X[:, 1], c=[TEAL if v == 0 else AMBER for v in y], s=12, edgecolor=INK, lw=.3)
        a.set_title(f"{n}\nacc = {m.score(X, y):.2f}", fontsize=13); clean(a)
    fig.tight_layout(); save(fig, "ch3_boundaries")

    # kNN illustration
    fig, ax = plt.subplots(figsize=(5, 4.2))
    A = rng.normal([0, 0], .9, (18, 2)); B = rng.normal([2.2, 1.6], .9, (18, 2)); q = np.array([1.2, .9])
    ax.scatter(A[:, 0], A[:, 1], s=60, color=TEAL, edgecolor="white", label="class A")
    ax.scatter(B[:, 0], B[:, 1], s=60, color=AMBER, edgecolor="white", marker="s", label="class B")
    ax.scatter(*q, s=220, marker="*", color=CORAL, zorder=4, label="query")
    allp = np.r_[A, B]; dd = np.linalg.norm(allp - q, axis=1); r3, r7 = np.sort(dd)[2], np.sort(dd)[6]
    ax.add_patch(Circle(q, r3, fill=False, ls="-", ec=INK, lw=1.5)); ax.add_patch(Circle(q, r7, fill=False, ls="--", ec=SLATE, lw=1.5))
    ax.text(q[0] + r3 * .72, q[1] + r3 * .75, "k=3", fontsize=12, color=INK); ax.text(q[0] + r7 * .72, q[1] + r7 * .75, "k=7", fontsize=12, color=SLATE)
    ax.set_aspect("equal"); ax.legend(loc="lower right", fontsize=10); clean(ax)
    fig.tight_layout(); save(fig, "ch3_knn")

    # SVM margin
    Xs, ys = datasets.make_blobs(60, centers=[[0, 0], [3, 3]], cluster_std=.7, random_state=6)
    m = SVC(kernel="linear", C=10).fit(Xs, ys)
    fig, ax = plt.subplots(figsize=(5, 4.2))
    ax.scatter(Xs[:, 0], Xs[:, 1], c=[TEAL if v == 0 else AMBER for v in ys], s=40, edgecolor="white")
    xx2, yy2 = np.meshgrid(np.linspace(-2, 5, 100), np.linspace(-2, 5, 100))
    Z = m.decision_function(np.c_[xx2.ravel(), yy2.ravel()]).reshape(xx2.shape)
    ax.contour(xx2, yy2, Z, [-1, 0, 1], colors=[SLATE, INK, SLATE], linestyles=["--", "-", "--"], linewidths=[1.3, 2.2, 1.3])
    ax.scatter(*m.support_vectors_.T, s=180, facecolor="none", edgecolor=CORAL, lw=2, label="support vectors")
    ax.legend(loc="upper left", fontsize=11); ax.set_aspect("equal"); clean(ax)
    fig.tight_layout(); save(fig, "ch3_svm")

    # ROC & PR
    from sklearn.metrics import roc_curve, auc, precision_recall_curve, average_precision_score
    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import RandomForestClassifier
    Xc, yc = datasets.make_classification(4000, 20, n_informative=6, weights=[.9], flip_y=.03, random_state=2)
    Xtr, Xte, ytr, yte = train_test_split(Xc, yc, test_size=.4, random_state=0, stratify=yc)
    fig, axs = plt.subplots(1, 2, figsize=(11, 4.4))
    for (n, mm, c) in [("Random forest", RandomForestClassifier(300, random_state=0), TEAL), ("Naïve Bayes", GaussianNB(), AMBER),
                       ("Logistic reg.", LogisticRegression(max_iter=500), PLUM)]:
        p = mm.fit(Xtr, ytr).predict_proba(Xte)[:, 1]
        f, t, _ = roc_curve(yte, p); axs[0].plot(f, t, color=c, lw=2.4, label=f"{n}  AUC={auc(f, t):.2f}")
        pr, rc, _ = precision_recall_curve(yte, p); axs[1].plot(rc, pr, color=c, lw=2.4, label=f"{n}  AP={average_precision_score(yte, p):.2f}")
    axs[0].plot([0, 1], [0, 1], ls="--", color="#AAB"); axs[0].set_xlabel("False positive rate"); axs[0].set_ylabel("True positive rate"); axs[0].set_title("ROC curve")
    axs[1].axhline(yte.mean(), ls="--", color="#AAB"); axs[1].set_xlabel("Recall"); axs[1].set_ylabel("Precision"); axs[1].set_title("Precision–Recall curve (10% positives)")
    for a in axs: a.legend(fontsize=11, loc="lower left" if a is axs[1] else "lower right")
    fig.tight_layout(); save(fig, "ch3_rocpr")

    # calibration
    from sklearn.calibration import calibration_curve
    fig, ax = plt.subplots(figsize=(5.4, 4.3))
    ax.plot([0, 1], [0, 1], ls="--", color="#AAB", label="perfectly calibrated")
    for (n, mm, c) in [("Logistic reg.", LogisticRegression(max_iter=500), TEAL), ("Naïve Bayes", GaussianNB(), CORAL)]:
        p = mm.fit(Xtr, ytr).predict_proba(Xte)[:, 1]
        fr, mp = calibration_curve(yte, p, n_bins=10, strategy="quantile")
        ax.plot(mp, fr, "o-", color=c, lw=2.2, label=n)
    ax.set_xlabel("Predicted probability"); ax.set_ylabel("Observed frequency"); ax.legend(fontsize=11)
    fig.tight_layout(); save(fig, "ch3_calibration")

    # confusion matrix graphic
    fig, ax = plt.subplots(figsize=(4.8, 4.2))
    cm_ = np.array([[30, 70], [0, 100]])
    ax.imshow([[1, 0], [0, 1]], cmap=matplotlib.colors.ListedColormap(["#F9D9CF", "#CDEBEA"]))
    labs = [["TP", "FN"], ["FP", "TN"]]
    for i in range(2):
        for j in range(2):
            ax.text(j, i - .12, labs[i][j], ha="center", fontsize=15, color=SLATE)
            ax.text(j, i + .18, str(cm_[i, j]), ha="center", fontsize=28, weight="bold", color=INK)
    ax.set_xticks([0, 1], ["Pred +", "Pred −"]); ax.set_yticks([0, 1], ["Actual +", "Actual −"])
    ax.tick_params(length=0, labelsize=13)
    for s_ in ax.spines.values(): s_.set_visible(False)
    fig.tight_layout(); save(fig, "ch3_confusion")

    # bias-variance / under-overfit
    x = np.sort(rng.uniform(0, 1, 25)); yv = np.sin(2 * np.pi * x) + rng.normal(0, .25, 25); xs = np.linspace(0, 1, 300)
    fig, axs = plt.subplots(1, 3, figsize=(12, 3.3))
    for a, d, t in zip(axs, [1, 4, 15], ["Underfit (degree 1)", "Good fit (degree 4)", "Overfit (degree 15)"]):
        c = np.polyfit(x, yv, d); a.scatter(x, yv, color=SLATE, s=22); a.plot(xs, np.polyval(c, xs), color=[CORAL, TEAL, AMBER][[1, 4, 15].index(d)], lw=2.6)
        a.set_ylim(-2, 2); a.set_title(t); clean(a)
    fig.tight_layout(); save(fig, "ch3_fit")

    # validation curve
    cplx = np.linspace(1, 10, 50); tr = 0.55 * np.exp(-cplx / 2.6) + .02; te = tr + .02 + .0045 * (cplx - 1) ** 2
    fig, ax = plt.subplots(figsize=(6, 3.9))
    ax.plot(cplx, tr, color=TEAL, lw=3, label="training error"); ax.plot(cplx, te, color=CORAL, lw=3, label="test error")
    b = cplx[np.argmin(te)]; ax.axvline(b, color=SLATE, ls=":"); ax.text(b + .15, .45, "sweet spot", color=SLATE, fontsize=12)
    ax.text(1.3, .52, "high bias", color=INK, fontsize=12); ax.text(7.5, .52, "high variance", color=INK, fontsize=12)
    ax.set_xlabel("model complexity"); ax.set_ylabel("error"); ax.set_xticks([]); ax.legend(loc="center right", fontsize=12)
    fig.tight_layout(); save(fig, "ch3_biasvar")

    # cumulative gains / lift
    rf = RandomForestClassifier(300, random_state=0).fit(Xtr, ytr); p = rf.predict_proba(Xte)[:, 1]
    o = np.argsort(-p); g = np.cumsum(yte[o]) / yte.sum(); pct = np.arange(1, len(o) + 1) / len(o)
    fig, ax = plt.subplots(figsize=(5.8, 4.2))
    ax.plot(pct * 100, g * 100, color=TEAL, lw=3, label="model")
    ax.plot([0, 100], [0, 100], ls="--", color=SLATE, label="random")
    ax.plot([0, yte.mean() * 100, 100], [0, 100, 100], color=AMBER, lw=2, label="perfect")
    k = int(.2 * len(o)); ax.scatter([20], [g[k] * 100], color=CORAL, zorder=4, s=60)
    ax.annotate(f"top 20% contacted →\n{g[k]:.0%} of responders", xy=(20, g[k] * 100), xytext=(35, 45), fontsize=11.5,
                arrowprops=dict(arrowstyle="->", color=CORAL))
    ax.set_xlabel("% customers contacted (ranked by score)"); ax.set_ylabel("% responders captured"); ax.legend(fontsize=11, loc="lower right")
    fig.tight_layout(); save(fig, "ch3_gains")


# ---------------------------------------------------------------- Chapter 4
def ch4():
    # entropy & gini
    p = np.linspace(0.001, .999, 300)
    H = -(p * np.log2(p) + (1 - p) * np.log2(1 - p)); G = 1 - p ** 2 - (1 - p) ** 2; E = 1 - np.maximum(p, 1 - p)
    fig, ax = plt.subplots(figsize=(5.8, 3.9))
    ax.plot(p, H, color=TEAL, lw=3, label="Entropy (ID3, C4.5)"); ax.plot(p, 2 * G, color=AMBER, lw=3, label="Gini ×2 (CART)")
    ax.plot(p, 2 * E, color=PLUM, lw=2, ls="--", label="Misclassification ×2")
    ax.set_xlabel("proportion of positive class p"); ax.set_ylabel("impurity"); ax.legend(fontsize=11, loc="lower center")
    fig.tight_layout(); save(fig, "ch4_impurity")

    # play tennis tree via sklearn
    from sklearn.tree import DecisionTreeClassifier, plot_tree
    import pandas as pd
    rows = [("Sunny", "Hot", "High", "Weak", "No"), ("Sunny", "Hot", "High", "Strong", "No"), ("Overcast", "Hot", "High", "Weak", "Yes"),
            ("Rain", "Mild", "High", "Weak", "Yes"), ("Rain", "Cool", "Normal", "Weak", "Yes"), ("Rain", "Cool", "Normal", "Strong", "No"),
            ("Overcast", "Cool", "Normal", "Strong", "Yes"), ("Sunny", "Mild", "High", "Weak", "No"), ("Sunny", "Cool", "Normal", "Weak", "Yes"),
            ("Rain", "Mild", "Normal", "Weak", "Yes"), ("Sunny", "Mild", "Normal", "Strong", "Yes"), ("Overcast", "Mild", "High", "Strong", "Yes"),
            ("Overcast", "Hot", "Normal", "Weak", "Yes"), ("Rain", "Mild", "High", "Strong", "No")]
    df = pd.DataFrame(rows, columns=["Outlook", "Temp", "Humidity", "Wind", "Play"])
    # Draw the ID3 tree manually for clarity
    fig, ax = plt.subplots(figsize=(8.5, 4.6))
    def node(x, y, t, c, w=1.5):
        ax.add_patch(FancyBboxPatch((x - w / 2, y - .28), w, .56, boxstyle="round,pad=0.05,rounding_size=0.15", fc=c, ec="none"))
        ax.text(x, y, t, ha="center", va="center", color="white", fontsize=14, weight="bold")
    def edge(x1, y1, x2, y2, t):
        ax.plot([x1, x2], [y1 - .3, y2 + .3], color="#9AA7B2", lw=1.8)
        ax.text((x1 + x2) / 2 + (.12 if x2 >= x1 else -.12), (y1 + y2) / 2, t, ha="left" if x2 >= x1 else "right", fontsize=12, color=SLATE)
    node(4, 3, "Outlook", INK)
    node(1.4, 1.6, "Humidity", TEAL); node(4, 1.6, "YES  (4/0)", GREEN, 1.8); node(6.6, 1.6, "Wind", TEAL)
    node(.5, .2, "NO (0/3)", CORAL, 1.5); node(2.3, .2, "YES (2/0)", GREEN, 1.5); node(5.7, .2, "NO (0/2)", CORAL, 1.5); node(7.5, .2, "YES (3/0)", GREEN, 1.5)
    edge(4, 3, 1.4, 1.6, "Sunny"); edge(4, 3, 4, 1.6, "Overcast"); edge(4, 3, 6.6, 1.6, "Rain")
    edge(1.4, 1.6, .5, .2, "High"); edge(1.4, 1.6, 2.3, .2, "Normal"); edge(6.6, 1.6, 5.7, .2, "Strong"); edge(6.6, 1.6, 7.5, .2, "Weak")
    ax.set_xlim(-.5, 8.5); ax.set_ylim(-.3, 3.5); clean(ax)
    save(fig, "ch4_tennis_tree")

    # tree depth overfitting + partition picture
    X, y = datasets.make_moons(800, noise=.32, random_state=1)
    from sklearn.model_selection import train_test_split
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.5, random_state=1)
    ds = range(1, 16); tr, te = [], []
    for d in ds:
        m = DecisionTreeClassifier(max_depth=d, random_state=0).fit(Xtr, ytr); tr.append(m.score(Xtr, ytr)); te.append(m.score(Xte, yte))
    fig, ax = plt.subplots(figsize=(5.8, 3.9))
    ax.plot(ds, tr, "o-", color=TEAL, lw=2.4, label="train accuracy"); ax.plot(ds, te, "o-", color=CORAL, lw=2.4, label="test accuracy")
    ax.set_xlabel("max depth"); ax.set_ylabel("accuracy"); ax.legend(fontsize=11)
    ax.axvspan(7, 15, color=AMBER, alpha=.1); ax.text(9.5, .8, "overfitting →\nprune!", color=AMBER, fontsize=13, weight="bold")
    fig.tight_layout(); save(fig, "ch4_depth")

    # axis-aligned partitions vs ensemble smoothing
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    xx, yy = np.meshgrid(np.linspace(-2, 3, 300), np.linspace(-1.5, 2, 300))
    cmap = matplotlib.colors.LinearSegmentedColormap.from_list("ta", [TEAL, "white", AMBER])
    fig, axs = plt.subplots(1, 3, figsize=(13, 3.7))
    for a, (n, m) in zip(axs, [("Single tree (depth 12)", DecisionTreeClassifier(max_depth=12, random_state=0)),
                               ("Random forest (500 trees)", RandomForestClassifier(500, min_samples_leaf=3, random_state=0)),
                               ("Gradient boosting (200 stages)", GradientBoostingClassifier(n_estimators=200, max_depth=2, random_state=0))]):
        m.fit(Xtr, ytr); Z = m.predict_proba(np.c_[xx.ravel(), yy.ravel()])[:, 1].reshape(xx.shape)
        a.contourf(xx, yy, Z, 20, cmap=cmap, alpha=.6); a.scatter(Xtr[:, 0], Xtr[:, 1], c=[TEAL if v == 0 else AMBER for v in ytr], s=10, edgecolor=INK, lw=.3)
        a.set_title(f"{n}\ntest acc = {m.score(Xte, yte):.2f}", fontsize=13); clean(a)
    fig.tight_layout(); save(fig, "ch4_ensembles")

    # boosting residuals
    x = np.sort(rng.uniform(0, 10, 120)); yv = np.sin(x) + .3 * x + rng.normal(0, .25, 120)
    from sklearn.tree import DecisionTreeRegressor
    fig, axs = plt.subplots(1, 3, figsize=(13, 3.4)); F = np.full_like(yv, yv.mean()); lr = .5; st = 0
    for a, M in zip(axs, [1, 5, 50]):
        F = np.full_like(yv, yv.mean())
        for _ in range(M):
            t = DecisionTreeRegressor(max_depth=2).fit(x[:, None], yv - F); F += lr * t.predict(x[:, None])
        a.scatter(x, yv, s=10, color=SLATE); a.plot(x, F, color=CORAL, lw=2.6); a.set_title(f"after {M} tree{'s' if M > 1 else ''}"); clean(a)
    fig.tight_layout(); save(fig, "ch4_boosting")

    # linear-model exact SHAP beeswarm (California housing subset)
    from sklearn.linear_model import Ridge
    from sklearn.preprocessing import StandardScaler
    d = datasets.fetch_california_housing() if False else None
    # synthetic housing-like data (no download)
    n = 600
    Xh = np.c_[rng.normal(0, 1, n), rng.normal(0, 1, n), rng.normal(0, 1, n), rng.normal(0, 1, n), rng.normal(0, 1, n)]
    names = ["Median income", "Distance to CBD", "House age", "Rooms / household", "Population"]
    w = np.array([1.2, -.8, .25, .45, -.08])
    yh = Xh @ w + rng.normal(0, .4, n)
    m = Ridge().fit(Xh, yh); phi = (Xh - Xh.mean(0)) * m.coef_
    order = np.argsort(np.abs(phi).mean(0))
    fig, ax = plt.subplots(figsize=(6.6, 4.0))
    cm2 = matplotlib.colors.LinearSegmentedColormap.from_list("sh", [TEAL, "#DDDDDD", CORAL])
    for i, f in enumerate(order):
        jitter = rng.normal(0, .09, n)
        sc = ax.scatter(phi[:, f], i + jitter, c=Xh[:, f], cmap=cm2, s=8, vmin=-2, vmax=2)
    ax.set_yticks(range(5), [names[f] for f in order]); ax.axvline(0, color=SLATE, lw=1)
    ax.set_xlabel("SHAP value (impact on predicted price)")
    cb = fig.colorbar(sc, fraction=.04); cb.set_ticks([-2, 2]); cb.set_ticklabels(["low", "high"]); cb.set_label("feature value")
    fig.tight_layout(); save(fig, "ch4_shap")


# ---------------------------------------------------------------- Chapter 5
def ch5():
    from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, SpectralClustering, HDBSCAN
    from sklearn.mixture import GaussianMixture
    from sklearn.metrics import silhouette_score, silhouette_samples
    X, yt = datasets.make_blobs(300, centers=[[0, 0], [4, .5], [2, 3.8]], cluster_std=.75, random_state=11)
    # k-means iterations
    C = np.array([[0.2, 3.5], [.5, 3.0], [1.0, 3.4]])
    fig, axs = plt.subplots(1, 4, figsize=(14, 3.5))
    for it, a in enumerate(axs):
        lab = np.argmin(((X[:, None] - C[None]) ** 2).sum(-1), 1)
        a.scatter(X[:, 0], X[:, 1], c=[CAT[l] for l in lab], s=10, alpha=.8)
        a.scatter(C[:, 0], C[:, 1], c=[CAT[i] for i in range(3)], s=260, marker="X", edgecolor=INK, lw=1.5)
        a.set_title(["Init: random centroids", "Iteration 1", "Iteration 2", "Converged"][it]); clean(a)
        newC = np.array([X[lab == k].mean(0) for k in range(3)])
        for k in range(3):
            if it < 3: a.annotate("", xy=newC[k], xytext=C[k], arrowprops=dict(arrowstyle="->", color=INK, lw=1.5))
        C = newC
        if it == 1:
            for _ in range(5):
                lab = np.argmin(((X[:, None] - C[None]) ** 2).sum(-1), 1); C = np.array([X[lab == k].mean(0) for k in range(3)])
    fig.tight_layout(); save(fig, "ch5_kmeans_iter")

    # elbow + silhouette
    ks = range(2, 10); inert, sil = [], []
    for k in ks:
        m = KMeans(k, n_init=10, random_state=0).fit(X); inert.append(m.inertia_); sil.append(silhouette_score(X, m.labels_))
    fig, axs = plt.subplots(1, 2, figsize=(11, 3.7))
    axs[0].plot(ks, inert, "o-", color=TEAL, lw=2.5); axs[0].set_title("Elbow method (SSE)"); axs[0].set_xlabel("k")
    axs[0].scatter([3], [inert[1]], s=200, facecolor="none", edgecolor=CORAL, lw=2.5)
    axs[1].bar(list(ks), sil, color=[CORAL if k == 3 else TEAL2 for k in ks]); axs[1].set_title("Mean silhouette"); axs[1].set_xlabel("k")
    fig.tight_layout(); save(fig, "ch5_elbow")

    # silhouette plot
    m = KMeans(3, n_init=10, random_state=0).fit(X); s = silhouette_samples(X, m.labels_)
    fig, ax = plt.subplots(figsize=(5.4, 4.2)); y0 = 0
    for k in range(3):
        sk = np.sort(s[m.labels_ == k]); ax.fill_betweenx(np.arange(y0, y0 + len(sk)), 0, sk, color=CAT[k], alpha=.85); ax.text(-.06, y0 + len(sk) / 2, f"C{k + 1}", fontsize=12)
        y0 += len(sk) + 10
    ax.axvline(s.mean(), color=CORAL, ls="--", lw=2); ax.text(s.mean() + .01, y0 - 5, f"mean = {s.mean():.2f}", color=CORAL, fontsize=12)
    ax.set_xlabel("silhouette coefficient s(i)"); ax.set_yticks([])
    fig.tight_layout(); save(fig, "ch5_silhouette")

    # failure modes: moons, circles, anisotropic — kmeans vs DBSCAN vs spectral
    Xm, _ = datasets.make_moons(400, noise=.06, random_state=0)
    Xc, _ = datasets.make_circles(400, factor=.45, noise=.05, random_state=0)
    fig, axs = plt.subplots(2, 3, figsize=(12, 6.4))
    for r, (D, eps) in enumerate([(Xm, .2), (Xc, .2)]):
        for c, (n, mdl) in enumerate([("k-means", KMeans(2, n_init=10, random_state=0)), ("DBSCAN", DBSCAN(eps=eps, min_samples=5)),
                                      ("Spectral", SpectralClustering(2, affinity="nearest_neighbors", n_neighbors=10, random_state=0))]):
            lab = mdl.fit_predict(D); a = axs[r, c]
            a.scatter(D[:, 0], D[:, 1], c=[CAT[l % 8] if l >= 0 else "#BBBBBB" for l in lab], s=9)
            if r == 0: a.set_title(n, fontsize=15)
            clean(a)
    fig.tight_layout(); save(fig, "ch5_shapes")

    # DBSCAN core/border/noise illustration
    Xd = np.r_[rng.normal([0, 0], .35, (40, 2)), rng.normal([2.4, 1.3], .3, (30, 2)), rng.uniform(-1.2, 3.5, (8, 2))]
    db = DBSCAN(eps=.42, min_samples=5).fit(Xd); core = np.zeros(len(Xd), bool); core[db.core_sample_indices_] = True
    fig, ax = plt.subplots(figsize=(5.6, 4.2))
    ax.scatter(*Xd[core].T, s=50, color=TEAL, edgecolor="white", label="core point")
    ax.scatter(*Xd[(~core) & (db.labels_ >= 0)].T, s=50, color=AMBER, edgecolor="white", label="border point")
    ax.scatter(*Xd[db.labels_ < 0].T, s=60, color=CORAL, marker="x", lw=2, label="noise")
    i0 = np.where(core)[0][0]; ax.add_patch(Circle(Xd[i0], .42, fill=False, ec=INK, ls="--")); ax.text(Xd[i0, 0] - .3, Xd[i0, 1] - .62, "ε", fontsize=18, color=INK)
    ax.legend(fontsize=11, loc="upper left"); ax.set_aspect("equal"); clean(ax)
    fig.tight_layout(); save(fig, "ch5_dbscan")

    # dendrogram
    from scipy.cluster.hierarchy import linkage, dendrogram
    Xh = np.r_[rng.normal([0, 0], .5, (8, 2)), rng.normal([3, 3], .5, (7, 2)), rng.normal([0, 4], .5, (6, 2))]
    Z = linkage(Xh, "ward")
    fig, ax = plt.subplots(figsize=(6.6, 3.9))
    from scipy.cluster import hierarchy
    hierarchy.set_link_color_palette([TEAL, AMBER, PLUM])
    dendrogram(Z, ax=ax, color_threshold=6, above_threshold_color=SLATE)
    ax.axhline(6, color=CORAL, ls="--", lw=2); ax.text(1, 6.4, "cut → 3 clusters", color=CORAL, fontsize=12)
    ax.set_ylabel("merge distance (Ward)"); ax.set_xticks([])
    fig.tight_layout(); save(fig, "ch5_dendrogram")

    # linkage comparison
    Xl = np.r_[datasets.make_moons(200, noise=.05, random_state=2)[0], rng.normal([2.6, -1.0], .15, (40, 2))]
    fig, axs = plt.subplots(1, 4, figsize=(14, 3.3))
    for a, l in zip(axs, ["single", "complete", "average", "ward"]):
        lab = AgglomerativeClustering(3, linkage=l).fit_predict(Xl); a.scatter(Xl[:, 0], Xl[:, 1], c=[CAT[k] for k in lab], s=8); a.set_title(f"{l} linkage"); clean(a)
    fig.tight_layout(); save(fig, "ch5_linkage")

    # GMM ellipses vs kmeans on anisotropic
    Xa = np.dot(datasets.make_blobs(450, centers=3, random_state=170)[0], [[0.6, -0.64], [-0.41, 0.85]])
    fig, axs = plt.subplots(1, 2, figsize=(11, 4.2))
    lk = KMeans(3, n_init=10, random_state=0).fit_predict(Xa)
    axs[0].scatter(*Xa.T, c=[CAT[k] for k in lk], s=9); axs[0].set_title("k-means (spherical bias)"); clean(axs[0])
    g = GaussianMixture(3, covariance_type="full", random_state=0).fit(Xa); lg = g.predict(Xa)
    axs[1].scatter(*Xa.T, c=[CAT[k] for k in lg], s=9); axs[1].set_title("Gaussian mixture (EM, full covariance)"); clean(axs[1])
    for k in range(3):
        v, w = np.linalg.eigh(g.covariances_[k]); ang = np.degrees(np.arctan2(w[1, 1], w[0, 1]))
        for s_ in (1.5, 3):
            axs[1].add_patch(Ellipse(g.means_[k], 2 * s_ * np.sqrt(v[1]), 2 * s_ * np.sqrt(v[0]), angle=ang, fill=False, ec=CAT[k], lw=1.8))
    fig.tight_layout(); save(fig, "ch5_gmm")

    # fuzzy membership
    x = np.linspace(0, 10, 400); c = [2, 5, 8.2]; d = np.abs(x[:, None] - np.array(c)[None]) + 1e-6; mexp = 2
    u = 1 / ((d[:, :, None] / d[:, None, :]) ** (2 / (mexp - 1))).sum(-1)
    fig, ax = plt.subplots(figsize=(6.4, 3.4))
    for k in range(3): ax.plot(x, u[:, k], color=CAT[k], lw=3, label=f"cluster {k + 1}")
    ax.set_xlabel("x"); ax.set_ylabel("membership u"); ax.legend(fontsize=11, loc="center right"); ax.set_ylim(0, 1.05)
    fig.tight_layout(); save(fig, "ch5_fuzzy")

    # HDBSCAN varying density
    Xv = np.r_[rng.normal([0, 0], .25, (150, 2)), rng.normal([3, 0], 1.0, (150, 2)), rng.normal([1.5, 3], .5, (120, 2)), rng.uniform(-3, 6, (40, 2))]
    fig, axs = plt.subplots(1, 2, figsize=(11, 4.0))
    for a, (n, mdl) in zip(axs, [("DBSCAN (single ε)", DBSCAN(eps=.3, min_samples=8)), ("HDBSCAN (density hierarchy)", HDBSCAN(min_cluster_size=25))]):
        lab = mdl.fit_predict(Xv); a.scatter(*Xv.T, c=[CAT[l % 8] if l >= 0 else "#C8C8C8" for l in lab], s=8); a.set_title(n); clean(a)
    fig.tight_layout(); save(fig, "ch5_hdbscan")

    # distances unit balls
    fig, ax = plt.subplots(figsize=(4.6, 4.4)); t = np.linspace(0, 2 * np.pi, 400)
    for pp, c, lab in [(1, CORAL, "Manhattan (p=1)"), (2, TEAL, "Euclidean (p=2)"), (np.inf, AMBER, "Chebyshev (p=∞)")]:
        if pp == np.inf: xs, ys = np.array([1, -1, -1, 1, 1]), np.array([1, 1, -1, -1, 1])
        else:
            xs = np.sign(np.cos(t)) * np.abs(np.cos(t)) ** (2 / pp); ys = np.sign(np.sin(t)) * np.abs(np.sin(t)) ** (2 / pp)
        ax.plot(xs, ys, color=c, lw=3, label=lab)
    ax.set_aspect("equal"); ax.legend(fontsize=11, loc="upper center", bbox_to_anchor=(.5, -.02), ncol=1); clean(ax)
    ax.set_title("Unit 'circles' of Minkowski distances", fontsize=13)
    fig.tight_layout(); save(fig, "ch5_minkowski")


# ---------------------------------------------------------------- Chapter 6
def ch6():
    # itemset lattice
    from itertools import combinations
    items = ["A", "B", "C", "D"]; G = nx.DiGraph(); pos = {}
    levels = [[()]] + [list(combinations(items, k)) for k in range(1, 5)]
    infreq = {("D",)}
    for lv, sets in enumerate(levels):
        for i, s in enumerate(sets):
            pos[s] = ((i - (len(sets) - 1) / 2) * 1.35, -lv)
            G.add_node(s)
    for lv in range(1, 5):
        for s in levels[lv]:
            for sub in combinations(s, lv - 1): G.add_edge(sub, s)
    pruned = {s for s in G if any(set(x).issubset(s) for x in infreq)}
    fig, ax = plt.subplots(figsize=(9.5, 4.8))
    nx.draw_networkx_edges(G, pos, ax=ax, edge_color=["#F3C1B3" if v in pruned else "#C7D3DA" for u, v in G.edges()], arrows=False, width=1.4)
    for s, (x, y) in pos.items():
        c = CORAL if s in infreq else ("#F6D7CE" if s in pruned else (TEAL if s else INK))
        ax.add_patch(FancyBboxPatch((x - .5, y - .2), 1.0, .4, boxstyle="round,pad=0.02,rounding_size=0.12", fc=c, ec="none"))
        ax.text(x, y, "".join(s) if s else "{ }", ha="center", va="center", color="white" if s not in pruned or s in infreq else CORAL, fontsize=13, weight="bold")
    ax.text(5.2, -1, "D infrequent =>\nevery superset pruned", color=CORAL, fontsize=13, va="center")
    ax.set_xlim(-5, 7.6); ax.set_ylim(-4.5, .5); clean(ax)
    save(fig, "ch6_lattice")

    # rules scatter support vs confidence colored by lift
    n = 160; sup = rng.beta(1.3, 9, n) * .6; conf = np.clip(rng.beta(4, 3, n), .05, 1); lift = conf / np.clip(rng.uniform(.1, .7, n), .1, 1)
    fig, ax = plt.subplots(figsize=(6.2, 4.2))
    cm2 = matplotlib.colors.LinearSegmentedColormap.from_list("l", ["#C7D3DA", TEAL, INK])
    sc = ax.scatter(sup, conf, c=lift, cmap=cm2, s=30 + 25 * lift, edgecolor="white", lw=.5)
    ax.axvline(.05, color=CORAL, ls="--"); ax.axhline(.6, color=CORAL, ls="--")
    ax.text(.052, .03, "minsup", color=CORAL, fontsize=11); ax.set_xlim(0, .25); ax.text(.2, .615, "minconf", color=CORAL, fontsize=11)
    ax.set_xlabel("support"); ax.set_ylabel("confidence"); cb = fig.colorbar(sc, fraction=.04); cb.set_label("lift")
    fig.tight_layout(); save(fig, "ch6_rules_scatter")

    # FP-tree drawing (from classic 5-transaction example)
    fig, ax = plt.subplots(figsize=(7.4, 4.8))
    nodes = {"root": (3.5, 4.2, "{ }"), "f": (2, 3.2, "f:4"), "c1": (5.2, 3.2, "c:1"), "c": (1.2, 2.2, "c:3"), "b1": (2.9, 2.2, "b:1"),
             "b2": (5.2, 2.2, "b:1"), "a": (1.2, 1.2, "a:3"), "p2": (5.2, 1.2, "p:1"), "m": (.4, .2, "m:2"), "b3": (2.0, .2, "b:1"),
             "p": (.4, -.8, "p:2"), "m2": (2.0, -.8, "m:1")}
    edges = [("root", "f"), ("root", "c1"), ("f", "c"), ("f", "b1"), ("c1", "b2"), ("c", "a"), ("b2", "p2"), ("a", "m"), ("a", "b3"), ("m", "p"), ("b3", "m2")]
    for u, v in edges:
        ax.plot([nodes[u][0], nodes[v][0]], [nodes[u][1], nodes[v][1]], color="#9AA7B2", lw=1.8, zorder=1)
    colmap = {"f": TEAL, "c": AMBER, "a": PLUM, "b": SLATE, "m": GREEN, "p": CORAL, "{": INK}
    for k, (x, y, t) in nodes.items():
        ax.add_patch(Circle((x, y), .36, color=colmap[t[0]], zorder=2)); ax.text(x, y, t, ha="center", va="center", color="white", fontsize=12, weight="bold", zorder=3)
    for (a_, b_) in [("m", "m2"), ("p", "p2")]:
        ax.add_patch(FancyArrowPatch(nodes[a_][:2], nodes[b_][:2], connectionstyle="arc3,rad=-0.25", arrowstyle="->", ls=":", color=colmap[a_[0]], lw=1.5, mutation_scale=12, zorder=0))
    # header table
    for i, (it, cnt) in enumerate([("f", 4), ("c", 4), ("a", 3), ("b", 3), ("m", 3), ("p", 3)]):
        ax.add_patch(Rectangle((6.6, 3.6 - i * .7), 1.1, .55, color=colmap[it])); ax.text(7.15, 3.87 - i * .7, f"{it} : {cnt}", ha="center", va="center", color="white", fontsize=12, weight="bold")
    ax.text(7.15, 4.4, "Header table", ha="center", fontsize=12, color=INK, weight="bold")
    ax.set_xlim(-.3, 8); ax.set_ylim(-1.3, 4.8); ax.set_aspect("equal"); clean(ax)
    save(fig, "ch6_fptree")

    # runtime comparison illustrative
    ms = np.array([5, 4, 3, 2, 1, .5]); ap = np.array([2, 4, 9, 30, 160, 900]); fp = np.array([1.5, 2.2, 3, 5, 11, 26]); ec = np.array([1.8, 2.8, 4.5, 9, 25, 70])
    fig, ax = plt.subplots(figsize=(6, 3.9))
    for d_, c, l in [(ap, CORAL, "Apriori"), (ec, AMBER, "Eclat"), (fp, TEAL, "FP-Growth")]: ax.plot(ms, d_, "o-", color=c, lw=2.5, label=l)
    ax.set_yscale("log"); ax.invert_xaxis(); ax.set_xlabel("minimum support (%)"); ax.set_ylabel("runtime (s, log)"); ax.legend(fontsize=11)
    ax.text(4.9, 300, "illustrative trend on a dense dataset", fontsize=10, color=SLATE)
    fig.tight_layout(); save(fig, "ch6_runtime")


# ---------------------------------------------------------------- Chapter 7
def ch7():
    # anomaly types
    fig, axs = plt.subplots(1, 3, figsize=(13, 3.4))
    P = rng.normal(0, 1, (150, 2)); axs[0].scatter(*P.T, s=12, color=TEAL2); axs[0].scatter([3.6, -3.2], [3.1, 2.8], s=90, color=CORAL, edgecolor="white"); axs[0].set_title("Point anomaly")
    t = np.arange(365); s = 25 + 12 * np.sin(2 * np.pi * (t - 100) / 365) + rng.normal(0, 1, 365); s[20] = 36
    axs[1].plot(t, s, color=SLATE, lw=1); axs[1].scatter([20], [s[20]], color=CORAL, s=80, zorder=3); axs[1].set_title("Contextual anomaly\n(36°C in January)")
    e = np.sin(np.arange(300) / 5) + rng.normal(0, .1, 300); e[150:185] = rng.normal(0, .1, 35)
    axs[2].plot(e, color=SLATE, lw=1); axs[2].plot(range(150, 185), e[150:185], color=CORAL, lw=2.4); axs[2].set_title("Collective anomaly")
    for a in axs: clean(a)
    fig.tight_layout(); save(fig, "ch7_types")

    # isolation forest: partitions
    from sklearn.ensemble import IsolationForest
    from sklearn.neighbors import LocalOutlierFactor
    X = np.r_[rng.normal([0, 0], .6, (200, 2)), rng.normal([3, 3], .35, (80, 2)), rng.uniform(-3, 5, (14, 2))]
    fig, axs = plt.subplots(1, 2, figsize=(11, 4.3))
    xx, yy = np.meshgrid(np.linspace(-3.5, 5.5, 200), np.linspace(-3.5, 5.5, 200))
    iso = IsolationForest(n_estimators=300, contamination=.05, random_state=0).fit(X)
    Z = iso.score_samples(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    cm2 = matplotlib.colors.LinearSegmentedColormap.from_list("a", [CORAL, "#FBE3DA", "white"])
    axs[0].contourf(xx, yy, Z, 20, cmap=cm2); pr = iso.predict(X)
    axs[0].scatter(*X[pr == 1].T, s=10, color=TEAL); axs[0].scatter(*X[pr == -1].T, s=50, color=CORAL, edgecolor=INK)
    axs[0].set_title("Isolation Forest — anomaly score"); clean(axs[0])
    lof = LocalOutlierFactor(n_neighbors=20); lab = lof.fit_predict(X); sc = -lof.negative_outlier_factor_
    axs[1].scatter(*X.T, s=10, color=TEAL)
    axs[1].scatter(*X.T, s=((sc - 1.3).clip(0) * 400), facecolor="none", edgecolor=CORAL, lw=1.5)
    axs[1].set_title("LOF — circle size grows with outlier factor"); clean(axs[1])
    fig.tight_layout(); save(fig, "ch7_iforest_lof")

    # isolation path illustration
    fig, ax = plt.subplots(figsize=(5.2, 4.2))
    P = rng.normal([0, 0], .5, (60, 2)); o = np.array([2.2, 1.9])
    ax.scatter(*P.T, s=18, color=TEAL); ax.scatter(*o, s=120, color=CORAL, edgecolor=INK, zorder=4)
    ax.axvline(1.6, color=AMBER, lw=2); ax.plot([1.6, 3], [1.4, 1.4], color=AMBER, lw=2)
    ax.text(1.63, -1.8, "split 1", color=AMBER, fontsize=12); ax.text(2.2, 1.2, "split 2", color=AMBER, fontsize=12)
    ax.text(-1.9, 2.4, "outlier isolated in 2 splits;\nnormal points need many more", fontsize=12, color=INK)
    ax.set_xlim(-2, 3); ax.set_ylim(-2, 2.9); clean(ax)
    fig.tight_layout(); save(fig, "ch7_isolation")

    # autoencoder reconstruction error
    err = np.r_[rng.gamma(2, .02, 2000), rng.gamma(6, .05, 40)]
    fig, ax = plt.subplots(figsize=(6, 3.6))
    ax.hist(err[:2000], bins=60, color=TEAL2, label="normal transactions", edgecolor="white")
    ax.hist(err[2000:], bins=25, color=CORAL, label="fraud", edgecolor="white", alpha=.9)
    thr = np.percentile(err[:2000], 99); ax.axvline(thr, color=INK, ls="--", lw=2); ax.text(thr + .01, 140, "threshold\n(99th pct)", color=INK, fontsize=11)
    ax.set_xlabel("reconstruction error"); ax.set_ylabel("count"); ax.legend(fontsize=11)
    fig.tight_layout(); save(fig, "ch7_ae_error")

    # time-series decomposition
    t = np.arange(144); trend = 100 + .9 * t; seas = 15 * np.sin(2 * np.pi * t / 12); noise = rng.normal(0, 4, 144); y = trend + seas + noise
    fig, axs = plt.subplots(4, 1, figsize=(7, 5.4), sharex=True)
    for a, d_, n, c in zip(axs, [y, trend, seas, noise], ["observed", "trend", "seasonal (12)", "residual"], [INK, TEAL, AMBER, SLATE]):
        a.plot(t, d_, color=c, lw=1.8); a.set_ylabel(n, fontsize=11); a.set_yticks([])
    axs[-1].set_xlabel("month")
    fig.tight_layout(); save(fig, "ch7_decomp")

    # forecast with prediction intervals
    t2 = np.arange(156); fut = t2[144:]; mu = 100 + .9 * fut + 15 * np.sin(2 * np.pi * fut / 12); h = np.arange(1, 13)
    fig, ax = plt.subplots(figsize=(7, 3.7))
    ax.plot(t[-60:], y[-60:], color=INK, lw=1.8, label="history")
    ax.fill_between(fut, mu - 1.96 * 4 * np.sqrt(h), mu + 1.96 * 4 * np.sqrt(h), color=TEAL2, alpha=.3, label="95% interval")
    ax.fill_between(fut, mu - .67 * 4 * np.sqrt(h), mu + .67 * 4 * np.sqrt(h), color=TEAL, alpha=.35, label="50% interval")
    ax.plot(fut, mu, color=TEAL, lw=2.4, label="forecast (h = 1…12)")
    ax.axvline(143.5, color=SLATE, ls=":"); ax.legend(fontsize=10.5, loc="upper left", ncol=2); ax.set_xlabel("month"); ax.set_yticks([])
    fig.tight_layout(); save(fig, "ch7_forecast")

    # sliding window / expanding validation
    fig, ax = plt.subplots(figsize=(7.2, 3.2))
    for i in range(5):
        tr_end = 5 + i * 1.5
        ax.add_patch(Rectangle((0, -i), tr_end, .6, color=TEAL)); ax.add_patch(Rectangle((tr_end, -i), 1.5, .6, color=AMBER))
        ax.text(-.3, -i + .3, f"fold {i + 1}", ha="right", va="center", fontsize=12, color=INK)
    ax.text(2.5, .95, "train (past)", color=TEAL, fontsize=13, weight="bold"); ax.text(11.8, .95, "test (future)", color=AMBER, fontsize=13, weight="bold")
    ax.annotate("", xy=(13.5, -4.6), xytext=(0, -4.6), arrowprops=dict(arrowstyle="->", color=SLATE)); ax.text(13.6, -4.7, "time", fontsize=12, color=SLATE)
    ax.set_xlim(-2, 15); ax.set_ylim(-5, 1.4); clean(ax)
    save(fig, "ch7_tscv")

    # concept drift
    t = np.arange(400); x = np.where(t < 200, rng.normal(0, 1, 400), rng.normal(1.8, 1.4, 400))
    fig, ax = plt.subplots(figsize=(6.4, 3.3))
    ax.plot(t, x, color=SLATE, lw=.8); ax.plot(t, np.convolve(x, np.ones(30) / 30, "same"), color=TEAL, lw=2.6, label="rolling mean")
    ax.axvline(200, color=CORAL, ls="--", lw=2); ax.text(205, 5, "drift detected", color=CORAL, fontsize=12)
    ax.set_xlabel("time"); ax.set_yticks([]); ax.legend(fontsize=11, loc="upper left")
    fig.tight_layout(); save(fig, "ch7_drift")


# ---------------------------------------------------------------- Chapter 8
def ch8():
    # karate club communities
    G = nx.karate_club_graph()
    from networkx.algorithms.community import greedy_modularity_communities
    comms = greedy_modularity_communities(G); cmap = {}
    for i, c in enumerate(comms):
        for n in c: cmap[n] = CAT[i]
    pr = nx.pagerank(G)
    pos = nx.spring_layout(G, seed=3)
    fig, ax = plt.subplots(figsize=(6.4, 4.8))
    nx.draw_networkx_edges(G, pos, ax=ax, edge_color="#C7D3DA", width=1.1)
    nx.draw_networkx_nodes(G, pos, ax=ax, node_color=[cmap[n] for n in G], node_size=[3500 * pr[n] + 40 for n in G], edgecolors="white")
    top = sorted(pr, key=pr.get, reverse=True)[:3]
    nx.draw_networkx_labels(G, pos, {n: str(n) for n in top}, ax=ax, font_color="white", font_weight="bold", font_size=11)
    ax.set_title("Zachary karate club: colour = community, size = PageRank", fontsize=13); clean(ax)
    save(fig, "ch8_karate")

    # pagerank toy graph
    fig, ax = plt.subplots(figsize=(5.4, 4.2))
    H = nx.DiGraph([("A", "B"), ("B", "C"), ("C", "A"), ("D", "C"), ("E", "C"), ("E", "D"), ("B", "A"), ("F", "E"), ("F", "C")])
    prh = nx.pagerank(H, .85); posh = {"A": (0, 1), "B": (1, 1.6), "C": (1, .2), "D": (2.2, -.2), "E": (2.5, 1), "F": (3.4, .3)}
    nx.draw_networkx_edges(H, posh, ax=ax, edge_color=SLATE, arrows=True, arrowsize=18, width=1.6, node_size=[1500 + 6000 * prh[n] for n in H], connectionstyle="arc3,rad=.12")
    nx.draw_networkx_nodes(H, posh, ax=ax, node_color=[INK if prh[n] > .3 else (TEAL if prh[n] > .1 else SLATE) for n in H], node_size=[1500 + 6000 * prh[n] for n in H])
    nx.draw_networkx_labels(H, posh, {n: f"{n}\n{prh[n]:.2f}" for n in H}, ax=ax, font_size=10.5, font_color="white", font_weight="bold")
    clean(ax); ax.margins(.15)
    save(fig, "ch8_pagerank")

    # word embedding analogy plot (illustrative 2-D)
    W = {"king": (3, 3.2), "queen": (3.2, 1.2), "man": (1, 3.0), "woman": (1.2, 1.0), "Riyadh": (5.5, 3.6), "Saudi Arabia": (7.4, 3.0),
         "Paris": (5.6, 1.6), "France": (7.5, 1.0)}
    fig, ax = plt.subplots(figsize=(6.6, 4.2))
    for w, (x, y) in W.items():
        ax.scatter(x, y, s=80, color=TEAL if w in ("king", "queen", "man", "woman") else AMBER, zorder=3)
        ax.text(x + .12, y + .12, w, fontsize=13, color=INK)
    for a_, b_ in [("man", "woman"), ("king", "queen")]: ax.annotate("", xy=W[b_], xytext=W[a_], arrowprops=dict(arrowstyle="->", color=PLUM, lw=2))
    for a_, b_ in [("Riyadh", "Saudi Arabia"), ("Paris", "France")]: ax.annotate("", xy=W[b_], xytext=W[a_], arrowprops=dict(arrowstyle="->", color=CORAL, lw=2))
    ax.text(.2, -.1, "king − man + woman ≈ queen", fontsize=12, color=PLUM); ax.text(4.8, -.1, "capital → country offset", fontsize=12, color=CORAL)
    ax.set_xlim(0, 9.2); ax.set_ylim(-.4, 4.2); clean(ax)
    save(fig, "ch8_embeddings")

    # attention heatmap
    toks = ["the", "bank", "approved", "the", "loan"]
    A = np.array([[.5, .2, .1, .1, .1], [.05, .35, .2, .05, .35], [.05, .3, .3, .05, .3], [.1, .1, .1, .5, .2], [.03, .4, .27, .05, .25]])
    fig, ax = plt.subplots(figsize=(4.8, 4.2))
    ax.imshow(A, cmap=matplotlib.colors.LinearSegmentedColormap.from_list("t", ["white", TEAL, INK]))
    ax.set_xticks(range(5), toks, rotation=30); ax.set_yticks(range(5), toks); ax.set_title("Self-attention weights", fontsize=13)
    for s_ in ax.spines.values(): s_.set_visible(False)
    fig.tight_layout(); save(fig, "ch8_attention")

    # topic model bars
    topics = {"Topic 1 · Mobility": ["traffic", "vehicle", "route", "signal", "emission"], "Topic 2 · Health": ["x-ray", "lung", "diagnosis", "cnn", "patient"],
              "Topic 3 · Finance": ["contract", "fraud", "blockchain", "payment", "risk"]}
    fig, axs = plt.subplots(1, 3, figsize=(12, 3.3))
    for a, (t, ws), c in zip(axs, topics.items(), [TEAL, CORAL, AMBER]):
        v = np.sort(rng.uniform(.03, .12, 5))[::-1]; a.barh(ws[::-1], v[::-1], color=c); a.set_title(t, fontsize=13); a.set_xticks([])
        for s_ in ("bottom",): a.spines[s_].set_visible(False)
    fig.tight_layout(); save(fig, "ch8_topics")

    # degree distribution power-law
    BA = nx.barabasi_albert_graph(5000, 2, seed=1); ER = nx.gnp_random_graph(5000, 4 / 5000, seed=1)
    fig, ax = plt.subplots(figsize=(5.6, 3.9))
    for g, c, l in [(BA, TEAL, "scale-free (Barabási–Albert)"), (ER, AMBER, "random (Erdős–Rényi)")]:
        deg = np.bincount([d for _, d in g.degree()]); k = np.nonzero(deg)[0]; ax.loglog(k, deg[k] / deg.sum(), "o", color=c, ms=4, label=l)
    ax.set_xlabel("degree k"); ax.set_ylabel("P(k)"); ax.legend(fontsize=10.5)
    fig.tight_layout(); save(fig, "ch8_degree")

    # tf-idf small table as heatmap
    docs = ["D1", "D2", "D3", "D4"]; terms = ["mining", "rule", "tree", "traffic", "lung"]
    T = np.array([[.12, .45, .40, 0, 0], [.10, 0, .22, .61, 0], [.08, 0, 0, 0, .71], [.15, .38, 0, .30, 0]])
    fig, ax = plt.subplots(figsize=(5.2, 3.2))
    ax.imshow(T, cmap=matplotlib.colors.LinearSegmentedColormap.from_list("t", ["white", AMBER, CORAL]))
    ax.set_xticks(range(5), terms); ax.set_yticks(range(4), docs)
    for i in range(4):
        for j in range(5): ax.text(j, i, f"{T[i, j]:.2f}" if T[i, j] else "·", ha="center", va="center", fontsize=11, color=INK)
    for s_ in ax.spines.values(): s_.set_visible(False)
    fig.tight_layout(); save(fig, "ch8_tfidf")


# ---------------------------------------------------------------- Chapter 9
def ch9():
    # fairness metrics by group
    groups = ["Group A", "Group B"]
    fig, axs = plt.subplots(1, 3, figsize=(12, 3.4))
    for a, (t, v) in zip(axs, [("Selection rate\n(demographic parity)", [.42, .27]), ("True positive rate\n(equal opportunity)", [.81, .66]), ("Precision\n(predictive parity)", [.74, .72])]):
        a.bar(groups, v, color=[TEAL, AMBER], width=.55); a.set_ylim(0, 1); a.set_title(t, fontsize=13)
        for i, x in enumerate(v): a.text(i, x + .03, f"{x:.2f}", ha="center", fontsize=13, color=INK)
        a.set_yticks([])
    fig.tight_layout(); save(fig, "ch9_fairness")

    # differential privacy noise vs epsilon
    from math import log
    eps = [.1, .25, .5, 1]; true = 1000
    fig, ax = plt.subplots(figsize=(6, 3.6))
    for e, c in zip(eps, [CORAL, AMBER, TEAL, INK]):
        x = np.linspace(960, 1040, 400); b = 1 / e; ax.plot(x, np.exp(-np.abs(x - true) / b) / (2 * b), color=c, lw=2.5, label=f"ε = {e}")
    ax.set_xlabel("released count (true = 1000)"); ax.set_yticks([]); ax.legend(fontsize=11); ax.set_title("Laplace mechanism: smaller ε → more noise, more privacy", fontsize=12.5)
    fig.tight_layout(); save(fig, "ch9_dp")

    # stream sliding window/ reservoir
    fig, ax = plt.subplots(figsize=(7, 2.4))
    for i in range(22):
        c = TEAL if 12 <= i < 19 else "#D4DEE3"; ax.add_patch(FancyBboxPatch((i * .45, 0), .36, .5, boxstyle="round,pad=0.01,rounding_size=0.06", fc=c, ec="none"))
    ax.add_patch(Rectangle((12 * .45 - .06, -.1), 7 * .45 + .03, .7, fill=False, ec=CORAL, lw=2.4))
    ax.text(12 * .45 + 1.4, .8, "sliding window W", color=CORAL, fontsize=13, ha="center")
    ax.annotate("", xy=(10.2, .25), xytext=(9.5, .25), arrowprops=dict(arrowstyle="->", color=SLATE, lw=2)); ax.text(9.0, -.45, "new items arrive →", fontsize=12, color=SLATE)
    ax.text(0, -.45, "expired items discarded", fontsize=12, color=SLATE)
    ax.set_xlim(-.2, 10.6); ax.set_ylim(-.7, 1.1); clean(ax)
    save(fig, "ch9_stream")

    # LLM-era benchmark illustrative? -> trend of papers: use generic "AutoML search" curve
    it = np.arange(1, 101); best = np.maximum.accumulate(.78 + .14 * (1 - np.exp(-it / 25)) + rng.normal(0, .015, 100))
    fig, ax = plt.subplots(figsize=(6, 3.6))
    ax.scatter(it, .78 + .14 * (1 - np.exp(-it / 25)) + rng.normal(0, .03, 100), s=12, color=TEAL2, label="trial score")
    ax.plot(it, best, color=CORAL, lw=2.6, label="best so far")
    ax.set_xlabel("trial (Bayesian optimisation)"); ax.set_ylabel("validation AUC"); ax.legend(fontsize=11, loc="lower right")
    fig.tight_layout(); save(fig, "ch9_automl")

    # MapReduce word count diagram
    fig, ax = plt.subplots(figsize=(9.6, 3.9))
    def box(x, y, w, h, t, c, fs=11.5, tc="white"):
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.08", fc=c, ec="none")); ax.text(x + w / 2, y + h / 2, t, ha="center", va="center", fontsize=fs, color=tc, weight="bold")
    splits = ["tree rule tree", "rule data", "data tree"]
    for i, s in enumerate(splits): box(0, 2.6 - i * 1.15, 1.9, .8, s, SLATE)
    maps = ["(tree,1)(rule,1)\n(tree,1)", "(rule,1)\n(data,1)", "(data,1)\n(tree,1)"]
    for i, s in enumerate(maps): box(2.6, 2.6 - i * 1.15, 2.0, .8, s, TEAL)
    shf = ["tree: 1,1,1", "rule: 1,1", "data: 1,1"]
    for i, s in enumerate(shf): box(5.3, 2.6 - i * 1.15, 1.9, .8, s, AMBER, tc=INK)
    red = ["tree 3", "rule 2", "data 2"]
    for i, s in enumerate(red): box(7.9, 2.6 - i * 1.15, 1.5, .8, s, INK)
    for x0, x1 in [(1.9, 2.6), (4.6, 5.3), (7.2, 7.9)]:
        for i in range(3): ax.annotate("", xy=(x1, 3.0 - i * 1.15), xytext=(x0, 3.0 - i * 1.15), arrowprops=dict(arrowstyle="->", color="#9AA7B2", lw=1.6))
    for x, t in [(.95, "Input splits"), (3.6, "Map"), (6.25, "Shuffle & sort"), (8.65, "Reduce")]: ax.text(x, 3.65, t, ha="center", fontsize=13, color=INK, weight="bold")
    ax.set_xlim(-.1, 9.5); ax.set_ylim(-.1, 3.95); clean(ax)
    save(fig, "ch9_mapreduce")


if __name__ == "__main__":
    which = sys.argv[1:] or ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
    for w in which:
        globals()["ch" + w](); print("done ch", w)
