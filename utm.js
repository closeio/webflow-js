function getCookie(name) {
  if (
    (match = document.cookie.match(RegExp(encodeURIComponent(name) + '=([^;]+)')))
  ) {
    return decodeURIComponent(match[1]);
  }
}

function setCookie(name, value, domain, path, lifespanInMs) {
  if (lifespanInMs) {
    var expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + 24 * lifespanInMs * 36e5);
    var expiresStatement = '; expires=' + expiryDate.toGMTString();
  } else {
    expiresStatement = '';
  }
  document.cookie =
    encodeURIComponent(name) +
    '=' +
    encodeURIComponent(value) +
    expiresStatement +
    '; domain=' +
    domain +
    '; path=' +
    path;
}

function deleteCookie(name, domain, path) {
  document.cookie =
    encodeURIComponent(name) +
    '=' +
    (domain ? ';domain=' + domain : '') +
    (path ? ';path=' + path : '') +
    ';expires=Thu, 01 Jan 1970 00:00:01 GMT';
}

function setTLDCookie(name, value, lifespanInMs) {
  setCookie(
    name,
    value,
    window.location.hostname.split('.').slice(-2).join('.'),
    '/',
    lifespanInMs,
  );
}

function deleteTLDCookie(name) {
  deleteCookie(name, window.location.hostname.split('.').slice(-2).join('.'), '/');
}

function getUrlParam(name) {
  var matches = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return matches && decodeURIComponent(matches[1].replace(/\+/g, ' '));
}

var utm_names = [
  'utm_campaign',
  'utm_source',
  'utm_medium',
  'utm_content',
  'utm_term',
  'gclid',
];

function getLastTouchCookie(name) {
  return getCookie(name) || getCookie(name + '_last');
}

function deleteLastTouchCookie(name) {
  deleteTLDCookie(name);
  deleteTLDCookie(name + '_last');
}

$(document).ready(function () {
  if (!utm_names.some(getUrlParam)) {
    return;
  }

  var firstTouchCookies = utm_names.map((suffixlessName) => getCookie(suffixlessName + '_first')).filter(cookie => Boolean(cookie));
  if (firstTouchCookies.length === 0) {
    utm_names.forEach(function (suffixlessName) {
      var firstTouchCookieName = suffixlessName + '_first';
      var urlParamValue = getUrlParam(suffixlessName);
      if (urlParamValue) {
        setTLDCookie(firstTouchCookieName, urlParamValue, 36500);
      }
    });
  }

  utm_names.forEach(function (suffixlessName) {
    var urlParamValue = getUrlParam(suffixlessName);
    if (urlParamValue) {
      var lastTouchCookie = getLastTouchCookie(suffixlessName);
      if (lastTouchCookie && (lastTouchCookie !== urlParamValue)) {
        deleteLastTouchCookie(suffixlessName);
      }
      setTLDCookie(suffixlessName + '_last', urlParamValue, 36500);
    } else {
      deleteLastTouchCookie(suffixlessName);
    }
  });
});