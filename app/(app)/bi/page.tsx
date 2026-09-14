"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, TrendingUp, Users, ShoppingBag, BarChart3, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { PageHeader } from "@/components/ui/page-header"
import Content from "@/components/layout/content"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from "recharts"

const SUGGESTED_QUESTIONS = [
  { icon: Users, text: "Who are my best customers?" },
  { icon: ShoppingBag, text: "What is my best-selling product?" },
  { icon: TrendingUp, text: "How are my sales this month vs last month?" },
  { icon: BarChart3, text: "What are my peak selling hours?" },
]

const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5100 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6200 },
  { month: "May", revenue: 5800 },
  { month: "Jun", revenue: 7100 },
]

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const topProductsData = [
  { name: "Product A", sales: 142 },
  { name: "Product B", sales: 98 },
  { name: "Product C", sales: 76 },
  { name: "Product D", sales: 64 },
]

const topProductsConfig = {
  sales: {
    label: "Sales",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const customerSegmentData = [
  { name: "Returning", value: 62, fill: "var(--chart-1)" },
  { name: "New", value: 38, fill: "var(--chart-3)" },
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  chart?: "revenue" | "products" | "segments"
}

const MOCK_CONVERSATIONS: Record<string, Message[]> = {
  "Who are my best customers?": [
    {
      id: "1",
      role: "user",
      content: "Who are my best customers?",
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Based on your last 30 days of data, here's a breakdown of your customer segments:\n\n**Returning customers** make up 62% of your revenue and spend 2.4x more per order than new customers. Your top 5 customers alone account for 28% of total revenue.\n\nI'd recommend focusing on retention campaigns for your top segment — they're your highest-value asset.",
      chart: "segments",
    },
  ],
  "What is my best-selling product?": [
    {
      id: "1",
      role: "user",
      content: "What is my best-selling product?",
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Your top-performing product this month is **Product A** with 142 units sold, generating $3,840 in revenue. Here's the full ranking:\n\nProduct A is outperforming the next best seller by 45%. Consider bundling it with lower-performing items to boost their visibility.",
      chart: "products",
    },
  ],
  "How are my sales this month vs last month?": [
    {
      id: "1",
      role: "user",
      content: "How are my sales this month vs last month?",
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Great news — your revenue is up **22%** compared to last month! 📈\n\nThis month: **$7,100**\nLast month: **$5,800**\n\nThe upward trend started in April and has been consistent. Your growth rate is above the average for businesses your size.",
      chart: "revenue",
    },
  ],
  "What are my peak selling hours?": [
    {
      id: "1",
      role: "user",
      content: "What are my peak selling hours?",
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Your peak selling hours are **11am–2pm** and **6pm–9pm**, accounting for 58% of daily orders.\n\nInterestingly, your **Tuesday** and **Thursday** evenings perform 30% better than other weekdays. Consider scheduling campaigns to go out right before these windows for maximum engagement.",
    },
  ],
}

export default function BIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSuggestion = (question: string) => {
    const response = MOCK_CONVERSATIONS[question]
    if (!response) return

    setIsTyping(true)
    setMessages((prev) => [...prev, response[0]])

    setTimeout(() => {
      setMessages((prev) => [...prev, response[1]])
      setIsTyping(false)
    }, 1200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setIsTyping(true)
    setMessages((prev) => [...prev, userMsg])
    setInput("")

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm analyzing your data... This is a preview of the feature. In the full version, I'll provide detailed insights about your business with interactive charts and actionable recommendations.",
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  const renderChart = (chartType: Message["chart"]) => {
    if (!chartType) return null

    switch (chartType) {
      case "revenue":
        return (
          <Card className="mt-3 p-4 bg-background border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-3">Monthly Revenue</p>
            <ChartContainer config={revenueChartConfig} className="h-45 w-full">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </Card>
        )

      case "products":
        return (
          <Card className="mt-3 p-4 bg-background border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-3">Top Products by Units Sold</p>
            <ChartContainer config={topProductsConfig} className="h-[180px] w-full">
              <BarChart data={topProductsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </Card>
        )

      case "segments":
        return (
          <Card className="mt-3 p-4 bg-background border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-3">Customer Segments</p>
            <div className="flex items-center gap-6">
              <ChartContainer config={{}} className="h-[140px] w-[140px] shrink-0">
                <PieChart>
                  <Pie
                    data={customerSegmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {customerSegmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
              </ChartContainer>
              <div className="space-y-3">
                {customerSegmentData.map((seg) => (
                  <div key={seg.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: seg.fill }} />
                    <span className="text-sm text-muted-foreground">{seg.name}</span>
                    <span className="text-sm font-medium ml-auto">{seg.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
    }
  }

  const isEmpty = messages.length === 0

  return (
    <Content className="flex flex-col h-full">
      <div className="flex flex-col h-full">
        <PageHeader title="Business Intelligence" />

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
            <div className="max-w-lg text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Ask anything about your business
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Ask simple questions or dive into complex analysis — explore your
                  data and get actionable answers about your business.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-left">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => handleSuggestion(q.text)}
                    className="group flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <q.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground leading-snug">
                      {q.text}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Try asking about trends, comparisons, or forecasts</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 px-4 overflow-y-auto" ref={scrollRef}>
            <div className="max-w-2xl mx-auto py-4 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {/* {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )} */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : ""
                      }`}
                  >
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />')
                    }} />
                    {msg.chart && renderChart(msg.chart)}
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-muted">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-border bg-background p-3 md:p-4">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your business..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </Content>
  )
}
