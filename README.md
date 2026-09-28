# QR Studio — QR Code Generator

A modern, responsive QR-code generator built with plain HTML, CSS and JavaScript.

## Features

- Website URL QR codes
- Plain text / information
- Email QR codes
- Phone QR codes
- Wi-Fi QR codes
- Location QR codes
- Small image-to-QR encoding
- Live QR generation
- Foreground/background customization
- QR size selection
- PNG download
- Copy QR to clipboard
- Responsive desktop/mobile design
- No backend required
- No user account required

## Run

1. Extract the project.
2. Open `index.html` in a modern browser.
3. Start generating QR codes.

The project uses the `qrcodejs` library from cdnjs, so an internet connection is needed when loading the page.

## Important image note

A QR code has limited data capacity. An image is converted to a Base64 data URL, which can become very large. For reliable image QR codes, use a small/compressed image. For production image sharing, a better architecture is to upload the image to storage and put its public URL into the QR code.
