const createRenderer = (event) =>
  event.kind == 5392 || event.kind == 35392
    ? renderHtmlContent
    : event.kind == 30023
    ? renderLongFormContent
    : event.kind == 64
    ? renderChess
    : ((event.kind == 1063 || event.kind == 1064) &&
      findTag(event, "m")[1].startsWith("image/"))
    ? renderImage
    : null;

const renderChess = async (event) => {
  iframe.srcdoc = `<!DOCTYPE html>
<html>
  <head>
    <script src="../pgnviewer/jsPgnViewer.js"><\/script>
  </head>
  <body>
    <div
      id="fen1_board"
      style="max-width: 940px; margin-left: auto; margin-right: auto"
    ></div>
    <div id="fen1" style="visibility: hidden; display: none">
      ${event.content}
    </div>
    <script>
      var brd = new Board("fen1", {
        imagePrefix: "../pgnviewer/img/zurich/",
      });
      brd.init();
    <\/script>
  </body>
</html>`;
};

const renderHtmlContent = async (event) => {
  const convertUrlsToProxyUrl = (document, proxyUrl) => {
    [...document.querySelectorAll("script, link, img")]
      .filter((el) => el.getAttribute("src") || el.getAttribute("href"))
      .forEach((el) => {
        const originalValue =
          el.getAttribute("src") || el.getAttribute("href");
        const newUrl = new URL(originalValue, proxyUrl);
        el.src && (el.src = newUrl);
        el.href && (el.href = newUrl);
      });
  };

  const normalizeHtml = async (event) => {
    const proxyTag = findTag(event, "proxy");
    const isWebProxy = proxyTag?.[2] == "web";

    const doc = new DOMParser().parseFromString(
      isWebProxy ? await (await fetch(proxyTag[1])).text() : event.content,
      "text/html"
    );
    isWebProxy
      ? convertUrlsToProxyUrl(doc, proxyTag[1])
      : await convertNip21sToResource(doc);
    return unescapeXML(new XMLSerializer().serializeToString(doc));
  };

  iframe.srcdoc = await normalizeHtml(event);
};

const renderImage = async (event) => {
  const mimeType = findTag(event, "m")[1];
  const url =
    event.kind == 1063
      ? findTag(event, "url")[1]
      : `data:${mimeType};base64,${event.content}`;
  iframe.srcdoc = `<!DOCTYPE html>
<html class="h-full m-0 p-0 w-full">
  <head>
    <script src="https://cdn.tailwindcss.com"><\/script>
  <\/head>
  <body class="h-full m-0 p-0 w-full bg-black">
    <img src="${url}" class="w-full h-full object-scale-down" \/>
  <\/body>
<\/html>`;
};

const renderLongFormContent = async (event) => {
  const loadOracolo = async (event) => {
    const document = new DOMParser().parseFromString(
      await (await fetch("../oracolo/dist/index.html")).text(),
      "text/html"
    );
    const author = document.querySelector("meta[name='author']");
    const relays = document.querySelector("meta[name='relays']");
    const comments = document.querySelector("meta[name='comments']");
    author.setAttribute(
      "value",
      window.NostrTools.nip19.npubEncode(event.pubkey)
    );
    relays.setAttribute("value", defaultRelays.toString());
    comments.setAttribute("value", "");

    return unescapeXML(new XMLSerializer().serializeToString(document));
  };

  iframe.contentWindow.location.replace("about:blank");
  iframe.srcdoc = await loadOracolo(event);
  iframe.contentWindow.location.replace(`about:srcdoc#${event.id}`);
};

module.exports = createRenderer;
