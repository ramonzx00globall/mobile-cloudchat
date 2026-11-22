import { transformInbox } from '@/utils/camelCaseKeys';
import { InboxService } from '../inboxService';
import { mockInboxesResponse } from './inboxMockData';
import { apiService } from '@/services/APIService';
import { getTemplatesForInbox } from '@/utils/messageTemplateUtils';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('InboxService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get inboxes and transform the data', async () => {
    (apiService.get as jest.Mock).mockResolvedValueOnce(mockInboxesResponse);

    const result = await InboxService.index();
    expect(apiService.get).toHaveBeenCalledWith('inboxes');
    expect(result).toEqual({
      payload: mockInboxesResponse.data.payload.map(transformInbox),
    });
  });

  it('loads templates from the dedicated endpoint for the conversation inbox', async () => {
    const template = {
      name: 'follow_up',
      language: 'pt_BR',
      status: 'APPROVED',
      category: 'UTILITY',
      components: [{ type: 'BODY', text: 'Ola!' }],
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: { payload: [template] },
    });

    const result = await InboxService.templatesForInbox(141);

    expect(apiService.get).toHaveBeenCalledWith('inboxes/141/message_templates', {
      validateStatus: expect.any(Function),
    });
    expect(result?.id).toBe(141);
    expect(result?.messageTemplates).toEqual([template]);
    expect(getTemplatesForInbox(result).map(item => item.name)).toEqual(['follow_up']);
    expect(apiService.get).toHaveBeenCalledTimes(1);
  });

  it('falls back to inbox details when the dedicated endpoint is unavailable', async () => {
    const template = { name: 'follow_up', language: 'pt_BR', status: 'APPROVED' };
    (apiService.get as jest.Mock)
      .mockResolvedValueOnce({ status: 404, data: {} })
      .mockResolvedValueOnce({ data: { id: 141, message_templates: [template] } });

    const result = await InboxService.templatesForInbox(141);

    expect(apiService.get).toHaveBeenNthCalledWith(2, 'inboxes/141');
    expect(result?.messageTemplates).toEqual([template]);
  });
});
