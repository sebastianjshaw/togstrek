import { togstrekMediaUrl } from "@/config/togstrek-media";

/** CDN paths mirror Squarespace `_files` basenames under `adventures/`. */
export function togstrekAdventuresImage(filename: string): string {
  return togstrekMediaUrl(`adventures/${filename}`);
}

export const TOGSTREK_ADVENTURES_HERO_IMAGE_FILE = "Gentoo+Penguins-0010.jpg";
