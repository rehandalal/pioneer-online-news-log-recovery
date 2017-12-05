/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Timer.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "Config", "resource://pioneer-online-news-log-recovery/Config.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "LogStorage", "resource://pioneer-online-news-log-recovery/lib/LogStorage.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "Pioneer", "resource://pioneer-online-news-log-recovery/lib/Pioneer.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "PrefUtils", "resource://pioneer-online-news-log-recovery/lib/PrefUtils.jsm"
);

this.EXPORTED_SYMBOLS = ["LogHandler"];

const UPLOAD_DATE_PREF = "extensions.pioneer-online-news-log-recovery.lastLogUploadDate";

const KILOBYTE = 1024;
const MEGABYTE = 1024 * KILOBYTE;


this.LogHandler = {
  startup() {
    this.uploadPings();
    setInterval(this.uploadPings.bind(this), Config.logUploadAttemptInterval)
  },

  async uploadPings() {
    // upload ping dataset at the most once a day
    const entries = await LogStorage.getAll();
    const lastUploadDate = PrefUtils.getLongPref(UPLOAD_DATE_PREF, 0);
    const timesinceLastUpload = Date.now() - lastUploadDate;

    if (timesinceLastUpload > Config.logSubmissionInterval) {
      let batch = [];

      for (const entry of entries) {
        batch.push(entry);

        if (Pioneer.utils.getEncryptedPingSize("online-news-log", 1, batch) > MEGABYTE) {
          batch.pop();
          await Pioneer.utils.submitEncryptedPing("online-news-log", 1, batch);
          batch = [entry];
        }
      }

      if (batch.length) {
        await Pioneer.utils.submitEncryptedPing("online-news-log", 1, batch);
        PrefUtils.setLongPref(UPLOAD_DATE_PREF, Date.now());

        const lastEntry = batch.pop();
        LogStorage.delete(IDBKeyRange.upperBound(lastEntry.timestamp));
      }
    }
  },
};
