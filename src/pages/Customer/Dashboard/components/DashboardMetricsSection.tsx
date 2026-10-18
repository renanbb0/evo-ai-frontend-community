import { MessageSquare, Bot, CheckCircle2, AlertTriangle, UserX, Users } from 'lucide-react';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@evoapi/design-system';
import type { CustomerDashboardResponse } from '@/types/analytics/dashboard';
import DashboardMetricCard from './DashboardMetricCard';
import { formatSeconds } from './dashboardUtils';
import { useTranslation } from '@/hooks/useTranslation';
import { TooltipInfo } from '@/components/base/TooltipInfo';

interface DashboardMetricsSectionProps {
  data: CustomerDashboardResponse;
  t: (key: string) => string;
}

const DashboardMetricsSection = ({ data, t }: DashboardMetricsSectionProps) => {
  const { t: tTours } = useTranslation('tours');
  const tx = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const responseStatus = (seconds: number | null) => seconds == null
    ? { label: tx('dashboard.status.noSample', 'Sem base'), tone: 'neutral' as const }
    : seconds <= 60
      ? { label: tx('dashboard.status.good', 'Dentro do SLA'), tone: 'good' as const }
      : seconds <= 180
        ? { label: tx('dashboard.status.warning', 'Atenção'), tone: 'warning' as const }
        : { label: tx('dashboard.status.critical', 'Crítico'), tone: 'critical' as const };
  const humanResponseTitle = tx('dashboard.stats.humanResponseTime', 'Resposta média humana');
  const aiResponseTitle = tx('dashboard.stats.aiResponseTime', 'Resposta média IA');
  const responseSubtitle = tx('dashboard.stats.responseTimeSubtitle', 'Após a última mensagem do cliente');

  const csatStatus = data.csat.total_responses === 0
    ? { label: tx('dashboard.status.noSample', 'Sem base'), tone: 'neutral' as const }
    : data.csat.avg_rating >= 4
      ? { label: tx('dashboard.status.good', 'Bom'), tone: 'good' as const }
      : data.csat.avg_rating >= 3
        ? { label: tx('dashboard.status.warning', 'Atenção'), tone: 'warning' as const }
        : { label: tx('dashboard.status.critical', 'Crítico'), tone: 'critical' as const };

  const followUpStatus = data.follow_ups.pending === 0
    ? { label: tx('dashboard.status.good', 'Em dia'), tone: 'good' as const }
    : data.follow_ups.pending <= 10
      ? { label: tx('dashboard.status.warning', 'Atenção'), tone: 'warning' as const }
      : { label: tx('dashboard.status.critical', 'Atraso alto'), tone: 'critical' as const };

  const unassignedStatus = data.stats.unassigned_conversations === 0
    ? { label: tx('dashboard.status.good', 'Cobertura ok'), tone: 'good' as const }
    : data.stats.unassigned_conversations <= 5
      ? { label: tx('dashboard.status.warning', 'Atenção'), tone: 'warning' as const }
      : { label: tx('dashboard.status.critical', 'Risco operacional'), tone: 'critical' as const };
  const hasAiVsHumanSample = (data.ai_vs_human.ai_messages_count + data.ai_vs_human.human_messages_count) > 0;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{tx('dashboard.sections.statusNow', 'Status da operação agora')}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {tx('dashboard.sections.statusNowSubtitle', 'Indicadores-chave para leitura rápida da saúde operacional')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
        <div data-tour="dashboard-messages-card" className="h-full">
          <DashboardMetricCard
            title={t('dashboard.stats.incomingMessages') || 'Mensagens recebidas'}
            value={data.stats.incoming_messages_count}
            subtitle={`${data.stats.outgoing_messages_count} ${t('dashboard.stats.sent')}`}
            icon={MessageSquare}
            accentClassName="bg-fuchsia-500/20 text-fuchsia-400"
            importance="primary"
            status={{
              label: tx('dashboard.status.volume', 'Volume no período'),
              tone: 'neutral',
            }}
            tooltip={{ title: tTours('dashboard.step2.title'), content: tTours('dashboard.step2.content') }}
          />
        </div>

        <div data-tour="dashboard-response-time-card" className="h-full" role="group" aria-label={humanResponseTitle}>
          <DashboardMetricCard
            title={humanResponseTitle}
            value={formatSeconds(data.ai_vs_human.avg_response_time_human_seconds)}
            subtitle={responseSubtitle}
            icon={Users}
            accentClassName="bg-sky-500/20 text-sky-400"
            importance="primary"
            status={responseStatus(data.ai_vs_human.avg_response_time_human_seconds)}
            tooltip={{ title: humanResponseTitle, content: tTours('dashboard.step3.content') }}
          />
        </div>

        <div data-tour="dashboard-ai-response-time-card" className="h-full" role="group" aria-label={aiResponseTitle}>
          <DashboardMetricCard
            title={aiResponseTitle}
            value={formatSeconds(data.ai_vs_human.avg_response_time_ai_seconds)}
            subtitle={responseSubtitle}
            icon={Bot}
            accentClassName="bg-indigo-500/20 text-indigo-400"
            importance="primary"
            status={responseStatus(data.ai_vs_human.avg_response_time_ai_seconds)}
            tooltip={{ title: aiResponseTitle, content: tTours('dashboard.step3.content') }}
          />
        </div>

        <div data-tour="dashboard-csat-card" className="h-full">
          <DashboardMetricCard
            title={t('dashboard.csat.avg') || 'CSAT médio'}
            value={`${data.csat.avg_rating.toFixed(2)} / 5`}
            subtitle={`${data.csat.total_responses} ${t('dashboard.csat.responses') || 'avaliações'}`}
            icon={CheckCircle2}
            accentClassName="bg-violet-500/20 text-violet-400"
            importance="primary"
            status={csatStatus}
            tooltip={{ title: tTours('dashboard.step4.title'), content: tTours('dashboard.step4.content') }}
          />
        </div>

        <div data-tour="dashboard-followups-card" className="h-full">
          <DashboardMetricCard
            title={t('dashboard.stats.followUpsPending')}
            value={data.follow_ups.pending}
            subtitle={`${data.follow_ups.overdue} ${tx('dashboard.status.overdue', 'em atraso')}`}
            icon={AlertTriangle}
            accentClassName="bg-amber-500/20 text-amber-400"
            importance="primary"
            status={followUpStatus}
            tooltip={{ title: tTours('dashboard.step5.title'), content: tTours('dashboard.step5.content') }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card className="xl:col-span-7 border-primary/20 bg-primary/[0.02]" data-tour="dashboard-ia-vs-human">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              {tx('dashboard.aiVsHuman.title', 'IA vs Humano')}
              <TooltipInfo title={tTours('dashboard.step6.title')} content={tTours('dashboard.step6.content')} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasAiVsHumanSample && (
              <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/10 p-3 text-sm text-muted-foreground">
                {tx('dashboard.aiVsHuman.noDataHint', 'IA ainda não está ativa neste período, ou as respostas não foram classificadas.')}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{tx('dashboard.aiVsHuman.aiShare', 'Participação IA')}</span>
                  <span className="font-semibold">{data.ai_vs_human.ai_messages_share}%</span>
                </div>
                <div className="h-2 rounded bg-muted overflow-hidden">
                  <div className="h-2 bg-indigo-500" style={{ width: `${data.ai_vs_human.ai_messages_share}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.ai_vs_human.ai_messages_count} {tx('dashboard.aiVsHuman.responses', 'respostas IA')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{tx('dashboard.aiVsHuman.humanShare', 'Participação humana')}</span>
                  <span className="font-semibold">{data.ai_vs_human.human_messages_share}%</span>
                </div>
                <div className="h-2 rounded bg-muted overflow-hidden">
                  <div className="h-2 bg-sky-500" style={{ width: `${data.ai_vs_human.human_messages_share}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.ai_vs_human.human_messages_count} {tx('dashboard.aiVsHuman.responsesHuman', 'respostas humanas')}
                </p>
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
          <Card className="border-dashed border-amber-500/40 bg-amber-500/[0.03]" data-tour="dashboard-active-conversations">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-amber-400" />
                {tx('dashboard.stats.activeConversations', 'Conversas ativas agora')}
                <TooltipInfo title={tTours('dashboard.step7.title')} content={tTours('dashboard.step7.content')} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold">{data.stats.open_conversations}</div>
                <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10">
                  {data.stats.open_conversations > 0
                    ? tx('dashboard.status.monitor', 'Monitorar')
                    : tx('dashboard.status.good', 'Estável')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {tx('dashboard.status.currentBacklog', 'Backlog operacional atual')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed border-rose-500/40 bg-rose-500/[0.03]" data-tour="dashboard-unassigned">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserX className="h-4 w-4 text-rose-400" />
                {tx('dashboard.stats.unassignedConversations', 'Conversas sem responsável')}
                <TooltipInfo title={tTours('dashboard.step8.title')} content={tTours('dashboard.step8.content')} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold">{data.stats.unassigned_conversations}</div>
                <Badge
                  variant="outline"
                  className={
                    unassignedStatus.tone === 'critical'
                      ? 'border-red-500/40 text-red-700 dark:text-red-300 bg-red-500/10'
                      : unassignedStatus.tone === 'warning'
                        ? 'border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10'
                        : 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10'
                  }
                >
                  {unassignedStatus.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {data.stats.pending_conversations} {tx('dashboard.status.pendingNow', 'pendentes agora')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DashboardMetricsSection;
