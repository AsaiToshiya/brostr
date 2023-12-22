const fs = require("fs");
const path = require("path");
const convertNip21sToResource = require("./convertNip21sToResource");

test("convertNip21sToResource", async () => {
  fetchResourceEvents = async () =>
    new Promise((resolve) =>
      resolve({
        "nostr:nevent1qqs80d0qgm7ktfjpy425dnsanshfadhmn95p72wkp32we9r2pcza7usjfwz6x":
          {
            "content": "body {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0;\n}\n\nh1 {\n  color: green;\n}\n",
            "created_at": 1695309613,
            "id": "77b5e046fd65a641255546ce1d9c2e9eb6fb99681f29d60c54ec946a0e05df72",
            "kind": 5393,
            "pubkey": "0a2f19dc1a185792c3b0376f1d7f9971295e8932966c397935a5dddd1451a25a",
            "sig": "7f04443ab552655cc93858bfac9cc6125b7617ea93ff772565797d722b3ed123c5e02e04fe1c40b04830c74ad6739c435c0e0c965e803d67d50c890fa3a8bc13",
            "tags": []
          },
        "nostr:nevent1qqszdt2y9vwwj7d6deget8ca4kaw0y4xv8ne8pf8f7478xdt08xrzjq5w2d70":
          {
            "content": "const heading = document.querySelector('h1');\nlet colorChangeInterval;\n\nfunction changeColor() {\n  const randomColor = getRandomColor();\n  heading.style.color = randomColor;\n}\n\nfunction getRandomColor() {\n  const letters = '0123456789ABCDEF';\n  let color = '#';\n  for (let i = 0; i < 6; i++) {\n    color += letters[Math.floor(Math.random() * 16)];\n  }\n  return color;\n}\n\nwindow.onload = () => {\n  colorChangeInterval = setInterval(changeColor, 1000);\n};\n\nsetTimeout(() => {\n  clearInterval(colorChangeInterval);\n}, 10000);\n",
            "created_at": 1695309559,
            "id": "26ad442b1ce979ba6e51959f1dadbae792a661e79385274fabe399ab79cc3148",
            "kind": 5394,
            "pubkey": "0a2f19dc1a185792c3b0376f1d7f9971295e8932966c397935a5dddd1451a25a",
            "sig": "69fdd410dc110ac250419f441638f6ff38d89e0f23ec210f8bb4a19c6d7be175a1f50aa82923e0238995b365cb4e4c2ae4233533d3e2a6d8dee027ffdbe164e6",
            "tags": []
          },
        "nostr:nevent1qqsypy6xsy09aaxpn94lmv4ywxnxkq2cn64ud45t60duny749ph3tgqzyq9z7xwurgv90ykrkqmk78tln9cjjh5fx2txcwtexkjamhg52x395qcyqqqqgfc22qmwm":
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
          },
      })
    );

  document.body.innerHTML = fs.readFileSync(
    path.resolve(__dirname, "../examples/index.html"),
    "utf8"
  );

  await convertNip21sToResource(document);

  expect(document.querySelector("link").href).toEqual(
    "data:text/css;base64,Ym9keSB7CiAgZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmOwogIGJhY2tncm91bmQtY29sb3I6ICNmMGYwZjA7Cn0KCmgxIHsKICBjb2xvcjogZ3JlZW47Cn0K"
  );
  expect(document.querySelector("img").src).toEqual(
    "https://i.nostrimg.com/c542a9b878b648e72dc93730fd89caf537733d1e56718721a538242c9478d797/file.jpg"
  );
  expect(document.querySelector("script").src).toEqual(
    "data:text/javascript;base64,Y29uc3QgaGVhZGluZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2gxJyk7CmxldCBjb2xvckNoYW5nZUludGVydmFsOwoKZnVuY3Rpb24gY2hhbmdlQ29sb3IoKSB7CiAgY29uc3QgcmFuZG9tQ29sb3IgPSBnZXRSYW5kb21Db2xvcigpOwogIGhlYWRpbmcuc3R5bGUuY29sb3IgPSByYW5kb21Db2xvcjsKfQoKZnVuY3Rpb24gZ2V0UmFuZG9tQ29sb3IoKSB7CiAgY29uc3QgbGV0dGVycyA9ICcwMTIzNDU2Nzg5QUJDREVGJzsKICBsZXQgY29sb3IgPSAnIyc7CiAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHsKICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTYpXTsKICB9CiAgcmV0dXJuIGNvbG9yOwp9Cgp3aW5kb3cub25sb2FkID0gKCkgPT4gewogIGNvbG9yQ2hhbmdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChjaGFuZ2VDb2xvciwgMTAwMCk7Cn07CgpzZXRUaW1lb3V0KCgpID0+IHsKICBjbGVhckludGVydmFsKGNvbG9yQ2hhbmdlSW50ZXJ2YWwpOwp9LCAxMDAwMCk7Cg=="
  );
});

test("kind 1064", async () => {
  fetchResourceEvents = async () =>
    new Promise((resolve) =>
      resolve({
        "nostr:nevent1qqswkp8vt4ucp6wjazhxd7dvy3cv2vkr06wglv4vzh8u6jesraahamq7n6hp6":
          {
            "kind": 1064,
            "created_at": 1703169605,
            "tags": [
              [
                "type",
                "image/jpeg"
              ],
              [
                "p",
                "0a2f19dc1a185792c3b0376f1d7f9971295e8932966c397935a5dddd1451a25a"
              ]
            ],
            "content": "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
            "pubkey": "0a2f19dc1a185792c3b0376f1d7f9971295e8932966c397935a5dddd1451a25a",
            "id": "eb04ec5d7980e9d2e8ae66f9ac2470c532c37e9c8fb2ac15cfcd4b301f7b7eec",
            "sig": "bf92b3e13de832e6fb91368a8a9cad3c979014b86df90bf4ca08426876f179bbcb3571729275e92edcc8722979fd4edc975aa77a146ef4d524d7c5b2db8d02ab"
          },
      })
    );

  document.body.innerHTML =
    '<img src="nostr:nevent1qqswkp8vt4ucp6wjazhxd7dvy3cv2vkr06wglv4vzh8u6jesraahamq7n6hp6">';

  await convertNip21sToResource(document);

  expect(document.querySelector("img").src).toEqual(
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
  );
});
