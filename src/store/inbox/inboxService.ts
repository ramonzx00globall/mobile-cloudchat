import { apiService } from '@/services/APIService';
import type { InboxResponse } from './inboxTypes';
import { transformInbox } from '@/utils/camelCaseKeys';
import type { Inbox } from '@/types/Inbox';

type TemplatesResponse = { payload?: unknown };

const optionalEndpointStatus = (status: number) =>
  (status >= 200 && status < 300) || [403, 404, 422].includes(status);

export class InboxService {
  static async index(): Promise<InboxResponse> {
    const response = await apiService.get<InboxResponse>('inboxes');
    const inboxes = response.data.payload.map(transformInbox);
    return {
      payload: inboxes,
    };
  }

  // Older/custom Chatwoot servers may omit templates from the inbox list.
  // Read only the conversation's inbox, keeping authentication in APIService.
  static async templatesForInbox(inboxId: number): Promise<Inbox | undefined> {
    const templatesResponse = await apiService.get<TemplatesResponse>(
      `inboxes/${inboxId}/message_templates`,
      { validateStatus: optionalEndpointStatus },
    );
    if (templatesResponse.status === 200 && Array.isArray(templatesResponse.data?.payload)) {
      const messageTemplates = templatesResponse.data.payload;
      if (messageTemplates.length > 0) {
        return transformInbox({ id: inboxId, message_templates: messageTemplates });
      }
    }

    // Chatwoot 4.0 exposes message_templates in the inbox detail response.
    const detailResponse = await apiService.get<unknown>(`inboxes/${inboxId}`);
    const data = detailResponse.data as { payload?: unknown };
    const detail = data?.payload ?? data;
    if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return undefined;
    const inbox = transformInbox(detail);
    return inbox.id === inboxId ? inbox : undefined;
  }
}
