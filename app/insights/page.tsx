'use client'

import AppShell from '@/components/layout/AppShell'
import { useReadingItems } from '@/hooks/use-reading-items'
import {
  getQueuedItems,
  getCurrentlyReading,
  getFinishedItems,
  getWeeklySaveCounts,
  groupItemsByTopic,
  groupItemsByPublisher,
  computeCompletionRateByPublisher,
} from '@/lib/selectors'
import { TOPIC_LABELS } from '@/lib/constants'
import { formatReadTime } from '@/lib/formatters'
import type { Topic } from '@/lib/types'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

// ---- Shared chart style constants ----
const GRID_STROKE = '#ffffff15'
const TICK_FILL = '#ffffff60'
const TICK_FONT_SIZE = 12

interface TooltipPayloadEntry {
  name: string
  value: number
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  label?: string
  payload?: TooltipPayloadEntry[]
}

function ChartTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm text-white shadow-lg">
      {label && <p className="text-white/50 text-xs mb-1">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color ?? '#fff' }}>
          {entry.name}: <span className="font-semibold tabular-nums">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
      {children}
    </h2>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="flex-1 bg-[#141414] border border-white/[0.08] rounded-xl p-5 flex flex-col gap-1 min-w-0">
      <span className="text-3xl font-bold tabular-nums text-white">{value}</span>
      {sub && <span className="text-xs text-white/40 tabular-nums">{sub}</span>}
      <span className="text-xs text-white/40 uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  )
}

export default function InsightsPage() {
  const { items } = useReadingItems()

  // ---- Section 1 stats ----
  const finished = getFinishedItems(items)
  const queued = getQueuedItems(items)
  const reading = getCurrentlyReading(items)

  const totalSaved = items.length
  const totalFinished = finished.length
  const completionRate =
    totalSaved > 0 ? Math.round((totalFinished / totalSaved) * 100) : 0

  const backlog = queued.length + reading.length

  const backlogItems = [...queued, ...reading]
  const backlogWithTime = backlogItems.filter((i) => i.estimatedMinutes !== undefined)
  const avgReadTime =
    backlogWithTime.length > 0
      ? Math.round(
          backlogWithTime.reduce((sum, i) => sum + (i.estimatedMinutes ?? 0), 0) /
            backlogWithTime.length
        )
      : 0

  // ---- Section 2 — weekly activity ----
  const weeklyData = getWeeklySaveCounts(items, 8)

  // ---- Section 3 — backlog by topic ----
  const topicGroups = groupItemsByTopic(backlogItems)
  const topicData = (Object.entries(topicGroups) as [Topic, typeof backlogItems][])
    .map(([topic, topicItems]) => ({
      topic: TOPIC_LABELS[topic],
      count: topicItems.length,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)

  // ---- Section 4 — backlog by publisher ----
  const publisherGroups = groupItemsByPublisher(backlogItems)
  const publisherData = Object.entries(publisherGroups)
    .map(([publisher, pubItems]) => ({ publisher, count: pubItems.length }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // ---- Section 5 — finish rate by publisher ----
  const completionRates = computeCompletionRateByPublisher(items)
  const allPublisherGroups = groupItemsByPublisher(items)
  const finishRateData = Object.entries(completionRates)
    .filter(([publisher]) => (allPublisherGroups[publisher]?.length ?? 0) >= 2)
    .map(([publisher, rate]) => ({ publisher, rate }))
    .sort((a, b) => b.rate - a.rate)

  return (
    <AppShell pageTitle="Insights">
      <div className="max-w-4xl space-y-8">
        {/* Section 1 — Stat cards */}
        <div className="flex gap-4 flex-wrap">
          <StatCard label="Total Saved" value={totalSaved} />
          <StatCard
            label="Total Finished"
            value={totalFinished}
            sub={`${completionRate}% completion rate`}
          />
          <StatCard label="Current Backlog" value={backlog} sub="queued + reading" />
          <StatCard
            label="Avg Read Time (queued)"
            value={backlogWithTime.length > 0 ? formatReadTime(avgReadTime) : '—'}
            sub={backlogWithTime.length > 0 ? `across ${backlogWithTime.length} items` : 'no estimates'}
          />
        </div>

        {/* Section 2 — Reading Activity line chart */}
        <div className="bg-[#141414] border border-white/8 rounded-xl p-5">
          <SectionHeading>Reading Activity — Last 8 Weeks</SectionHeading>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: TICK_FILL, fontSize: TICK_FONT_SIZE }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: TICK_FILL, fontSize: TICK_FONT_SIZE }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="saved"
                name="Saved"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="finished"
                name="Finished"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#22c55e' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3">
            <span className="flex items-center gap-2 text-xs text-white/50">
              <span className="inline-block w-5 h-0.5 bg-blue-500 rounded" />
              Saved
            </span>
            <span className="flex items-center gap-2 text-xs text-white/50">
              <span className="inline-block w-5 h-0.5 bg-green-500 rounded" />
              Finished
            </span>
          </div>
        </div>

        {/* Section 3 — Backlog by Topic */}
        {topicData.length > 0 && (
          <div className="bg-[#141414] border border-white/8 rounded-xl p-5">
            <SectionHeading>Unread by Topic</SectionHeading>
            <ResponsiveContainer width="100%" height={Math.max(180, topicData.length * 36)}>
              <BarChart
                data={topicData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: TICK_FILL, fontSize: TICK_FONT_SIZE }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="topic"
                  width={130}
                  tick={{ fill: TICK_FILL, fontSize: TICK_FONT_SIZE }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Items" fill="#3b82f6" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Section 4 — Backlog by Publisher */}
        {publisherData.length > 0 && (
          <div className="bg-[#141414] border border-white/8 rounded-xl p-5">
            <SectionHeading>Unread by Publisher</SectionHeading>
            <ResponsiveContainer width="100%" height={Math.max(180, publisherData.length * 36)}>
              <BarChart
                data={publisherData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: TICK_FILL, fontSize: TICK_FONT_SIZE }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="publisher"
                  width={130}
                  tick={{ fill: TICK_FILL, fontSize: TICK_FONT_SIZE }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Items" fill="#f59e0b" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Section 5 — Finish Rate by Publisher */}
        {finishRateData.length > 0 && (
          <div className="bg-[#141414] border border-white/8 rounded-xl p-5">
            <SectionHeading>Finish Rate by Publisher</SectionHeading>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs text-white/40 uppercase tracking-wider font-medium pb-2 pr-4">
                    Publisher
                  </th>
                  <th className="text-left text-xs text-white/40 uppercase tracking-wider font-medium pb-2 pr-4">
                    Saved
                  </th>
                  <th className="text-right text-xs text-white/40 uppercase tracking-wider font-medium pb-2">
                    Finish Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {finishRateData.map(({ publisher, rate }) => {
                  const total = allPublisherGroups[publisher]?.length ?? 0
                  return (
                    <tr key={publisher} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-4 text-white/80">{publisher}</td>
                      <td className="py-2.5 pr-4 text-white/40 tabular-nums">{total}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="tabular-nums text-white/70 w-10 text-right">
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-center text-white/40">
            <p className="text-sm">No data yet. Add some items to see insights.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
