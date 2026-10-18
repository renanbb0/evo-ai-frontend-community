import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CustomerDashboardResponse } from '@/types/analytics/dashboard';
import DashboardMetricsSection from './DashboardMetricsSection';

vi.mock('@/hooks/useTranslation', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/base/TooltipInfo', () => ({ TooltipInfo: () => null }));

const data = {
  stats: {
    incoming_messages_count: 490, outgoing_messages_count: 472,
    avg_first_response_time_seconds: 9999, open_conversations: 45,
    unassigned_conversations: 45, pending_conversations: 18,
  },
  csat: { total_responses: 0, avg_rating: 0 },
  follow_ups: { pending: 0, overdue: 0 },
  ai_vs_human: {
    ai_messages_count: 159, human_messages_count: 262,
    ai_messages_share: 37.77, human_messages_share: 62.23,
    avg_response_time_ai_seconds: 8,
    avg_response_time_human_seconds: 240,
  },
} as CustomerDashboardResponse;

describe('separate AI and human response metrics', () => {
  it('uses each response time and evaluates its status independently', () => {
    render(<DashboardMetricsSection data={data} t={key => key} />);

    const human = within(screen.getByRole('group', { name: 'Resposta média humana' }));
    const ai = within(screen.getByRole('group', { name: 'Resposta média IA' }));
    expect(human.getByText('4min 0s')).toBeInTheDocument();
    expect(human.getByText('Crítico')).toBeInTheDocument();
    expect(ai.getByText('8s')).toBeInTheDocument();
    expect(ai.getByText('Dentro do SLA')).toBeInTheDocument();
    expect(screen.queryByText('166min 39s')).not.toBeInTheDocument();
  });

  it('does not show a missing AI measurement as zero or borrow the human status', () => {
    render(<DashboardMetricsSection data={{
      ...data,
      ai_vs_human: { ...data.ai_vs_human, avg_response_time_ai_seconds: null },
    }} t={key => key} />);

    const ai = within(screen.getByRole('group', { name: 'Resposta média IA' }));
    expect(ai.getByText('Sem base')).toBeInTheDocument();
    expect(ai.getByText('—')).toBeInTheDocument();
    expect(ai.queryByText('0s')).not.toBeInTheDocument();
    expect(ai.queryByText('Crítico')).not.toBeInTheDocument();
  });
});
