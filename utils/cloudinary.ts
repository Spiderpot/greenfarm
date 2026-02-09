export function optimizeImage(url: string, width = 800) {
  if (!url) return "";

  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${width}/`
  );
}
