# Phase 3 — Limitations

## Paper Excerpt

Our means of assigning author gender relies exclusively on the **Genderize** platform, which is not completely reliable. Genderize gets a large amount of its name data from the **United States**, with substantially less representation from countries outside of **Europe** and **the Americas**. When tested against a random sample of `100` authors, we found that Genderize achieved a `90%` accuracy rate when inferring gender. Of the names that were incorrectly assigned, four out of seven were of **East Asian** origin. All of the names that were completely unknown to Genderize were of **Middle Eastern/South Asian** origin. This means that our results should not be taken as a concrete breakdown, but rather an estimate of the landscape as a whole. 

In finding the topic data associated with each paper and author, **OpenAlex** did not always provide an accurate **primary topic** for a given paper. Additionally, some papers differed in name between **DBLP** and **OpenAlex**, making the corresponding **topic data** unusable to us. As a result, topic data may not be completely accurate, but again should be treated as a general picture. 

We are also constrained by the binary portrayal of gender through Genderize, as the API’s output is restricted to a **female** and **male** option, with a **confidence percentage** to serve as a scale. We attempt to accommodate non-binary individuals by denoting guesses with less than `70%` confidence as `unclassified` in terms of gender, but this is an imperfect solution that does not distinguish between **confidently androgynous names** and **truly unconfident guesses**. 
