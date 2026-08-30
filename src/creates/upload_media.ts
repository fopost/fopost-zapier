import FormData from 'form-data';
import type { Create, CreatePerform } from 'zapier-platform-core';

import { apiUrl, unwrap } from '../lib/api.js';
import { workspaceField } from '../lib/fields.js';
import { uploadedMediaOutputFields } from '../lib/outputs.js';
import { uploadedMediaSample } from '../lib/samples.js';
import type { UploadedMedia } from '../lib/types.js';

const filenameFrom = (disposition: string | undefined, url: string): string => {
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  if (match) return decodeURIComponent(match[1]);
  const path = url.split('?')[0];
  return decodeURIComponent(path.split('/').pop() || 'upload');
};

const perform: CreatePerform<Record<string, unknown>, UploadedMedia> = async (z, bundle) => {
  const fileUrl = String(bundle.inputData.file);
  const workspaceId = bundle.inputData.workspace_id as string | undefined;

  // Zapier hands us either a URL or a hydrated file pointer; both are fetchable.
  const file = await z.request({ url: fileUrl, raw: true });
  const filename =
    (bundle.inputData.filename as string) ||
    filenameFrom(file.getHeader('content-disposition'), fileUrl);

  const form = new FormData();
  form.append('files', file.body, {
    filename,
    contentType: file.getHeader('content-type') || undefined,
  });
  if (workspaceId) {
    form.append('workspaceId', workspaceId);
  }

  const response = await z.request({
    url: apiUrl('/media/upload'),
    method: 'POST',
    body: form,
    headers: form.getHeaders(),
  });

  const uploaded = unwrap<UploadedMedia[]>(response.data);
  if (!uploaded || uploaded.length === 0) {
    throw new z.errors.Error('FoPost accepted the upload but returned no media.', 'no_media', 502);
  }
  return uploaded[0];
};

export const uploadMedia: Create = {
  key: 'upload_media',
  noun: 'Media',
  display: {
    label: 'Upload Media',
    description:
      'Uploads a file to FoPost and returns a URL you can drop into the Media URLs field of Create Post.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'file',
        label: 'File',
        type: 'file',
        required: true,
        helpText:
          'A file from an earlier step, or a public URL. Up to 50 MB — jpeg, png, gif, webp, mp4, mov, webm, pdf, txt or csv.',
      },
      {
        ...workspaceField(false),
        altersDynamicFields: false,
        helpText: 'Save the file to this workspace’s media library.',
      },
      {
        key: 'filename',
        label: 'File Name',
        type: 'string',
        required: false,
        helpText: 'Overrides the name FoPost stores the file under.',
      },
    ],
    outputFields: uploadedMediaOutputFields,
    sample: uploadedMediaSample,
  },
};
