const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");

const EXPORTED_SYMBOLS = ["Config"];

const TELEMETRY_ENV_PREF = "extensions.pioneer-online-news.telemetryEnv";
const LOG_INTERVAL_PREF = "extensions.pioneer-online-news.logSubmissionInterval";
const LOG_UPLOAD_ATTEMPT_PREF = "extensions.pioneer-online-news.logUploadAttemptInterval";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const Config = {
  addonId: "pioneer-online-news-log-recovery@pioneer.mozilla.org",
  studyName: "online-news",
  branches: [
    { name: "default", weight: 1 },
  ],
  telemetryEnv: Services.prefs.getCharPref(TELEMETRY_ENV_PREF, "prod"),

  logSubmissionInterval: Services.prefs.getIntPref(LOG_INTERVAL_PREF, 1 * DAY),
  logUploadAttemptInterval: Services.prefs.getIntPref(LOG_UPLOAD_ATTEMPT_PREF, 3 * HOUR),
};
