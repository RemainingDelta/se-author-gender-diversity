# Phase 3 — Limitations

## Gender Inference

Our means of assigning author gender relies exclusively on the **Genderize** platform, which is not completely reliable. Genderize gets a large amount of its name data from the United States, with substantially less representation from countries outside of Europe and the Americas. When tested against a random sample of `100` authors, we found that Genderize achieved a `90%` accuracy rate when inferring gender. Of the names that were incorrectly assigned, four out of seven were of East Asian origin. All of the names that were completely unknown to Genderize were of Middle Eastern/South Asian origin. This means that our results should not be taken as a concrete breakdown, but rather an estimate of the landscape as a whole.

We are also constrained by the binary portrayal of gender through Genderize, as the API's output is restricted to a female and male option, with a confidence percentage to serve as a scale. Because of this, our gender assignment of authors is limited to four options: **"female-presenting," "male-presenting," "unclassified,"** and **"unknown."** The majority of authors are categorized as either **female-presenting** or **male-presenting**, according to the Genderize output. Those with less than a `70%` confidence rating are categorized as **unclassified**, in order to mitigate false assignments. Below this level, the name-gender association becomes ambiguous enough that forced classification would introduce more error than excluding the name entirely, and a label of "unclassified" is more honest than a likely-wrong assignment. Only `8.5%` of names fall below this threshold, so we believe it to be a reasonable measure taken to promote the integrity of our results. Finally, authors with names that Genderize does not recognize at all are categorized as **unknown**.

## Topic Data

In finding the topic data associated with each paper and author, **OpenAlex** did not always provide an accurate primary topic for a given paper. Additionally, some papers differed in name between **DBLP** and **OpenAlex**, making the corresponding topic data unusable to us. To quantify this, we manually validated a random sample of **300 papers** across all four venues. Of these, **60%** had a clearly accurate topic assignment, **33%** had a debatable assignment (plausible but not the most precise label), and **7%** were clearly incorrect. As a result, topic-level findings should be treated as indicative rather than definitive. Broad patterns are likely reliable, but individual topic rankings may be affected by misclassification.

## Data Gaps

Although our data spans each year from **2008–2023**, certain conferences do not have data available on DBLP for some of these years. Namely, `ECSA` lacks data for **2009** and **2012**, and `ICSME` lacks data before **2014**.

In the case of `ECSA`, it was held jointly with the Working IEEE/IFIP Conference on Software Architecture (`WICSA`) in 2009 and 2012, meaning that it has no standalone data for those years. Prior to 2014, `ICSME` was known as the International Conference on Software Maintenance (`ICSM`), meaning that no conferences under the name `ICSME` exist until 2014 onwards. We chose not to include papers from the `ECSA/WICSA` joint conferences and `ICSM` conferences as we believe that doing so would only introduce confusion into the results.
