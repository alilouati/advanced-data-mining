# Advanced Data Mining — M.Sc. in Data Science

**Instructor:** Dr. Ali Louati, Associate Professor · Department of Information Systems · Prince Sattam Bin Abdulaziz University · a.louati@psau.edu.sa

Course materials for the 2026–2027 edition: nine slide decks with speaker notes, plus Python labs that open directly in Google Colab.

## Chapters and labs

| # | Chapter | Slides | Lab |
|---|---------|--------|-----|
| 1 | The Modern Data Mining Landscape | [pptx](slides/Ch1_The_Modern_Data_Mining_Landscape.pptx) | — |
| 2 | Data Understanding & Preprocessing | [pptx](slides/Ch2_Data_Understanding_Preprocessing.pptx) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/alilouati/advanced-data-mining/blob/main/labs/Lab02_EDA_and_Preprocessing.ipynb) EDA & preprocessing |
| 3 | Classification & Rigorous Evaluation | [pptx](slides/Ch3_Classification_Rigorous_Evaluation.pptx) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/alilouati/advanced-data-mining/blob/main/labs/Lab03_Classification_and_Evaluation.ipynb) Classification & evaluation |
| 4 | Trees, Rules & Ensembles | [pptx](slides/Ch4_Trees_Rules_Ensembles.pptx) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/alilouati/advanced-data-mining/blob/main/labs/Lab04_Decision_Trees_and_Ensembles.ipynb) Trees & ensembles |
| 5 | Clustering | [pptx](slides/Ch5_Clustering.pptx) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/alilouati/advanced-data-mining/blob/main/labs/Lab05_Clustering.ipynb) Clustering |
| 6 | Anomaly Detection & Time-Series Mining | [pptx](slides/Ch6_Anomaly_Detection_Time_Series_Mining.pptx) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/alilouati/advanced-data-mining/blob/main/labs/Lab06_Anomaly_Detection_and_Time_Series.ipynb) Anomalies & time series |
| 7 | Trustworthy, Scalable & LLM-Driven Data Mining | [pptx](slides/Ch7_Trustworthy_Scalable_LLM_Driven_Data_Mining.pptx) | — |
| 8 | Text, Graph & Representation Mining | [pptx](slides/Ch8_Text_Graph_Representation_Mining.pptx) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/alilouati/advanced-data-mining/blob/main/labs/Lab08_Text_and_Graph_Mining.ipynb) Text & graph mining |
| 9 | Association Rules & Sequential Patterns | [pptx](slides/Ch9_Association_Rules_Sequential_Patterns.pptx) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/alilouati/advanced-data-mining/blob/main/labs/Lab09_Association_Rules.ipynb) Association rules |

## How to run a lab

1. Click **Open in Colab** (or in Colab: *File → Open notebook → GitHub*, tick **Include private repos**, and search `alilouati/advanced-data-mining`).
2. Run the cells from top to bottom with `Shift + Enter`.
3. Every lab works with a built-in data set. To use your own data, set `USE_MY_CSV = True` and upload a CSV file.
4. Cells marked ✏️ are meant to be changed; each lab ends with short exercises.

The labs need only standard libraries (see `requirements.txt`), all pre-installed on Colab. To run locally: `pip install -r requirements.txt` and open the notebooks in Jupyter.

> This repository is **private**. Students need to be added as collaborators (or via a GitHub Classroom organisation) for the Colab links to work.

## Repository layout

```
slides/                  9 PowerPoint decks (16:9, speaker notes included)
labs/                    Colab-ready Jupyter notebooks
```

## Main references

- Han, J., Pei, J., & Tong, H. (2022). *Data Mining: Concepts and Techniques* (4th ed.). Morgan Kaufmann.
- Tan, P.-N., Steinbach, M., Karpatne, A., & Kumar, V. (2019). *Introduction to Data Mining* (2nd ed.). Pearson.
- Leskovec, J., Rajaraman, A., & Ullman, J. D. (2020). *Mining of Massive Datasets* (3rd ed.). Cambridge University Press.
- Aggarwal, C. C. (2015). *Data Mining: The Textbook*. Springer.

© Dr. Ali Louati. All rights reserved unless stated otherwise.
