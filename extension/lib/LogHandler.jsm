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
const UPLOAD_LIMIT = 1 * MEGABYTE;

let padding = 0.95;


this.LogHandler = {
  startup() {
    this.uploadPings();
    setInterval(this.uploadPings.bind(this), Config.logUploadAttemptInterval)
  },

  async uploadPings() {
    // upload ping dataset at the most once a day
    let entries = await LogStorage.getAll();
    const lastUploadDate = PrefUtils.getLongPref(UPLOAD_DATE_PREF, 0);
    const timesinceLastUpload = Date.now() - lastUploadDate;

    if (timesinceLastUpload > Config.logSubmissionInterval) {
      let entriesPingSize = Pioneer.utils.getEncryptedPingSize("online-news-log", 1, entries);

      if (entriesPingSize < UPLOAD_LIMIT) {
        // If the ping is small enough, just submit it directly
        await Pioneer.utils.submitEncryptedPing("online-news-log", 1, entries);
      } else {
        // Otherwise, break it into batches below the minimum size
        let originalEntriesLength = entries.length;
        while (entries.length > 0) {
          let batchSize = Math.floor(originalEntriesLength * entriesPingSize / UPLOAD_LIMIT * padding);
          if (batchSize < 1) {
            throw new Error('could not submit batch of any size');
          }

          let batch = entries.splice(0, batchSize);
          let batchPingSize = Pioneer.utils.getEncryptedPingSize("online-news-log", 1, batch);

          if (batchPingSize >= UPLOAD_LIMIT) {
            // not small enough, put the batch back in the pool,
            // reduce the batch size and try again
            padding -= 0.05;
            entries = batch.concat(entries);
            continue;
          }

          await Pioneer.utils.submitEncryptedPing("online-news-log", 1, batch);
          PrefUtils.setLongPref(UPLOAD_DATE_PREF, Date.now());
          const lastEntry = batch.pop();
          LogStorage.delete(IDBKeyRange.upperBound(lastEntry.timestamp));
        }
      }
    }
  },
};
