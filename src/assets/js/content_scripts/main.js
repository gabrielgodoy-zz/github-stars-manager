import { $ } from '../helpers';
import { HASH } from '../constants';
import KEYS from '../keys';
import '../../style/main.styl';
import { initStorage, getAccessTokenFromStorage } from './storageSync/initStorageSync';
import { StoredGenericMngr } from './storageSync/StoredGenericMngr';
import { StoredTagsMngr } from './storageSync/StoredTagsMngr';
import { addHeaderTagMenu, updateSidebarInTagPage } from './dom/uiTagPage';
import {
  insertBtCreateTag,
  insertFooterTags,
  insertLoader,
  removeLoader,
  displayLoaderWithMessage,
} from './dom/uiFooterTagsInRepo';
import { initDOM } from './dom/initDom';
import {
  getUserDetails,
  getUserStarredRepos,
  getAccessToken,
  getCodeFromURL,
} from './githubAPI';

init();

/**
 * Function responsible for all initialization
 */
function init() {
  StoredTagsMngr.checkForTagsNotBeingUsed();
  initStorage();
  createTagsInStarsPage();
  initDOM();
}

let setIntervalToCheckURL;

/**
 * Checks if URL is User Home and if it is Star tab, or stars section
 * of the User
 * @return {Boolean}
 */
export async function createTagsInStarsPage() {
  if (setIntervalToCheckURL) {
    clearInterval(setIntervalToCheckURL);
  }
  let token = await getAccessTokenFromStorage();
  let userDetails;
  try {
    userDetails = await getUserDetails(token);
  } catch (error) {
    checkCodeParamAndSaveToken();
    return false;
  }
  addHeaderTagMenu();
  let headerTagLink = document.querySelector('.ghstarmngr-tag-header-link');
  headerTagLink.setAttribute('href', `${userDetails.data.html_url}?tab=stars${HASH.HOME}`);

  if (isUserHome(userDetails) || isUserInStars()) {
    insertLoader('Loading tags...');
    if ($('.ghstarsmngr-sidebar-tag-list')) {
      $('.ghstarsmngr-sidebar-tag-list').innerHTML = displayLoaderWithMessage('Loading tags...');
    }
    let starredRepos = await getUserStarredRepos(token);
    let reposInStorage = await StoredGenericMngr.read('r');
    let tagsInStorage = await StoredGenericMngr.read('t');
    removeLoader();
    if ($('.ghstarsmngr-sidebar-tag-list')) {
      updateSidebarInTagPage(starredRepos, reposInStorage, tagsInStorage);
    }
    insertBtCreateTag(starredRepos);
    insertFooterTags(starredRepos, reposInStorage, tagsInStorage);
    intervalToCheckURL(starredRepos, reposInStorage, tagsInStorage);
  }
}

/**
 * @param {Object} starredRepos
 * @param {Object} reposInStorage
 * @param {Object} tagsInStorage
 * @return {Object}
 */
function intervalToCheckURL(starredRepos, reposInStorage, tagsInStorage) {
  let cachedLocationSearch;
  let intervalToCheckIfURLChanges = 500;
  setIntervalToCheckURL = setInterval(function() {
    if (window.location.hash.indexOf(HASH.HOME) > -1) {
      $('.ghstarmngr-tag-header-link').classList.add('active-menu-header');
      document.querySelectorAll('.underline-nav-item').forEach((navItem) => {
        navItem.classList.remove('selected');
      });
    } else {
      $('.ghstarmngr-tag-header-link').classList.remove('active-menu-header');
    }
    if (location.search.indexOf('tab=stars') > -1) {
      let changedTabsInStar = location.search !== cachedLocationSearch;
      let hashNoLongerExist = window.location.hash.indexOf(HASH.HOME) < 0;
      if (changedTabsInStar || hashNoLongerExist) {
        insertBtCreateTag(starredRepos);
        insertFooterTags(starredRepos, reposInStorage, tagsInStorage);
      }
    }
    cachedLocationSearch = location.search;
  }, intervalToCheckIfURLChanges);
  return setIntervalToCheckURL;
}

/**
 * Checks if user is in the stars page /stars
 * @return {Boolean}
 */
function isUserInStars() {
  return location.href.indexOf('https://github.com/stars') > -1;
}

/**
 * Check if user is in any section of its Github home page
 * @param {Object} userDetails
 * @return {boolean}
 */
function isUserHome(userDetails) {
  const userDetailsData = userDetails.data;
  const cleanPathName = location.pathname.replace(/\//g, '');
  return userDetailsData.login === cleanPathName;
}

/**
 * Save token if there is a 'code=' query parameter in URL
 * If there is no token, and no code query param, send a message to background
 * script to open a new tab
 */
export async function checkCodeParamAndSaveToken() {
  if (getCodeFromURL(location.href)) {
    let url = await getAccessToken(getCodeFromURL(location.href));
    let begin = url.data.indexOf('=') + 1;
    let end = url.data.indexOf('&');
    let accessToken = url.data.slice(begin, end);
    await StoredGenericMngr.createOrUpdate('token', accessToken);
    window.location.href = 'https://github.com/';
  } else if (window.location.href.indexOf('https://github.com/login/oauth/authorize') === -1) {
    const scope = 'user:email,repo';
    const ghPrefix = 'https://github.com';
    const ghAuthPrefix = `${ghPrefix}/login/oauth/authorize`;
    const ghAuth = `${ghAuthPrefix}?client_id=${KEYS.ID}&redirect_uri=${ghPrefix}/&scope=${scope}`;
    window.location.href = ghAuth;
  }
}
