// An extension list, but the inverse of the allowlists the scanners dropped: it names what is
// certainly not text rather than guessing what is. A miss here costs one wasted read, which
// the NUL-byte guard at the reading site absorbs; a miss in an allowlist was a file never
// read at all.
const BINARY_EXT =
  /\.(png|jpe?g|gif|webp|avif|ico|bmp|tiff?|pdf|zip|gz|tgz|woff2?|ttf|otf|eot|mp4|webm|mov|mp3|wav|wasm|node|so|dylib|dll|jar)$/i;

export function isBinaryPath(path) {
  return BINARY_EXT.test(path);
}
