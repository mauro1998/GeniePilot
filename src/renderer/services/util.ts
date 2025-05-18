// eslint-disable-next-line import/prefer-default-export
export function base64ToFile(
  base64String: string,
  filename: string,
  mimeType: string,
): File {
  const arr = base64String.split(',');
  const bstr = atob(arr[1]);
  const len = bstr.length;
  const u8arr = new Uint8Array(len);

  for (let i = 0; i < len; i += 1) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new File([u8arr], filename, { type: mimeType });
}
