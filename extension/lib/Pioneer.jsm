const { utils: Cu } = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "Config", "resource://pioneer-online-news-log-recovery/Config.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "PioneerUtils", "resource://pioneer-online-news-log-recovery/PioneerUtils.jsm"
);

const Pioneer = {
  startup() {
    this.utils = new PioneerUtils(Config);
  }
};

this.EXPORTED_SYMBOLS = ["Pioneer"];
