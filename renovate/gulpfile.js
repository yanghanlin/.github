import fs from "fs/promises";

import JSONC from "jsonc-parser";
import gulp from "gulp";
import transform from "gulp-transform";
import rename from "gulp-rename";

const { src, dest, series, parallel } = gulp;

const SOURCE_DIR = "src";
const SOURCE_ENCODING = "utf-8";
const SOURCE_OPTIONS = { dot: true };
const DEST_DIR = "dist";

const JSONC_PATTERNS = [`${SOURCE_DIR}/**/*.jsonc`];
const STATIC_PATTERNS = [`${SOURCE_DIR}/**`, `!${SOURCE_DIR}/**/*.jsonc`];

const copyStaticResources = () =>
  src(STATIC_PATTERNS, SOURCE_OPTIONS).pipe(dest(DEST_DIR));

const transformJsoncFiles = () =>
  src(JSONC_PATTERNS, SOURCE_OPTIONS)
    .pipe(
      transform(SOURCE_ENCODING, (contents) =>
        JSON.stringify(JSONC.parse(contents), undefined, 2)
      )
    )
    .pipe(rename({ extname: ".json" }))
    .pipe(dest(DEST_DIR));

export const build = parallel(copyStaticResources, transformJsoncFiles);

export const clean = async () => {
  await fs.rm(DEST_DIR, {
    recursive: true,
    force: true,
  });
};

export const fullBuild = series(clean, build);

export default build;
