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

// { [nip21: `nostr:${string}`]: Event<number> }[] を返す
const fetchResourceEvents = async (document) => {
  const nip21s = [
    ...document.querySelectorAll(
      "script[src^='nostr:'], link[href^='nostr:'], img[src^='nostr:']"
    ),
  ].map((el) => el.src || el.href);

  const pool = new window.NostrTools.SimplePool();
  const filters = nip21s.map(createFilter);
  const events = await pool.list(relays, filters);
  await pool.close(relays);

  return nip21s.reduce((acc, obj) => {
    const { type, data } = window.NostrTools.nip21.parse(obj).decoded;
    const event = events.find((event) =>
      type === "nevent"
        ? event.id == data.id
        : event.kind == data.kind &&
          event.pubkey == data.pubkey &&
          findTag(event, "d")[1] == data.identifier
    );
    return { ...acc, [obj]: event };
  }, {});
};
