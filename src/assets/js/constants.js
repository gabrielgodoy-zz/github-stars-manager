export const GH = {
  API: 'https://api.github.com/',
  SITE: 'https://github.com/',
  ID: '5c64eac63c9d9142c634',
  SECRET: '84b835af457d73c541fe7f626c3ec1dadc71f0bd',
};

export const modalFeedbackMessage = (tag) => {
  return {
    TAG_ALREADY_EXIST: {
      message: `The tag "${tag}" already exists for this repository, try another`,
      code: 0,
    },
    TAG_CREATED: {
      message: `The tag "${tag}" has been created!`,
      code: 1,
    },
    TAG_LIMIT: {
      message: 'You can only create up to 6 tags per repository',
      code: 2,
    },
  };
};

export const HASH = {
  HOME: '#starsmngr',
};
