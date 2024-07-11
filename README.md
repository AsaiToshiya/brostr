<p align="center">
  <img src="brostr.png" width="218">
</p>

<h1 align="center">Brostr</h1>

<p align="center">A native browser for the content on Nostr.</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.5.0-blue">
</p>

## Features

- Direct access to the content on Nostr without the web server.
- A standardized behavior for various contents.

## Supported NIPs

- [NIP-01: Basic protocol flow description][NIP-01] (Powered by [nocomment][nocomment])
- [NIP-19: bech32-encoded entities][NIP-19]
- [NIP-21: `nostr:` URI scheme][NIP-21]
- [NIP-23: Long-form Content][NIP-23] (Powered by [Oracolo][Oracolo])
- [NIP-48: Proxy Tags][NIP-48] (Experimental support)
- [NIP-64: Chess (Portable Game Notation)][NIP-64] (Draft NIP, Powered by [JS PGN Viewer][JS PGN Viewer])
- [NIP-94: File Metadata][NIP-94]
- [NIP-95: Storage and Shared File][NIP-95] (Draft NIP)
- [NIP-106: Decentralized Web Hosting on Nostr][NIP-106] (Draft NIP)

[NIP-01]: https://github.com/nostr-protocol/nips/blob/master/01.md
[NIP-19]: https://github.com/nostr-protocol/nips/blob/master/19.md
[NIP-21]: https://github.com/nostr-protocol/nips/blob/master/21.md
[NIP-23]: https://github.com/nostr-protocol/nips/blob/master/23.md
[NIP-48]: https://github.com/nostr-protocol/nips/blob/master/48.md
[NIP-64]: https://github.com/theborakompanioni/nips/blob/nip-64/64.md
[NIP-94]: https://github.com/nostr-protocol/nips/blob/master/94.md
[NIP-95]: https://github.com/frbitten/nostr-nips/blob/NIP-95/95.md
[NIP-106]: https://github.com/studiokaiji/nips/blob/master/106.md
[nocomment]: https://github.com/fiatjaf/nocomment
[Oracolo]: https://github.com/dtonon/oracolo
[JS PGN Viewer]: https://github.com/toomasr/jspgnviewer

## Screenshots

| HTML Content                      | Long-form Content                      | Proxy                      | Image                      | Chess                      | Comments                      |
| --------------------------------- | -------------------------------------- | -------------------------- | -------------------------- | -------------------------- | ----------------------------- |
| ![](screenshots/html-content.png) | ![](screenshots/long-form-content.png) | ![](screenshots/proxy.png) | ![](screenshots/image.png) | ![](screenshots/chess.png) | ![](screenshots/comments.png) |

## Install

Download the binary from the [release page](https://github.com/AsaiToshiya/brostr/releases/latest), or use it directly in the browser without downloading by visiting https://asaitoshiya.github.io/brostr/src/.

## Examples

### HTML (kind `5392`/`35392`)

```json
{
  "id": "b295a7e7aa7acd915c26bbdf460b04f9e0e96a78828298ba88676e5ffa774c62",
  "kind": 5392,
  "pubkey": "0a2f19dc1a185792c3b0376f1d7f9971295e8932966c397935a5dddd1451a25a",
  "created_at": 1697900861,
  "content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Sample Page 1</title>\n  <link rel=\"stylesheet\" href=\"nostr:nevent1qqs80d0qgm7ktfjpy425dnsanshfadhmn95p72wkp32we9r2pcza7usjfwz6x\">\n</head>\n<body>\n  <h1>Hello, Nostr!</h1>\n  <p>This is Sample Page 1.</p>\n  <img src=\"nostr:nevent1qqsypy6xsy09aaxpn94lmv4ywxnxkq2cn64ud45t60duny749ph3tgqzyq9z7xwurgv90ykrkqmk78tln9cjjh5fx2txcwtexkjamhg52x395qcyqqqqgfc22qmwm\"><br />\n  <a href=\"nostr:nevent1qqsvh5utpng3nsfrvmx6ghe2t84eq7prf3ttwu024an6xc8ar0sa4lgjnaz5a\">Go to Page 2</a>\n  <script src=\"nostr:nevent1qqszdt2y9vwwj7d6deget8ca4kaw0y4xv8ne8pf8f7478xdt08xrzjq5w2d70\"></script>\n</body>\n</html>\n",
  "tags": [],
  "sig": "19e05d123901bfdb7f4ba6dd4ccbb31963148d1ea49733d7d042926870d4bf6d72fc34be7be7843decf9e56acd891375dac27496376f5fe2c7f8d61b83b1132b"
}
```

### CSS (kind `5393`/`35393`)

```json
{
  "content": "body {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0;\n}\n\nh1 {\n  color: green;\n}\n",
  "created_at": 1695309613,
  "id": "77b5e046fd65a641255546ce1d9c2e9eb6fb99681f29d60c54ec946a0e05df72",
  "kind": 5393,
  "pubkey": "0a2f19dc1a185792c3b0376f1d7f9971295e8932966c397935a5dddd1451a25a",
  "sig": "7f04443ab552655cc93858bfac9cc6125b7617ea93ff772565797d722b3ed123c5e02e04fe1c40b04830c74ad6739c435c0e0c965e803d67d50c890fa3a8bc13",
  "tags": []
}
```

### JavaScript (kind `5394`/`35394`)

```json
{
  "content": "const heading = document.querySelector('h1');\nlet colorChangeInterval;\n\nfunction changeColor() {\n  const randomColor = getRandomColor();\n  heading.style.color = randomColor;\n}\n\nfunction getRandomColor() {\n  const letters = '0123456789ABCDEF';\n  let color = '#';\n  for (let i = 0; i < 6; i++) {\n    color += letters[Math.floor(Math.random() * 16)];\n  }\n  return color;\n}\n\nwindow.onload = () => {\n  colorChangeInterval = setInterval(changeColor, 1000);\n};\n\nsetTimeout(() => {\n  clearInterval(colorChangeInterval);\n}, 10000);\n",
  "created_at": 1695309559,
  "id": "26ad442b1ce979ba6e51959f1dadbae792a661e79385274fabe399ab79cc3148",
  "kind": 5394,
  "pubkey": "0a2f19dc1a185792c3b0376f1d7f9971295e8932966c397935a5dddd1451a25a",
  "sig": "69fdd410dc110ac250419f441638f6ff38d89e0f23ec210f8bb4a19c6d7be175a1f50aa82923e0238995b365cb4e4c2ae4233533d3e2a6d8dee027ffdbe164e6",
  "tags": []
}
```

### Image (kind `1063`/`1064`)

```json
{
  "id": "409346811e5ef4c1996bfdb2a471a66b01589eabc6d68bd3dbc993d5286f15a0",
  "pubkey": "0a2f19dc1a185792c3b0376f1d7f9971295e8932966c397935a5dddd1451a25a",
  "created_at": 1697900670,
  "kind": 1063,
  "tags": [
    [
      "url",
      "https://i.nostrimg.com/c542a9b878b648e72dc93730fd89caf537733d1e56718721a538242c9478d797/file.jpg"
    ],
    [
      "m",
      "image/jpeg"
    ],
    [
      "x",
      "c542a9b878b648e72dc93730fd89caf537733d1e56718721a538242c9478d797"
    ],
    [
      "size",
      "39631"
    ],
    [
      "dim",
      "512x512"
    ],
    [
      "blurhash",
      "UPID,j9uxu%K~VNF-o%1oxs=R*W;-oNNNGkB"
    ]
  ],
  "content": "",
  "sig": "7849442484409bfe5d2edf2d2b0e475e8952538d70f015c67ade3ff7b2e7436fc90514483e772194b92ebc3e72428e5e757740fae4e7b82b2e9fe08dfbd1a142"
}
```

## Development

### Setup

```bash
git clone https://github.com/AsaiToshiya/brostr.git
cd brostr
pnpm install
curl -o oracolo/dist/index.html --create-dirs https://raw.githubusercontent.com/dtonon/oracolo/164bdace1f41da1c8810078003e3258e43b8f9cd/dist/index.html
curl -o nocomment/embed.js --create-dirs https://nocomment.fiatjaf.com/embed.js
curl -OL https://github.com/toomasr/jspgnviewer/releases/download/jspgnviewer-wordpress-0.7.3/pgnviewer-0.7.3.zip
tar -xf pgnviewer-0.7.3.zip
rm pgnviewer-0.7.3.zip
del pgnviewer-0.7.3.zip
```

### Run

```bash
pnpm start
```

## License

    MIT License

    Copyright (c) 2023 Asai Toshiya

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
