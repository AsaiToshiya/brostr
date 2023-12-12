const convertNip21sToResource = async (document) => {
  const events = await fetchResourceEvents(document);

  [
    ...document.querySelectorAll(
      "script[src^='nostr:'], link[href^='nostr:']"
    ),
  ].forEach((el) => {
    const nip21 = el.src || el.href;
    const event = events[nip21];
    const data = btoa(unescape(encodeURIComponent(event.content)));
    el.src && (el.src = `data:text/javascript;base64,${data}`);
    el.href && (el.href = `data:text/css;base64,${data}`);
  });
  [...document.querySelectorAll("img[src^='nostr:']")].forEach((img) => {
    const nip21 = img.src;
    const event = events[nip21];
    const typeTag = findTag(event, "type");
    event?.kind == 1063
      ? (img.src = findTag(event, "url")[1])
      : typeTag &&
        (img.src = `data:${typeTag[1]};base64,${event.content}`);
  });
};

const findTag = (event, tagName) =>
  event?.tags.find((tag) => tag[0] == tagName);

module.exports = convertNip21sToResource;
