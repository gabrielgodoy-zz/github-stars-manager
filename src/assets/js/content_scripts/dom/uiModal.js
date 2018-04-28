import {$} from '../../helpers';
import {createTagsInStarsPage} from '../main';
import {getCloseIcon} from './uiSvgIcons';
import {StoredReposMngr} from '../storageSync/StoredReposMngr';

/**
 * Insert modal element on the DOM to be activated later
 */
export function insertModalStructure() {
  let mask = document.createElement('div');
  mask.setAttribute('class', 'ghstarmngr-modal-mask hidden');
  mask.innerHTML =
    '<div class="ghstarmngr-close-button">' +
    getCloseIcon({width: 30, height: 30}) +
    '</div>';

  let modalContainer = document.createElement('div');
  modalContainer.setAttribute('class', 'ghstarmngr-modal-container hidden');
  modalContainer.innerHTML = modalContentCreateTag();

  let body = $('body');
  body.appendChild(mask);
  body.appendChild(modalContainer);
}

/**
 * Closes modal and hides its mask
 * @param {String} content
 */
export function openModal(content) {
  const modalContainer = $('.ghstarmngr-modal-container');
  const feedBackMessage = $('.feedback-message');
  feedBackMessage.innerHTML = '&nbsp;';
  feedBackMessage.classList.remove('visible', '--error', '--success');
  let inputNewTag = $('.input-new-tag');
  if (inputNewTag) {
    inputNewTag.value = '';
  }
  $('.ghstarmngr-modal-mask').classList.remove('hidden');
  $('html').classList.add('--locked');
  modalContainer.classList.remove('hidden');
  modalContainer.innerHTML = content;
}

/**
 *
 */
export function closeModal() {
  const feedBackMessage = $('.feedback-message');
  feedBackMessage.innerHTML = '&nbsp;';
  feedBackMessage.classList.remove('visible', '--error', '--success');
  let inputNewTag = $('.input-new-tag');
  if (inputNewTag) {
    inputNewTag.value = '';
  }
  $('.ghstarmngr-modal-mask').classList.add('hidden');
  $('.ghstarmngr-modal-container').classList.add('hidden');
  $('html').classList.remove('--locked');
}

/**
 * Inserts "Tags" menu item in Github main header
 * @param {String} repoName
 * @param {Number} repoID
 */
export function repoNameInModalHeader(repoName, repoID) {
  let titleRepoName = $('.title-repo-name');
  titleRepoName.innerHTML = repoName;
  titleRepoName.dataset.repo = repoID;
}

/**
 * Action to take after user creates a new tag in a repo
 * @param {Object} feedback
 */
export function showFeedbackInModal(feedback) {
  let messageParagraph = $('.feedback-message');

  if (messageParagraph) {
    switch (feedback.code) {
      case(0): {
        messageParagraph.classList.add('--error');
      }
        break;
      case(1): {
        messageParagraph.classList.add('--success');
        setTimeout(() => {
          createTagsInStarsPage();
          closeModal();
        }, 750);
      }
        break;
      case(2): {
        messageParagraph.classList.add('--error');
      }
    }
    messageParagraph.innerHTML = feedback.message;
    messageParagraph.classList.add('visible');
    let inputNewTag = $('.input-new-tag');
    if (inputNewTag) {
      inputNewTag.value = '';
    }
  }
}

/**
 * Modal Content for creating a new tag
 * @return {string}
 */
export function modalContentCreateTag() {
  return '<p>New tag for <span class="title-repo-name"></p>' +
    '<form class="ghstarmngr-form-create-tag">' +
    '<input class="form-control input-new-tag" ' +
    'placeholder="Type the tag name" ' +
    'type="text" maxlength="15"/>' +
    '<button type="submit" class="btn btn-sm ghstarmngr-add-tag-bt">' +
    'Add tag</button>' +
    '<p class="feedback-message">&nbsp;</p>' +
    '</form>';
}

/**
 * Inserts a new tag from the existing tags set
 * @param {Number} repoID
 * @param {Object} tag
 * @param {String} tag.tagID The id of the tag.
 * @param {String} tag.tagName The name of the tag
 */
export async function setExistingTagInRepo(repoID, tag) {
  await StoredReposMngr.writeTagToRepo(repoID, tag);
}

/**
 * Modal Content for listing tags
 * @param {Array} tags
 * @param {Number} repoID
 * @return {string}
 */
export function modalContentListTags(tags, repoID) {
  let modalContent = '<p class="ghstarmngr-title-modal">List of existing tags</p>';

  if (tags.length) {
    modalContent +=
      '<p class="ghstarmngr-subtitle-modal">Select a tag by clicking on it</p>' +
      '<ul class="ghstarmngr-modal-tag-list" data-repo="' + repoID + '">' +
      '<div class="ghstarmngr-modal-tag-list-container">';

    let tagsSorted = tags.sort((a, b) => {
      let tagA = a.tagName;
      let tagB = b.tagName;
      return (tagA < tagB) ? -1 : (tagA > tagB) ? 1 : 0;
    });

    tagsSorted.forEach((tag) => {
      modalContent +=
        '<li class="border-bottom">' +
        '<span data-tag="' + tag.tagID + '" class="ghstarmngr-tag-item">' +
        tag.tagName +
        '</span></li>';
    });
    modalContent += '</ul></div>';
  } else {
    modalContent +=
      '<p class="ghstarsmngr-no-existing-tags">' +
      'There are no existing tags created' +
      '</p>';
  }

  modalContent += '<p class="feedback-message">&nbsp;</p>';
  return modalContent;
}
