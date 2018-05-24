import { $ } from '../../helpers';
import { displayLoaderWithMessage, createDOMTagCell } from './uiFooterTagsInRepo';
import { getTagIcon, getPlusIcon, getStarIcon, getJsonIcon } from './uiSvgIcons';
import { StoredReposMngr } from '../storageSync/StoredReposMngr';
import { StoredTagsMngr } from '../storageSync/StoredTagsMngr';
import ghColors from './gh-language-colors.json';
import moment from 'moment';
import { createTagsInStarsPage } from '../main';

/**
 * Function to run when user enter tag page
 */
export async function enterTagPage() {
  hideStarredRepos();
  if (!$('.ghstarsmngr-sidebar')) {
    exportTagsBts();
    await sidebarListTags();
  }
  $('.ghstarsmngr-sidebar-tag-list-link').click();
}

/**
 * Function to run when user leave tag page
 */
export function leaveTagPage() {
  showStarredRepos();
}

/**
 * Add Tag item in main menu header
 */
export function addHeaderTagMenu() {
  if (!$('.ghstarmngr-tag-header-link')) {
    $('header [role="navigation"]').innerHTML += `
        <li class="header-nav-item">
          <a class="header-navlink ghstarmngr-tag-header-link">
            ${getTagIcon({ width: 14, height: 13 })}
            Tags
          </a>
        </li>`;
  }
}

/**
 * Create sidebar in Tag Page that list tags
 * @param {Boolean} isFull
 */
export async function sidebarListTags(isFull = false) {
  $('.user-profile-nav + .position-relative').innerHTML += `
    <div class="ghstarsmngr-tag-page-loader ${isFull ? 'ghstarsmngr-tag-page-loader-full' : ''}">
      ${displayLoaderWithMessage('Loading tag page...')}
    </div>`;

  let tagsAndRelatedRepos = await getTagsAndRelatedRepos();
  sortTagsArrayByName(tagsAndRelatedRepos);

  $('.user-profile-nav + .position-relative').querySelector('.ghstarsmngr-tag-page-loader')
    .remove();

  let sidebarContent = `
    <div class="col-3 float-left pr-3 ghstarsmngr-sidebar">
      <p class="ghstarsmngr-sidebar-title">Tags </p>
      <ul class="ghstarsmngr-sidebar-tag-list">`;

  tagsAndRelatedRepos.map((tagAndRepos) => sidebarContent += createTagInSidebar(tagAndRepos));
  sidebarContent += '</ul></div>';
  $('.user-profile-nav + .position-relative').innerHTML += sidebarContent;
}

/**
 * @param {Object} starredRepos
 * @param {Object} reposInStorage
 * @param {Object} tagsInStorage
 */
export async function updateSidebarInTagPage(starredRepos, reposInStorage, tagsInStorage) {
  let sidebarUlContent = '';
  let tagsInArray = await StoredTagsMngr.getAllTagsInArray(tagsInStorage);

  let tagsAndRelatedRepos =
    StoredReposMngr.getStarredReposWithTags(starredRepos, reposInStorage, tagsInArray);

  sortTagsArrayByName(tagsAndRelatedRepos);
  tagsAndRelatedRepos.map((tagAndRepos) => sidebarUlContent += createTagInSidebar(tagAndRepos));
  $('.ghstarsmngr-sidebar-tag-list').innerHTML = sidebarUlContent;
}

/**
 * @param {Array} tagsAndRelatedRepos Array of tags
 * @return {Array}
 */
function sortTagsArrayByName(tagsAndRelatedRepos) {
  return tagsAndRelatedRepos.sort((a, b) => {
    if (a.tag !== null && b.tag !== null) {
      let tagA = a.tag.tagName;
      let tagB = b.tag.tagName;
      return (tagA < tagB) ? -1 : (tagA > tagB) ? 1 : 0;
    }
  });
}

/* eslint-disable */

/**
 *
 * @param {Object} tagAndRepos Object with tags and its related repositories
 * @return {String} tagContent
 */
function createTagInSidebar(tagAndRepos) {
  let tagContent = '';

  if (tagAndRepos.tag !== null) {
    tagContent += `
        <li class="border-bottom">
          <a class="ghstarsmngr-sidebar-tag-list-link" href="#" data-tag="${tagAndRepos.tag.tagID}">
            ${getTagIcon({ width: 14, height: 13 })}
            ${tagAndRepos.tag.tagName}
            <span class="ghstarsmngr-tag-count">${tagAndRepos.repos.length}</span>
          </a>
          <a href="#" class="button-clean-tag">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.939 95.939">
              <path d="M62.82 47.97L95.35 15.436c.78-.78.78-2.047 0-2.828L83.332.586C82.96.21 82.45 0 81.92 0c-.53 0-1.04.21-1.415.586L47.97 33.12 15.435.587c-.75-.75-2.078-.75-2.828 0L.587 12.608c-.78.78-.78 2.047 0 2.828L33.12 47.97.588 80.504c-.78.78-.78 2.047 0 2.828l12.02 12.02c.375.376.884.587 1.414.587.53 0 1.04-.212 1.415-.587L47.97 62.818l32.535 32.535c.375.375.884.586 1.414.586.528 0 1.038-.212 1.413-.587l12.02-12.02c.78-.782.78-2.05 0-2.83L62.82 47.97z" fill="#e74c3c" />
            </svg>
          </a>
        </li>`;
  } else {
    tagContent += `
        <li class="untagged-repos">
          <a class="ghstarsmngr-sidebar-tag-list-link" href="#">
            ${getStarIcon({ width: 14, height: 13 })}
            untagged
            <span class="ghstarsmngr-tag-count">${tagAndRepos.repos.length}</span>
          </a>
        </li>`;
  }
  return tagContent;
}

/* eslint-enable */

/**
 * Action when user click to delete a tag
 * @param {Object} tag
 */
export async function cleanTag(tag) {
  const liItem = tag.closest('.border-bottom');
  const tagItem = liItem.querySelector('.ghstarsmngr-sidebar-tag-list-link');
  const tagID = tagItem.dataset.tag;

  await StoredReposMngr.deleteTagFromAllRepos(tagID);
  await createTagsInStarsPage();
  $('.untagged-repos .ghstarsmngr-sidebar-tag-list-link').click();
}

/**
 * Get object of tags and their related repositories
 * @return {Array}
 */
export async function getTagsAndRelatedRepos() {
  return await StoredReposMngr.getTagsAndRelatedRepos();
}

/**
 * Call function to recreate repositories with tag cliked
 * @param {Object} target Element being clicked
 */
export function tagLinkOnTagPageShowRepos(target) {
  createOrUpdateRepoListInTagPage(target);
}

/**
 * Creates and Updates the list of repositories in the tag page
 * @param {Object} tagItem This is the tag clicked on the sidebar of the tag page
 */
async function createOrUpdateRepoListInTagPage(tagItem) {
  let ghstarsmngrRepoListContainer = $('.ghstarsmngr-repo-list-container');
  if (ghstarsmngrRepoListContainer) {
    ghstarsmngrRepoListContainer.remove();
  }

  let jsRepoFilter = $('.user-profile-nav + .position-relative');
  jsRepoFilter.innerHTML += `
    <div class="col-9 float-left pl-3 loading-repos-tag-page">
      ${displayLoaderWithMessage('Loading repositories...the more ⭐ the more it takes')}
    </div>`;

  let tagsAndRelatedRepos = await StoredReposMngr.getTagsAndRelatedRepos();
  let repoListContent = `
    <div class="col-9 float-left pl-3 ghstarsmngr-repo-list-container">
      <ul class="ghstarsmngr-repo-list">`;

  let clickedTagAndItsRepos = getTagAndItsRepos(tagItem, tagsAndRelatedRepos);

  for (let repo of clickedTagAndItsRepos.repos) {
    repoListContent += await createRepoItem(repo, tagsAndRelatedRepos);
  }

  repoListContent += '</ul></div>';
  $('.loading-repos-tag-page').remove();
  jsRepoFilter.innerHTML += repoListContent;
}

/**
 * @param {Object} repo Repository object
 * @param {Object} tagsAndRelatedRepos Object with all tags and their related repos
 * @return {String} Content on a repository item for the tag page
 */
async function createRepoItem(repo, tagsAndRelatedRepos) {
  let repoItemContent = '';
  let repoDescription = repo.description ? repo.description : '';
  repoItemContent += `
      <li class="d-block width-full py-4 border-bottom">
        <div class="d-inline-block">
          <a class="ghstarsmngr-repo-title" \ 
             href="/${repo.full_name}" data-repo="${repo.id}">
            ${repo.owner.login} / <strong>${repo.name}</strong>
          </a>
        </div>
        <div class="float-right">
          <div class="starring-container">
            <button class="btn btn-sm ghstarmngr-create-tag-bt" data-repo="${repo.id}">
              ${getTagIcon({ width: 14, height: 13 })}
              New tag
            </button>
          </div>
        </div>
        <p class="ghstarsmngr-repo-description">${repoDescription}</p>
        ${addRepoDetailsBar(repo)}`;

  let tagsInRepo = await StoredReposMngr.getRepoTagsByRepoID(repo.id);
  let numberOfTags = tagsInRepo ? tagsInRepo.length : 0;

  repoItemContent += `
      <div class="ghstarmngr-repo-footer-tags">
        ${getTagIcon({ width: 14, height: 13 })}
        <p>${numberOfTags} tag${numberOfTags === 1 ? '' : 's'}</p>`;

  if (tagsInRepo) {
    tagsAndRelatedRepos.filter((tagAndRelatedRepos) => {
      if (tagAndRelatedRepos.tag) {
        return tagsInRepo.some((tag) => {
          return tagAndRelatedRepos.tag.tagID === tag;
        });
      }
    }).map((tagsRelatedInRepo) => {
      repoItemContent += createDOMTagCell(repo.id, tagsRelatedInRepo.tag.tagName);
    });
  }

  repoItemContent += `
          <a href="#" class="ghstarmngr-bt-existing-tag" data-repo="${repo.id}">
            ${getPlusIcon({ width: 12, height: 15 })}
            Add existing tag
          </a>`;

  repoItemContent += '</div></li>';
  return repoItemContent;
}

/**
 * Gets repos specific to a tag
 * @param {Object} tagItem Tag item that is being clicked on the sidebar
 * @param {Object} tagsAndRelatedRepos Object with all tags and their related repos
 * @return {Array} Array of repos of a tag
 */
function getTagAndItsRepos(tagItem, tagsAndRelatedRepos) {
  return tagsAndRelatedRepos.filter((storedRepo) => {
    let clickedTagID = tagItem.dataset.tag;
    if (storedRepo.tag) {
      return storedRepo.tag.tagID === Number(clickedTagID);
    }
    // Untagged repos
    return storedRepo.tag === null;
  })[0];
}

/**
 * Add details about repository like number of stars, forks and main language used
 * @param {Object} repoDetails Details like Language used, Stars, Forks
 * @return {string}
 */
function addRepoDetailsBar(repoDetails) {
  let repoDetailsContent = '';

  repoDetailsContent += `<div class="f6 text-gray mt-2">`;

  if (repoDetails.language) {
    for (let color in ghColors) {
      if (ghColors.hasOwnProperty(color)) {
        if (color === repoDetails.language) {
          repoDetailsContent += `
            <span class="repo-language-color ml-0" style="background-color:${ghColors[color]}">
            </span>
            <span class="mr-3" itemprop="programmingLanguage">
                ${repoDetails.language}
            </span>`;
        }
      }
    }
  }

  /* eslint-disable max-len */
  repoDetailsContent += `
    <a class="muted-link tooltipped tooltipped-s mr-3" href="${repoDetails.html_url}/stargazers" aria-label="Stargazers">
      <svg aria-hidden="true" class="octicon octicon-star" height="16" version="1.1" viewBox="0 0 14 16" width="14">
        <path fill-rule="evenodd" d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z"></path>
      </svg>
      ${repoDetails.stargazers_count}
    </a>
    
    <a class="muted-link tooltipped tooltipped-s mr-3" href="${repoDetails.html_url}/network" aria-label="Forks">
      <svg aria-hidden="true" class="octicon octicon-repo-forked" height="16" version="1.1" viewBox="0 0 10 16" width="10"><path fill-rule="evenodd" d="M8 1a1.993 1.993 0 0 0-1 3.72V6L5 8 3 6V4.72A1.993 1.993 0 0 0 2 1a1.993 1.993 0 0 0-1 3.72V6.5l3 3v1.78A1.993 1.993 0 0 0 5 15a1.993 1.993 0 0 0 1-3.72V9.5l3-3V4.72A1.993 1.993 0 0 0 8 1zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3 10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3-10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path>
      </svg>
      ${repoDetails.forks}
    </a>
    Updated <relative-time>${moment(repoDetails.pushed_at).fromNow()}</relative-time>`;

  repoDetailsContent += '</div>';
  return repoDetailsContent;
}

/* eslint-enable max-len */

/**
 * Create section with buttons to export tags to bookmarks and json
 */
export function exportTagsBts() {
  $('.user-profile-nav + .position-relative').innerHTML += `
    <div class="col-12 ghstarsmngr-export-bts-container">
      <p class="main-title">Export all your ⭐ arranged by tags</p>
      <button class="ghstarsmngr-export-bt btn btn-sm ghstarsmngr-export-bt-bookmarks">
        ${getStarIcon({ width: 14, height: 13 })}
        Export to bookmarks
      </button>
      <button class="ghstarsmngr-export-bt btn btn-sm ghstarsmngr-export-bt-json">
        ${getJsonIcon({ width: 14, height: 13 })}
        Export to JSON file
      </button>
      <p class="ghstarsmngr-feedback-export">&nbsp;</p>
    </div>`;
}

/**
 * Hide all existing starred repos to enter on the Tag page
 */
export function hideStarredRepos() {
  $('.TableObject.border-bottom.border-gray-dark.py-3').classList.add('ghstarsmngr-hide');
  $('.paginate-container').classList.add('ghstarsmngr-hide');
  document.querySelectorAll('.d-block.width-full.py-4').forEach((div) => {
    div.classList.add('ghstarsmngr-hide');
  });
}

/**
 * Show again all starred repos when leave the Tag page
 */
export function showStarredRepos() {
  if ($('.paginate-container')) {
    $('.paginate-container').classList.remove('ghstarsmngr-hide');
    $('.user-profile-repo-filter').classList.remove('ghstarsmngr-hide');
    document.querySelectorAll('.d-block.width-full.py-4').forEach((div) => {
      div.classList.remove('ghstarsmngr-hide');
    });
  }
}
