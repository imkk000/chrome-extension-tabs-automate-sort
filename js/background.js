function extractHostname(url) {
  let hostname;
  if (url.indexOf("//") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }
  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];
  return hostname;
}

function extractRootDomain(url) {
  let domain = extractHostname(url),
    splitArr = domain.split('.'),
    arrLen = splitArr.length;
  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
      domain = splitArr[arrLen - 3] + '.' + domain;
    }
  }
  return domain;
}

function getLocation(href) {
  let l = document.createElement("a");
  l.href = href;
  return l;
};

function sortTabsInCurrentWindow() {
  chrome.tabs.query({}, function (tabs) {
    const tabSorted = tabs.sort((a, b) => {
      const ah = getLocation(a.favIconUrl).hostname
      const bh = getLocation(b.favIconUrl).hostname
      return extractRootDomain(ah).localeCompare(extractRootDomain(bh))
    })
    for (let i = 0; i < tabSorted.length; i++) {
      chrome.tabs.move(tabSorted[i].id, { index: i }, null)
    }
  })
}

chrome.tabs.onCreated.addListener(tab => sortTabsInCurrentWindow())
chrome.tabs.onRemoved.addListener(tab => sortTabsInCurrentWindow())
chrome.tabs.onUpdated.addListener(tab => sortTabsInCurrentWindow())