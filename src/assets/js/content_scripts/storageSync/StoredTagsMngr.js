import {StoredGenericMngr} from './StoredGenericMngr';
import {StoredReposMngr} from './StoredReposMngr';

export const StoredTagsMngr = (() => {
  /**
   * Check if tags exist in storage in a specific repo. If not, create it
   * @param {Number} repoID
   * @param {String} newTag
   */
  async function createTag(repoID, newTag) {
    let newTagNormalized = normalizeTagName(newTag);
    let storedTags = await StoredGenericMngr.read('t');
    let hasTagInStorage = StoredTagsMngr.hasTagInStorage(storedTags, newTag);
    if (!hasTagInStorage) {
      const idAvailableToWriteTag = StoredTagsMngr.findIdToWriteNewTag(storedTags);
      storedTags[idAvailableToWriteTag] = newTagNormalized;
      await StoredGenericMngr.createOrUpdate('t', storedTags);
    }
    let tagID = StoredTagsMngr.getTagIDByName(storedTags, newTagNormalized);
    StoredReposMngr.writeTagToRepo(repoID, {tagID: tagID, tagName: newTagNormalized});
  }

  /**
   * This function finds an ID number available to store a new tag.
   * It searches for gaps between number IDs, to insert an ID for this new Tag.
   * And if there is no gap, is returns the ID next to the last tag stored.
   * @param {Object} storedTags Tag Object that is stored
   * @return {Number}
   */
  function findIdToWriteNewTag(storedTags) {
    let idCounter = 0;
    for (let tag in storedTags) {
      if (storedTags.hasOwnProperty(tag)) {
        if (idCounter !== Number(tag)) {
          break;
        }
        idCounter++;
      }
    }
    return idCounter;
  }

  /**
   * Returns true or false if tag already exists
   * @param {Object} storedTags Tag Object that is stored
   * @param {String} tagName
   * @return {boolean}
   */
  function hasTagInStorage(storedTags, tagName) {
    let hasTag = false;
    for (let tag in storedTags) {
      if (storedTags.hasOwnProperty(tag)) {
        if (storedTags[tag] === tagName) {
          hasTag = true;
          break;
        }
      }
    }
    return hasTag;
  }

  /**
   * @param {Object} storedTags
   * @param {Number|String} tagID
   * @return {String}
   */
  function getTagNameByID(storedTags, tagID) {
    for (let tag in storedTags) {
      if (Number(tag) === Number(tagID)) {
        return storedTags[tag];
      }
    }
    return 'Tag not found with this ID';
  }

  /**
   * @param {Object} storedTags
   * @param {String} tagName
   * @return {Number|String}
   */
  function getTagIDByName(storedTags, tagName) {
    for (let tag in storedTags) {
      if (storedTags[tag] === tagName) {
        return Number(tag);
      }
    }
    return 'Tag not found with this Name';
  }

  /**
   * @param {Object|undefined} tagsObject
   * @return {Array}
   */
  async function getAllTagsInArray(tagsObject = undefined) {
    let storedTags = tagsObject ? tagsObject : await StoredGenericMngr.read('t');
    let tags = [];
    for (let tag in storedTags) {
      if (storedTags.hasOwnProperty(tag)) {
        tags.push({
          tagID: Number(tag),
          tagName: storedTags[tag],
        });
      }
    }
    return tags;
  }

  /**
   *
   */
  async function checkForTagsNotBeingUsed() {
    let storedTags = await StoredGenericMngr.read('t');
    let storedRepos = await StoredGenericMngr.read('r');
    let tagChecker = [];
    let tagsToDelete = [];
    for (let tag in storedTags) {
      if (storedTags.hasOwnProperty(tag)) {
        for (let repo in storedRepos) {
          if (storedRepos.hasOwnProperty(repo)) {
            let tagExistInSomeStoredRepo = storedRepos[repo].indexOf(Number(tag)) > -1;
            if (tagExistInSomeStoredRepo) {
              let tagNotPushedYet = tagChecker.indexOf(Number(tag)) === -1;
              if (tagNotPushedYet) {
                tagChecker.push(Number(tag));
              }
            }
          }
        }
      }
    }
    for (let tag in storedTags) {
      if (storedTags.hasOwnProperty(tag)) {
        if (tagChecker.indexOf(Number(tag)) === -1) {
          tagsToDelete.push(Number(tag));
        }
      }
    }
    for (let tagID of tagsToDelete) {
      await StoredGenericMngr.deleteKey('t', tagID);
    }
  }

  /**
   * @param {String} tagName
   * @return {String}
   */
  function normalizeTagName(tagName) {
    return tagName.toLowerCase().replace(/\s\s+/g, ' ');
  }

  return {
    createTag,
    findIdToWriteNewTag,
    hasTagInStorage,
    checkForTagsNotBeingUsed,
    getTagNameByID,
    getTagIDByName,
    getAllTagsInArray,
    normalizeTagName,
  };
})();
