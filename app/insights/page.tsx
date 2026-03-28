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
  LabelList,
} from 'recharts'

const GRID_STROKE = '#e5e7eb'
const TICK_FILL = '#9ca3af'
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
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 shadow-lg">
      {label && <p className="text-gray-500 text-xs mb-1">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color ?? '#111827' }}>
          {entry.name}: <span className="font-semibold tabular-nums">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
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
    <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all duration-200 flex flex-col gap-1 min-w-0">
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-3xl font-bold tabular-nums text-gray-900 mt-1 font-serif">{value}</span>
      {sub && <span className="text-xs text-gray-400 tabular-nums">{sub}</span>}
    </div>
  )
}

export default function InsightsPage() {
  const { items } = useReadingItems()

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

  const weeklyData = getWeeklySaveCounts(items, 8)

  const topicGroups = groupItemsByTopic(backlogItems)
  const topicData = (Object.entries(topicGroups) as [Topic, typeof backlogItems][])
    .map(([topic, topicItems]) => ({
      topic: TOPIC_LABELS[topic],
      count: topicItems.length,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)

  const publisherGroups = groupItemsByPublisher(backlogItems)
  const publisherData = Object.entries(publisherGroups)
    .map(([publisher, pubItems]) => ({ publisher, count: pubItems.length }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const completionRates = computeCompletionRateByPublisher(items)
  const allPublisherGroups = groupItemsByPublisher(items)
  const finishRateData = Object.entries(completionRates)
    .filter(([publisher]) => (allPublisherGroups[publisher]?.length ?? 0) >= 2)
    .map(([publisher, rate]) => ({ publisher, rate }))
    .sort((a, b) => b.rate - a.rate)

  return (
    <AppShell pageTitle="Insights">
      <div className="max-w-4xl space-y-5">
        {/* Stat cards */}
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

        {/* Reading Activity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
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
                stroke="#1e3a5f"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#1e3a5f' }}
              />
              <Line
                type="monotone"
                dataKey="finished"
                name="Finished"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#059669' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3">
            <span className="flex items-center gap-2 text-xs text-gray-400">
              <span className="inline-block w-5 h-0.5 rounded" style={{ background: '#1e3a5f' }} />
              Saved
            </span>
            <span className="flex items-center gap-2 text-xs text-gray-400">
              <span className="inline-block w-5 h-0.5 bg-emerald-600 rounded" />
              Finished
            </span>
          </div>
        </div>

        {/* Unread by Topic */}
        {topicData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <SectionHeading>Unread by Topic</SectionHeading>
            <ResponsiveContainer width="100%" height={Math.max(180, topicData.length * 36)}>
              <BarChart
                data={topicData}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  domain={[0, 'dataMax']}
                  allowDataOverflow={false}
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
                <Bar dataKey="count" name="Items" fill="#1e3a5f" radius={[0, 4, 4, 0]} barSize={18} minPointSize={4}>
                  <LabelList dataKey="count" position="right" style={{ fill: '#9ca3af', fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Unread by Publisher */}
        {publisherData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <SectionHeading>Unread by Publisher</SectionHeading>
            <ResponsiveContainer width="100%" height={Math.max(180, publisherData.length * 36)}>
              <BarChart
                data={publisherData}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  domain={[0, 'dataMax']}
                  allowDataOverflow={false}
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
                <Bar dataKey="count" name="Items" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={18} minPointSize={4}>
                  <LabelList dataKey="count" position="right" style={{ fill: '#9ca3af', fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Finish Rate by Publisher */}
        {finishRateData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <SectionHeading>Finish Rate by Publisher</SectionHeading>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-[11px] text-gray-400 uppercase tracking-widest font-semibold pb-2 pr-4">
                    Publisher
                  </th>
                  <th className="text-left text-[11px] text-gray-400 uppercase tracking-widest font-semibold pb-2 pr-4">
                    Saved
                  </th>
                  <th className="text-right text-[11px] text-gray-400 uppercase tracking-widest font-semibold pb-2">
                    Finish Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {finishRateData.map(({ publisher, rate }) => {
                  const total = allPublisherGroups[publisher]?.length ?? 0
                  return (
                    <tr key={publisher} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-2.5 pr-4 text-gray-800 text-sm">{publisher}</td>
                      <td className="py-2.5 pr-4 text-gray-400 tabular-nums text-sm">{total}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="tabular-nums text-gray-500 w-10 text-right text-xs">
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
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-center text-gray-400">
            <p className="text-sm">No data yet. Add some items to see insights.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
