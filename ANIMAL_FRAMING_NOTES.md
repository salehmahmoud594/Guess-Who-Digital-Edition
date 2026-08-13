# Animal Card Framing Notes

The supplied archive contains 88 PNG files, not 120. The filenames are unique and retain the stable animal reference names, including their source suffixes such as `Alligator_11_4` and `Bear_10_1`.

The source files are tall portrait canvases in two main sizes, approximately `512×1292` and `455×1476`. Each contains a peach illustration panel surrounded by an outer cream matte and a thin inner keyline. A plain `object-fit: cover` treatment would either preserve unwanted matte or crop the subject unpredictably.

The animal preparation pass therefore detects the panel boundaries, derives a local peach background color, isolates the illustrated subject by color distance, removes the outer matte/keyline, and exports a consistent `640×800` 4:5 PNG. The processed Alligator sample was visually checked: the subject is large, clear, and free of the source's white vertical keyline.

During the batch review, several `455×1476` source files were found to include a narrow strip of a neighboring sheet column on the far left. The preparation script now selects the longest contiguous peach-panel run on both axes before subject masking, so those neighboring strips are excluded rather than being carried into the final card.

Fictional Characters are intentionally untouched. Their registry, hosted URLs, names, and current card presentation remain separate from this animal-only pipeline.

## Corrective audit — user-reported failure

The supplied screenshot was reproduced at the asset level. `Rabbit_4_6.png` in the source archive contains a complete, clear rabbit illustration, while the processed `640×800` export is almost entirely flat peach with only two small black fragments. This proves the primary failure is not the card CSS alone: the current subject-color masking/reconstruction step is deleting legitimate animal pixels before the browser renders them. The corrective pass must preserve the original illustration and only remove the outer matte/keyline; it must not rebuild the artwork from a foreground mask.

The second audit found a related panel-detection failure. `Horse_19_6.png` and `Bird_19_4.png` are valid tall illustrations whose peach panel runs almost to the right edge, but the current row-run heuristic chooses a narrow `x` interval whenever the animal interrupts the sampled row. The resulting crop can exclude most of the source artwork. Panel detection must therefore be based on stable outer matte boundaries and image edges, not on the longest uninterrupted background-color run through the illustration.

The revised edge-based detector now reports broad panel bounds for the audited samples: Rabbit `(28,32)-(496,1089)`, Moose `(47,61)-(503,1176)`, Horse `(42,20)-(449,1457)`, and Bird `(27,20)-(436,1456)`. The regenerated `Rabbit_4_6` export visibly contains the complete rabbit and no longer collapses into a flat peach tile. The export now copies original pixels around the detected subject and uses the sampled peach color only for safe 4:5 padding.
