import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ChatMessage } from '@/types';
import { AgentChatMessage } from './AgentChatMessage';

describe('AgentChatMessage tool failures', () => {
  it.each(['functionResponse', 'function_response'])('shows the CRM reason from %s', key => {
    const message = {
      id: 'tool-result',
      author: 'bee_recepcao',
      content: {
        parts: [{ [key]: {
          name: 'transfer_to_human',
          response: { status: 'error', message: 'conversation_id is required.', conversation_id: null },
        } }],
      },
    } as unknown as ChatMessage;

    render(<AgentChatMessage message={message} />);
    fireEvent.click(screen.getByText(/Function response: transfer_to_human/));

    expect(screen.getByText(/conversation_id is required/)).toBeInTheDocument();
    expect(screen.queryByText(/Unknown error/)).not.toBeInTheDocument();
  });

  it('keeps legacy error_message responses visible', () => {
    const message = {
      id: 'legacy-result', author: 'agent', content: { parts: [{ functionResponse: {
        name: 'legacy_tool', response: { status: 'error', error_message: 'Service unavailable' },
      } }] },
    } as unknown as ChatMessage;
    render(<AgentChatMessage message={message} />);
    fireEvent.click(screen.getByText(/Function response: legacy_tool/));
    expect(screen.getByText(/Service unavailable/)).toBeInTheDocument();
  });
});
