const createRenderer = (event) =>
  renderers.find((renderer) => renderer.canRender(event));

const chessRenderer = {
  canRender: (event) => event.kind == 64,
  render: async (event) => ({
    content: `<!DOCTYPE html>
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
</html>`,
  }),
};

const htmlContentRenderer = {
  canRender: (event) => event.kind == 5392 || event.kind == 35392,
  render: async (event) => {
    const normalizeHtml = async (event) => {
      const doc = new DOMParser().parseFromString(event.content, "text/html");
      await convertNip21sToResource(doc);
      return unescapeXML(new XMLSerializer().serializeToString(doc));
    };

    return {
      content: await normalizeHtml(event),
    };
  },
};

const imageRenderer = {
  canRender: (event) =>
    (event.kind == 1063 || event.kind == 1064) &&
    findTag(event, "m")[1].startsWith("image/"),
  render: async (event) => {
    const mimeType = findTag(event, "m")[1];
    const url =
      event.kind == 1063
        ? findTag(event, "url")[1]
        : `data:${mimeType};base64,${event.content}`;
    return {
      content: `<!DOCTYPE html>
<html class="h-full m-0 p-0 w-full">
  <head>
    <script src="https://cdn.tailwindcss.com"><\/script>
  <\/head>
  <body class="h-full m-0 p-0 w-full bg-black">
    <img src="${url}" class="w-full h-full object-scale-down" \/>
  <\/body>
<\/html>`,
    };
  },
};

const longContentRenderer = {
  canRender: (event) => event.kind == 30023,
  render: async (event) => {
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
    return {
      content: await loadOracolo(event),
      uriFragmentIdentifier: event.id,
    };
  },
};

const wikiRenderer = {
  canRender: (event) => event.kind == 30818,
  render: async (event) => {
    const document = new DOMParser().parseFromString(
      await (await fetch("../wiki-article/dist/index.html")).text(),
      "text/html"
    );
    const usage = document.querySelector("meta[name='usage']");
    const wikilinkPrefix = document.querySelector(
      "meta[name='wikilink-prefix']"
    );
    usage.setAttribute("content", "false");
    wikilinkPrefix.setAttribute("content", "nostr:");
    const content = unescapeXML(
      new XMLSerializer().serializeToString(document)
    );

    return {
      content,
      uriFragmentIdentifier: window.NostrTools.nip19.neventEncode({
        id: event.id,
      }),
    };
  },
};

const renderers = [
  chessRenderer,
  htmlContentRenderer,
  imageRenderer,
  longContentRenderer,
  wikiRenderer,
];

module.exports = createRenderer;
