'use strict'

let active

const setAppStatus = async () => {
  await new Promise((resolve) => {
    chrome.storage.sync.set({ appStatus: active }, null)
    resolve()
  })
}

const getAppStatus = async () => {
  await new Promise((resolve) => {
    chrome.storage.sync.get('appStatus', result => {
      active = result.appStatus
      resolve()
    })
  })
  setIcon()
}

const extractHostname = (url = '') => {
  let hostname
  if (url.indexOf("//") > -1)
    hostname = url.split('/')[2]
  else
    hostname = url.split('/')[0]
  hostname = hostname.split(':')[0]
  hostname = hostname.split('?')[0]
  return hostname
}

const extractRootDomain = (url = '') => {
  let domain = extractHostname(url),
    splitArr = domain.split('.'),
    arrLen = splitArr.length
  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1]
    if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2)
      domain = splitArr[arrLen - 3] + '.' + domain
  }
  return domain
}

const compare = (firstElement = '', secondElement = '') => {
  return firstElement.localeCompare(secondElement, 'en', { 'sensitivity': 'base' })
}

const sort = (tabs = []) => {
  return tabs.sort((firstElement, secondElement) => {
    const aDomainName = extractRootDomain(firstElement.favIconUrl)
    const bDomainName = extractRootDomain(secondElement.favIconUrl)
    if (aDomainName != bDomainName) return compare(aDomainName, bDomainName)
    if (firstElement.title != secondElement.title) return compare(firstElement.title, secondElement.title)
    return compare(firstElement.url, secondElement.url)
  })
}

const sortTabsInCurrentWindow = () => {
  getAppStatus()
  if (!active) return
  chrome.tabs.query({}, tabs => {
    const tabsPinned = sort(tabs.filter(tab => tab.pinned))
    const tabsUnpinned = sort(tabs.filter(tab => !tab.pinned))
    const tabsStatusComplete = sort(tabsUnpinned.filter(tab => tab.status === 'complete'))
    const tabsStatusLoading = sort(tabsUnpinned.filter(tab => tab.status === 'loading'))
    const newTabs = [].concat(
      tabsPinned,
      tabsStatusComplete,
      tabsStatusLoading,
    )
    newTabs.forEach((tab, index) => {
      chrome.tabs.move(tab.id, { index }, null)
    })
  })
}

const setIcon = () => {
  const activeIconFile = active ? 'active' : 'inactive'
  chrome.browserAction.setIcon({ path: 'icons/button/' + activeIconFile + '.png' })
  console.info('app:', active ? "on" : "off")
}

(() => {
  getAppStatus()
  chrome.browserAction.onClicked.addListener(() => {
    active = !active
    setAppStatus()
    sortTabsInCurrentWindow()
  })
  chrome.tabs.onRemoved.addListener(sortTabsInCurrentWindow)
  chrome.tabs.onUpdated.addListener(sortTabsInCurrentWindow)
})()