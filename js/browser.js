/**
 * # Checks whether running on a mobile device according to browser data.
 * Functions (each returns bool):
 * * Android
 * * BlackBerry
 * * iPhone
 * * iPod
 * * iPad
 * * iOS
 * * Opera
 * * Windows
 * * Kindle Fire
 * * any
 * @example
 * TimerBrowser.Android() => true/false
 * TimerBrowser.iOS() => true/false
 * TimerBrowser.any() => true/false
 * TimerBrowser.KindleFire() => true/false
 * TimerBrowser.BlackBerry() => true/false
 */

const TimerBrowser = {
  userAgent: function () {
    return navigator.userAgent;
  },
  Safari: function () {
    return /Safari/i.test(TimerBrowser.userAgent)
  },
  Android: function() {
    return /Android/i.test(TimerBrowser.userAgent()) && !TimerBrowser.Windows();
  },
  BlackBerry: function() {
    return /BlackBerry|BB10|PlayBook/i.test(TimerBrowser.userAgent());;
  },
  iPhone: function() {
    return /iPhone/i.test(TimerBrowser.userAgent()) && !TimerBrowser.iPad() && !TimerBrowser.Windows();
  },
  iPod: function() {
    return /iPod/i.test(TimerBrowser.userAgent());
  },
  iPad: function() {
    return /iPad/i.test(TimerBrowser.userAgent());
  },
  iOS: function() {
    return (TimerBrowser.Safari() || TimerBrowser.iPad() || TimerBrowser.iPod() || TimerBrowser.iPhone());
  },
  Opera: function() {
    return /Opera Mini/i.test(TimerBrowser.userAgent());
  },
  Windows: function() {
    return /Windows Phone|IEMobile|WPDesktop/i.test(TimerBrowser.userAgent());
  },
  KindleFire: function() {
    return /Kindle Fire|Silk|KFAPWA|KFSOWI|KFJWA|KFJWI|KFAPWI|KFAPWI|KFOT|KFTT|KFTHWI|KFTHWA|KFASWI|KFTBWI|KFMEWI|KFFOWI|KFSAWA|KFSAWI|KFARWI/i.test(TimerBrowser.userAgent());
  },
  any: function() {
    return (TimerBrowser.Android() || TimerBrowser.BlackBerry() || TimerBrowser.iOS() || TimerBrowser.Opera() || TimerBrowser.Windows());
  }
};

// ??? export default TimerBrowser;