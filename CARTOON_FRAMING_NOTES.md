# Cartoon Characters framing notes

## Source inventory

The supplied `cartoon4x5_images.zip` contains **123 WebP images**, all measured at **1024 × 1280 pixels** in RGB mode. The source ratio is already 4:5, matching the card artwork slot.

## Visual inspection

The generated contact sheet at `/home/ubuntu/cartoon_preview/cartoon_contact_sheet.jpg` shows the characters already framed inside their 4:5 canvases. The set contains a mixture of full-body, bust, and scene compositions, but no sheet fragments or blank source tiles were found in the contact-sheet pass.

## Processing decision

Because the source files already match the target aspect ratio, the Cartoon pipeline should preserve the original artwork rather than apply an aggressive subject mask or re-crop. The app should use a Cartoon-specific contained image treatment so the whole illustration remains visible. Each filename stem remains the stable displayed character name, including names with spaces and punctuation.

## Scope protection

This pass must not modify the hosted registry or presentation rules for **Animals** or **Fictional Characters**.
