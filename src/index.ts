import { defineApp, version as platformVersion } from 'zapier-platform-core';

import { authentication } from './authentication.js';
import { addLabel } from './creates/add_label.js';
import { createPost } from './creates/create_post.js';
import { publishPost } from './creates/publish_post.js';
import { uploadMedia } from './creates/upload_media.js';
import { handleErrors, includeApiKey } from './middleware.js';
import { findAccount } from './searches/find_account.js';
import { findPost } from './searches/find_post.js';
import { listAccounts } from './triggers/list_accounts.js';
import { listLabels } from './triggers/list_labels.js';
import { listPosts } from './triggers/list_posts.js';
import { listWorkspaces } from './triggers/list_workspaces.js';
import { newAccountConnected } from './triggers/new_account_connected.js';
import { newPostPublished } from './triggers/new_post_published.js';
import { postFailed } from './triggers/post_failed.js';
import { version } from './version.js';

export default defineApp({
  version,
  platformVersion,

  authentication,
  beforeRequest: [includeApiKey],
  afterResponse: [handleErrors],

  flags: {
    // Core throws its own generic ThrottledError on a 429 before afterResponse
    // runs. Turning that off lets handleErrors report FoPost's own wording.
    throwForThrottlingEarly: false,
    // Every perform treats an empty string as absent, so Zapier's input
    // scrubbing only makes what reaches the API harder to predict.
    cleanInputData: false,
  },

  triggers: {
    [newPostPublished.key]: newPostPublished,
    [postFailed.key]: postFailed,
    [newAccountConnected.key]: newAccountConnected,
    [listWorkspaces.key]: listWorkspaces,
    [listAccounts.key]: listAccounts,
    [listLabels.key]: listLabels,
    [listPosts.key]: listPosts,
  },

  creates: {
    [createPost.key]: createPost,
    [publishPost.key]: publishPost,
    [uploadMedia.key]: uploadMedia,
    [addLabel.key]: addLabel,
  },

  searches: {
    [findPost.key]: findPost,
    [findAccount.key]: findAccount,
  },
});
