/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "AddonManager", "resource://gre/modules/AddonManager.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "Config", "resource://pioneer-online-news-log-recovery/Config.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "LogHandler", "resource://pioneer-online-news-log-recovery/lib/LogHandler.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "NewsIndexedDB", "resource://pioneer-online-news-log-recovery/lib/NewsIndexedDB.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "Pioneer", "resource://pioneer-online-news-log-recovery/lib/Pioneer.jsm"
);


const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const REASONS = {
  APP_STARTUP:      1, // The application is starting up.
  APP_SHUTDOWN:     2, // The application is shutting down.
  ADDON_ENABLE:     3, // The add-on is being enabled.
  ADDON_DISABLE:    4, // The add-on is being disabled. (Also sent during uninstallation)
  ADDON_INSTALL:    5, // The add-on is being installed.
  ADDON_UNINSTALL:  6, // The add-on is being uninstalled.
  ADDON_UPGRADE:    7, // The add-on is being upgraded.
  ADDON_DOWNGRADE:  8, // The add-on is being downgraded.
};
const UI_AVAILABLE_NOTIFICATION = "sessionstore-windows-restored";
const STUDY_EXPIRATION_DATE_PREF = "extensions.pioneer-online-news.expirationDate";
const STUDY_UPLOAD_DATE_PREF = "extensions.pioneer-online-news.lastLogUploadDate";

this.Bootstrap = {
  install() {},

  async startup(data, reason) {
    // Check if the user is opted in to pioneer and if not end the study
    Pioneer.startup();
    const events = Pioneer.utils.getAvailableEvents();

    const studyAddon = await AddonManager.getAddonByID(
      "pioneer-study-online-news@pioneer.mozilla.org"
    );
    const studyInstalled = studyAddon !== null && studyAddon.isActive;

    const isEligible = await Pioneer.utils.isUserOptedIn();
    if (!isEligible || !studyInstalled) {
      Pioneer.utils.uninstall();
      return;
    }

    // Set the studies last uploaded date to past the expiry date of the study, which will
    // effectively stop it from attempting to upload pings
    if (reason === REASONS.ADDON_INSTALL) {
      const expirationDate = PrefUtils.getLongPref(
        STUDY_EXPIRATION_DATE_PREF, Date.now() + (10 * WEEK)
      );
      PrefUtils.setLongPref(STUDY_UPLOAD_DATE_PREF, expirationDate + (1 * WEEK));
    }

    // If the app is starting up, wait until the UI is available before finishing
    // init.
    if (reason === REASONS.APP_STARTUP) {
      Services.obs.addObserver(this, UI_AVAILABLE_NOTIFICATION);
    } else {
      this.finishStartup();
    }
  },

  observe(subject, topic, data) {
    if (topic === UI_AVAILABLE_NOTIFICATION) {
      Services.obs.removeObserver(this, UI_AVAILABLE_NOTIFICATION);
      this.finishStartup();
    }
  },

  /**
   * Add-on startup tasks delayed until after session restore so as
   * not to slow down browser startup.
   */
  async finishStartup() {
    NewsIndexedDB.startup();
    LogHandler.startup();
  },

  shutdown(data, reason) {
    Cu.unload("resource://pioneer-online-news-log-recovery/Config.jsm");
    Cu.unload("resource://pioneer-online-news-log-recovery/lib/LogHandler.jsm");
    Cu.unload("resource://pioneer-online-news-log-recovery/lib/LogStorage.jsm");
    Cu.unload("resource://pioneer-online-news-log-recovery/lib/NewsIndexedDB.jsm");
    Cu.unload("resource://pioneer-online-news-log-recovery/lib/Pioneer.jsm");
    Cu.unload("resource://pioneer-online-news-log-recovery/lib/PrefUtils.jsm");
  },

  uninstall() {},
};

// Expose bootstrap methods on the global
for (const methodName of ["install", "startup", "shutdown", "uninstall"]) {
  this[methodName] = Bootstrap[methodName].bind(Bootstrap);
}
