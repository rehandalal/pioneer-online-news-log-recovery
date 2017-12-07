/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { utils: Cu } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "NewsIndexedDB", "resource://pioneer-online-news-log-recovery/lib/NewsIndexedDB.jsm"
);


this.EXPORTED_SYMBOLS = ["LogStorage"];


this.LogStorage = {
  getStore() {
    return NewsIndexedDB.getStore("log");
  },

  clear() {
    return this.getStore().clear();
  },

  delete(key) {
    return this.getStore().delete(key);
  },

  getAll() {
    return this.getStore().getAll();
  },

  getAllKeys() {
    return this.getStore().getAllKeys();
  },

  async put(ping) {
    return this.getStore().put(ping);
  },
};
