/** Runs a draw loop ONLY while the element is on screen and the tab is
 *  visible. Every scene canvas uses this: offscreen chapters cost zero
 *  main-thread time instead of drawing their fullest state forever. */
export function runWhenVisible(
  el: Element,
  loop: (now: number) => void,
): () => void {
  let raf = 0;
  let inView = false;

  const tick = (now: number) => {
    loop(now);
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !document.hidden) start();
      else stop();
    },
    // start a touch early so the scene is alive when it enters
    { rootMargin: "160px" },
  );
  io.observe(el);

  const onVisibility = () => {
    if (document.hidden) stop();
    else if (inView) start();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    stop();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
