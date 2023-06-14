import fs from "node:fs/promises";

import log from "fancy-log";
import gulp from "gulp";
import tap from "gulp-tap";
import JSONC from "jsonc-parser";
import { massageConfig } from "renovate/dist/config/massage.js";
import { migrateConfig } from "renovate/dist/config/migration.js";
import { validateConfig } from "renovate/dist/config/validation.js";
import File from "vinyl";

const { src, dest, series, parallel } = gulp;

const SOURCE_DIR = "src";
const SOURCE_OPTIONS = { dot: true };
const DEST_DIR = "dist";

const JSONC_PATTERNS = [`${SOURCE_DIR}/**/*.jsonc`];
const STATIC_PATTERNS = [`${SOURCE_DIR}/**`, `!${SOURCE_DIR}/**/*.jsonc`];
const PRESET_PATTERNS = [`${DEST_DIR}/**/*.json`];

/**
 * @param {File} file JSONC file object
 */
const transformJsoncFile = (file) => {
  log.info(`Transforming JSONC file '${file.path}'`);

  file.contents = Buffer.from(
    JSON.stringify(JSONC.parse(file.contents.toString()), undefined, 2)
  );
  file.extname = ".json";
};

/**
 * Validate Renovate preset; copied and modified from
 * <https://github.com/renovatebot/renovate/blob/ec06c2376f3b92a996292ee85bc3c1f878e522af/lib/config-validator.ts#L19>.
 *
 * @param {File} file preset JSON file object
 */
const validatePreset = async (file) => {
  log.info(`Validating preset JSON file '${file.path}'`);

  const config = JSON.parse(file.contents.toString());

  const { isMigrated, migratedConfig } = migrateConfig(config);
  if (isMigrated) {
    log.warn(
      `${file.path}: config migration is necessary; see https://docs.renovatebot.com/configuration-options/#configmigration`
    );
  }

  const massagedConfig = massageConfig(migratedConfig);

  let failuresExist = false;
  const { errors, warnings } = await validateConfig(massagedConfig, true);
  if (errors.length > 0) {
    log.error(`${file.path}: encountered ${errors.length} error(s):`, errors);
    failuresExist = true;
  }
  if (warnings.length > 0) {
    log.warn(
      `${file.path}: encountered ${warnings.length} warning(s):`,
      warnings
    );
    failuresExist = true;
  }
  if (failuresExist) {
    throw new Error(
      `${file.path}: encountered 1 or more validation failures; see logs above for details`
    );
  }
};

const copyStaticResources = () =>
  src(STATIC_PATTERNS, SOURCE_OPTIONS).pipe(dest(DEST_DIR));

const transformJsoncFiles = () =>
  src(JSONC_PATTERNS, SOURCE_OPTIONS)
    .pipe(tap(transformJsoncFile))
    .pipe(dest(DEST_DIR));

export const build = parallel(copyStaticResources, transformJsoncFiles);

export const clean = async () => {
  await fs.rm(DEST_DIR, {
    recursive: true,
    force: true,
  });
};

export const validate = () =>
  src(PRESET_PATTERNS, SOURCE_OPTIONS).pipe(tap(validatePreset));

export const fullBuild = series(clean, build);

export default build;
