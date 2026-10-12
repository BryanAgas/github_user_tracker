# Birgitte Lund: prototype

A working prototype of Birgitte's digital art world. Static HTML, CSS and JS with no build step.

    python3 -m http.server -d birgitte 8000   # then open http://localhost:8000

## What is real
Everything comes from Birgitte's current prototype site: the series *The Spirit of Strange Flowers*,
her statement, her portrait, and per-work size, price and availability.
Nothing else is invented. Where a fact is unknown the interface is designed around the gap:
- Artwork No. 16 has no price, so it shows "Price on request" and an enquiry button.
- Only Artwork No. 9 has a story and a medium, so other works simply omit those rows.
- No sales, exhibitions or biography are claimed. The Studio inbox starts empty.

## What is not final
- Nine of the 19 works are shown. They are crops from screenshots, so zoom is soft. Replace `assets/works/*.jpg` with originals.
- Danish UI strings need a native read-through. Her own texts are not translated.
- State lives in the browser's localStorage. No payment is taken.
