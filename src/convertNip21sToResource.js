const convertNip21sToResource = async (document) => {
  const events = await fetchResourceEvents(document);

  [
    ...document.querySelectorAll(
      "script[src^='nostr:'], link[href^='nostr:'], img[src^='nostr:']"
    ),
  ].forEach((el) => {
    const nip21 = el.src || el.href;
    const event = events[nip21];
    const type =
      event?.kind == 1064
        ? findTag(event, "type")[1]
        : event?.kind == 5393 || event?.kind == 35393
        ? "text/css"
        : event?.kind == 5394 || event?.kind == 35394
        ? "text/javascript"
        : null;
    const base64 =
      event?.kind == 1064
        ? event.content
        : event?.kind == 5393 ||
          event?.kind == 35393 ||
          event?.kind == 5394 ||
          event?.kind == 35394
        ? btoa(unescape(encodeURIComponent(event.content)))
        : null;
    const value =
      event?.kind == 1063
        ? findTag(event, "url")[1]
        : `data:${type};base64,${base64}`;
    el.src && (el.src = value);
    el.href && (el.href = value);
  });
};

const findTag = (event, tagName) =>
  event?.tags.find((tag) => tag[0] == tagName);

module.exports = convertNip21sToResource;
