"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, GraduationCap, Moon, Sun, Notebook, MoreVertical, X } from "lucide-react"

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const BATCH_OPTIONS = ["2022", "2023", "2024", "2025"]
const SCHOOL_OPTIONS = ["SEECS", "SMME", "S3H", "NBS", "NSHS", "IGIS", "ASAB"]
const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => String(i + 1))
const formatDateForInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface UserProfile {
  batchNumber: string
  school: string
  major: string
  semester: string
  hostelResident: boolean
  section?: string
}

interface ScheduleItem {
  id: string
  subject: string
  time: string
  location: string
  type: "lecture" | "lab" | "tutorial" | "NA"
  day: string
  major: string
  batchNumber: string
}

interface ClassNote {
  scheduleId: string
  note: string
}

const SECTION_BASED_MAJORS = ["Electrical Engineering", "Computer Science", "Mechanical Engineering"] as const
const DAY_ALIASES: Record<string, string> = {
  monday: "Monday", mon: "Monday", mo: "Monday",
  tuesday: "Tuesday", tue: "Tuesday", tues: "Tuesday", tu: "Tuesday",
  wednesday: "Wednesday", wed: "Wednesday", we: "Wednesday",
  thursday: "Thursday", thu: "Thursday", thur: "Thursday", thurs: "Thursday", th: "Thursday",
  friday: "Friday", fri: "Friday", fr: "Friday",
  saturday: "Saturday", sat: "Saturday", sa: "Saturday",
  sunday: "Sunday", sun: "Sunday", su: "Sunday",
}

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")
const isSectionBasedMajor = (major: string) => SECTION_BASED_MAJORS.some((sectionMajor) => normalizeKey(sectionMajor) === normalizeKey(major))
const getRowValue = (row: Record<string, unknown>, aliases: string[]) => {
  const rowEntries = Object.entries(row)
  for (const alias of aliases) {
    const normalizedAlias = normalizeKey(alias)
    const match = rowEntries.find(([key]) => normalizeKey(key) === normalizedAlias)
    if (match && match[1] != null && String(match[1]).trim() !== "") {
      return String(match[1]).trim()
    }
  }
  return ""
}

const normalizeDay = (value: string, fallbackSheetName?: string) => {
  const raw = `${value || ""} ${fallbackSheetName || ""}`.toLowerCase()
  for (const [alias, normalized] of Object.entries(DAY_ALIASES)) {
    if (raw.includes(alias)) return normalized
  }
  return ""
}

const normalizeType = (value: string): ScheduleItem["type"] => {
  const normalized = value.toLowerCase()
  if (normalized.includes("lab")) return "lab"
  if (normalized.includes("tutorial")) return "tutorial"
  if (normalized === "na" || normalized.includes("n/a")) return "NA"
  return "lecture"
}
const shouldIgnoreSubject = (value: string) => {
  const normalized = value.toLowerCase().trim()
  if (!normalized) return true
  return normalized === "free" || normalized.includes("lunch") || normalized.includes("break") || normalized.includes("prayer")
}

const normalizeSection = (value: string) => {
  const cleaned = value.replace(/section/gi, "").trim().toUpperCase()
  const match = cleaned.match(/\b([A-Z])\b/)
  return match ? match[1] : cleaned
}

const inferMajorFromSheetName = (sheetName: string) => {
  const normalized = normalizeKey(sheetName)
  const majors = ["Electrical Engineering", "Software Engineering", "Computer Science", "Artificial Intelligence", "Data Science"]
  const known = majors.find(major => normalized.includes(normalizeKey(major)))
  if (known) return known
  const raw = sheetName.toLowerCase()
  const codeMatch = raw.match(/(?:^|[-_ ])([a-z]{2,})(?=\d|[-_ ]|$)/)
  const code = codeMatch?.[1]?.toUpperCase() || ""
  if (code === "CS") return "Computer Science"
  if (code === "SE") return "Software Engineering"
  if (code === "EE") return "Electrical Engineering"
  if (code === "AI") return "Artificial Intelligence"
  if (code === "DS") return "Data Science"
  if (code) return code
  return ""
}

const inferSectionFromSheetName = (sheetName: string) => {
  const explicit = sheetName.match(/section\s*([a-z])/i)
  if (explicit?.[1]) return explicit[1].toUpperCase()
  const suffix = sheetName.match(/[_-]([a-e])$/i)
  if (suffix?.[1]) return suffix[1].toUpperCase()
  const separated = sheetName.match(/(?:^|[_ -])([a-e])(?:[_ -]|$)/i)
  return separated?.[1]?.toUpperCase() || ""
}
const inferBatchFromSheetName = (sheetName: string) => {
  const fullYear = sheetName.match(/\b(20\d{2})\b/)
  if (fullYear?.[1]) return fullYear[1]
  const shortYear = sheetName.match(/2k(\d{2})/i)
  if (shortYear?.[1]) return `20${shortYear[1]}`
  return ""
}

export default function UniApp() {
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    batchNumber: "", school: "", major: "", semester: "", hostelResident: false, section: ""
  })

  const [selectedDate, setSelectedDate] = useState(() => formatDateForInput(new Date()))
  const [darkMode, setDarkMode] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [notes, setNotes] = useState<ClassNote[]>([])
  const [scheduleByMajorSection, setScheduleByMajorSection] = useState<Record<string, Record<string, ScheduleItem[]>>>({})
  const [scheduleByMajorNoSection, setScheduleByMajorNoSection] = useState<Record<string, ScheduleItem[]>>({})
  const [majorsFromWorkbook, setMajorsFromWorkbook] = useState<string[]>([])
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const noteInputRef = useRef<HTMLInputElement | null>(null)
  const availableMajors = useMemo(
    () => [...new Set([...majorsFromWorkbook, ...Object.keys(scheduleByMajorSection), ...Object.keys(scheduleByMajorNoSection)])].filter(Boolean).sort(),
    [majorsFromWorkbook, scheduleByMajorSection, scheduleByMajorNoSection],
  )
  const selectedDateObject = useMemo(() => {
    const parsed = new Date(`${selectedDate}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }, [selectedDate])
  const selectedDay = useMemo(
    () => selectedDateObject.toLocaleDateString("en-US", { weekday: "long" }),
    [selectedDateObject],
  )
  const selectedDateLabel = useMemo(
    () => selectedDateObject.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
    [selectedDateObject],
  )

  // Load profile/notes/darkmode
  useEffect(() => {
    const savedProfile = localStorage.getItem("uniapp-profile")
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
      setIsOnboarded(true)
    }

    const savedDarkMode = localStorage.getItem("uniapp-dark-mode")
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode)
      setDarkMode(isDark)
      document.documentElement.classList.toggle("dark", isDark)
    }

    const savedNotes = localStorage.getItem("uniapp-notes")
    if (savedNotes) setNotes(JSON.parse(savedNotes))
  }, [])

  // Save notes
  useEffect(() => {
    localStorage.setItem("uniapp-notes", JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    if (!isOnboarded) return
    localStorage.setItem("uniapp-profile", JSON.stringify(userProfile))
  }, [isOnboarded, userProfile])

  // Load XLSX schedule
  useEffect(() => {
    const loadXlsxSchedule = async () => {
      try {
        setIsLoadingSchedule(true)
        const [{ read, utils }, scheduleRes] = await Promise.all([import("xlsx"), fetch("/output6.xlsx")])
        if (!scheduleRes.ok) throw new Error("XLSX not found")
        
        const workbook = read(await scheduleRes.arrayBuffer(), { type: "array" })
        const sectionedMap: Record<string, Record<string, ScheduleItem[]>> = {}
        const noSectionMap: Record<string, ScheduleItem[]> = {}
        const majorsSet = new Set<string>()
        let generatedId = 1

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName]
          const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
          const inferredMajor = inferMajorFromSheetName(sheetName)
          if (inferredMajor) majorsSet.add(inferredMajor)
          const inferredSection = inferSectionFromSheetName(sheetName)
          const inferredBatch = inferBatchFromSheetName(sheetName)

          rows.forEach((row) => {
            const rowValues = Object.values(row).map((value) => String(value || "").trim()).filter(Boolean)
            const major = inferredMajor || getRowValue(row, ["major", "department", "program", "discipline", "degree"])
            if (!major) return

            const section = normalizeSection(inferredSection || getRowValue(row, ["section", "group", "sec"]))
            const subject = getRowValue(row, ["subject", "course", "course title", "course_name", "course code", "title", "module"])
            const location = getRowValue(row, ["location", "venue", "room", "classroom", "hall"]) || "TBD"
            const day = normalizeDay(getRowValue(row, ["day", "weekday"]), sheetName) || rowValues.map((value) => normalizeDay(value)).find(Boolean) || ""
            const time = getRowValue(row, ["time", "slot", "timing", "time slot", "start-end"]) || rowValues.find((v) => /\d{1,2}:\d{2}.*[-–].*\d{1,2}:\d{2}/i.test(v)) || ""
            const type = normalizeType(getRowValue(row, ["type", "class type", "mode"]))

            const resolvedSubject = subject || rowValues.find((v) => v.length > 3 && !normalizeDay(v) && !/\d{1,2}:\d{2}/.test(v)) || ""
            if (!resolvedSubject || !day || !time || shouldIgnoreSubject(resolvedSubject)) return

            const item: ScheduleItem = { id: `xlsx-${generatedId++}`, subject: resolvedSubject, time, location, type, day, major, batchNumber: inferredBatch }

            if (section) {
              if (!sectionedMap[major]) sectionedMap[major!] = {}
              if (!sectionedMap[major][section]) sectionedMap[major][section] = []
              sectionedMap[major][section].push(item)
            } else if (noSectionMap[major]) {
              noSectionMap[major].push(item)
            } else {
              noSectionMap[major!] = [item]
            }
          })
        })

        setScheduleByMajorSection(sectionedMap)
        setScheduleByMajorNoSection(noSectionMap)
        setMajorsFromWorkbook(Array.from(majorsSet).sort())
      } catch (error) {
        console.error("Error loading schedule XLSX:", error)
      } finally {
        setIsLoadingSchedule(false)
      }
    }

    loadXlsxSchedule()
  }, [])


  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Normalize major casing for better matching
    const normalizedProfile = {
      ...userProfile,
      major: userProfile.major.trim() // Clean input
    }
    localStorage.setItem("uniapp-profile", JSON.stringify(normalizedProfile))
    setUserProfile(normalizedProfile)
    setIsOnboarded(true)
  }


  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("uniapp-dark-mode", JSON.stringify(newDarkMode))
    document.documentElement.classList.toggle("dark", newDarkMode)
  }

  const notesByScheduleId = useMemo(() => 
    notes.reduce<Record<string, string>>((acc, note) => { acc[note.scheduleId] = note.note; return acc }, {}), 
  [notes])

  const getNoteForClass = (scheduleId: string) => notesByScheduleId[scheduleId] || ""

  const saveNote = (scheduleId: string, noteText: string) => {
    setNotes(prev => {
      const existing = prev.find(n => n.scheduleId === scheduleId)
      if (existing) {
        return prev.map(n => n.scheduleId === scheduleId ? { scheduleId, note: noteText } : n)
      }
      return [...prev, { scheduleId, note: noteText }]
    })
    setEditingNoteId(null)
  }

  const getCountdownText = (timeStr: string, classDay: string) => {
    try {
      const now = new Date()
      const today = now.toLocaleDateString("en-US", { weekday: "long" })
      const todayIdx = WEEKDAY_NAMES.indexOf(today)
      const dayIdx = WEEKDAY_NAMES.indexOf(classDay)
      
      if (dayIdx < todayIdx) return "Completed"
      if (dayIdx > todayIdx) return "Upcoming"

      const [startTime] = timeStr.split(" - ")
      const [time, period] = startTime.split(" ")
      const [hours, minutes] = time.split(':').map(Number)
      let hour24 = period === "PM" && hours !== 12 ? hours + 12 : period === "AM" && hours === 12 ? 0 : hours

      const classTime = new Date()
      classTime.setHours(hour24, minutes, 0, 0)

      const diffMs = classTime.getTime() - now.getTime()
      if (diffMs < 0) return "In progress"

      const hoursLeft = Math.floor(diffMs / 3600000)
      const minsLeft = Math.floor((diffMs % 3600000) / 60000)
      return hoursLeft > 0 ? `in ${hoursLeft}h ${minsLeft}m` : minsLeft > 0 ? `in ${minsLeft}m` : "Now"
    } catch {
      return ""
    }
  }

  const getTypeColor = (type: ScheduleItem["type"]) => {
    const colors: Record<ScheduleItem["type"], string> = {
      lecture: "bg-primary text-primary-foreground",
      lab: "bg-secondary text-secondary-foreground", 
      tutorial: "bg-accent text-accent-foreground",
      NA: "bg-destructive text-destructive-foreground"
    }
    return colors[type] || "bg-muted text-muted-foreground"
  }


const getScheduleForDay = (day: string) => {
  const normalizedUserMajor = normalizeKey(userProfile.major)
  const majorKey = availableMajors.find(k => normalizeKey(k) === normalizedUserMajor) || userProfile.major
  const matchesSelectedFilters = (item: ScheduleItem) => {
    const matchesMajor = normalizeKey(item.major) === normalizeKey(majorKey as string)
    const matchesBatch = !userProfile.batchNumber || !item.batchNumber || item.batchNumber === userProfile.batchNumber
    return item.day === day && matchesMajor && matchesBatch
  }
  const majorSchedule = scheduleByMajorSection[majorKey as string]

  if (majorSchedule) {
    if (isSectionBasedMajor(majorKey as string)) {
      if (!userProfile.section) return []
      const sectionKey = Object.keys(majorSchedule).find(k => normalizeSection(k) === normalizeSection(userProfile.section || ""))
      if (sectionKey && majorSchedule[sectionKey]) {
        return majorSchedule[sectionKey].filter(matchesSelectedFilters)
      }
      return []
    }
    return Object.values(majorSchedule).flat().filter(matchesSelectedFilters)
  }

  const noSectionSchedule = scheduleByMajorNoSection[majorKey as string]
  return noSectionSchedule ? noSectionSchedule.filter(matchesSelectedFilters) : []
}


  const todaysClasses = getScheduleForDay(new Date().toLocaleDateString("en-US", { weekday: "long" }))
  const selectedDaySchedule = getScheduleForDay(selectedDay)

  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-heading">Welcome to UniApp</CardTitle>
            <p className="text-muted-foreground">Set up your profile to get started</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select onValueChange={(v) => setUserProfile(p => ({ ...p, batchNumber: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                  <SelectContent>{BATCH_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Select onValueChange={(v) => setUserProfile(p => ({ ...p, school: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                  <SelectContent>{SCHOOL_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Major</Label>
                <Select value={userProfile.major} onValueChange={(major) => setUserProfile(p => ({ ...p, major }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingSchedule ? "Loading majors..." : "Select major"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMajors.map((major) => (
                      <SelectItem key={major} value={major}>{major}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableMajors.length > 0 && (
                  <p className="text-xs text-muted-foreground">{availableMajors.length} majors found in output6.xlsx</p>
                )}
              </div>
              {(isSectionBasedMajor(userProfile.major) && (
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select onValueChange={(v) => setUserProfile(p => ({ ...p, section: v }))}>
                    <SelectTrigger><SelectValue placeholder="A/B/C" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem>
                      {userProfile.major.includes("Electrical") && <SelectItem value="D">D</SelectItem>}
                      {userProfile.major.includes("Computer") && <SelectItem value="E">E</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select onValueChange={(v) => setUserProfile(p => ({ ...p, semester: v }))}>
                  <SelectTrigger><SelectValue placeholder="1st Semester" /></SelectTrigger>
                  <SelectContent>{SEMESTER_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}{s==='1'?'st':s==='2'?'nd':s==='3'?'rd':'th'} Semester</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Accommodation</Label>
                <Select onValueChange={(v) => setUserProfile(p => ({ ...p, hostelResident: v === "hostel" }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="dayscholar">Day Scholar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Get Started ✨</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card/95 backdrop-blur border-b px-3 py-3 sm:p-4 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-background drop-shadow-sm" />
              </div>
              <div className="min-w-0">

                <h1 className="font-bold text-lg sm:text-xl leading-tight">UniApp</h1>
                <div className="flex items-center gap-1 mt-1 min-w-0">
                  <Select value={userProfile.major} onValueChange={(major) => setUserProfile(prev => ({ ...prev, major }))}>
                    <SelectTrigger className="h-8 w-24 sm:w-32 text-xs border-0 bg-transparent hover:bg-transparent p-0 truncate">
                      <SelectValue placeholder="Select major" />
                    </SelectTrigger>
                    <SelectContent align="end" className="w-48">
                      {availableMajors.map((major) => (
                        <SelectItem key={major} value={major}>{major}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">• {userProfile.semester} Sem</span>
                </div>

              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {userProfile.hostelResident && (
                <Badge variant="outline" className="hidden sm:inline-flex gap-1 px-2 py-0.5 text-xs">
                  <MapPin className="w-3 h-3" />
                  Hostel
                </Badge>
              )}

              {availableMajors.length > 0 && (
                <Badge variant="secondary" className="hidden md:inline-flex text-xs">
                  📊 {availableMajors.length} unique majors from XLSX
                </Badge>
              )}

              <Button variant="ghost" size="sm" onClick={() => setShowSidebar(true)} className="h-9 w-9 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {showSidebar && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSidebar(false)} />
            <div className="fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-card border-l shadow-2xl z-50 transform transition-all translate-x-0">
              <div className="p-4 sm:p-6 border-b flex items-center justify-between">
                <h2 className="font-bold text-lg">Options</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                <Button variant={darkMode ? "default" : "outline"} className="w-full justify-start gap-2" onClick={toggleDarkMode}>
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {darkMode ? "Light" : "Dark"} Mode
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => {
                  localStorage.clear()
                  location.reload()
                }}>
                  Reset Everything
                </Button>
              </div>
            </div>
          </>
        )}

        <main className="max-w-4xl mx-auto px-4 py-6 pb-20 sm:p-6 sm:pb-20">
          {/* Today's Classes */}
          {todaysClasses.length > 0 && (
            <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/20 border-primary/30 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center p-3 border">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Today's Classes</CardTitle>
                    <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaysClasses.slice(0, 4).map((cls) => (
                    <div key={cls.id} className="group flex items-start p-4 rounded-2xl bg-background/50 border hover:border-primary/50 transition-all hover:shadow-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-base sm:text-lg line-clamp-2 sm:line-clamp-1">{cls.subject}</h3>
                          <Badge className={getTypeColor(cls.type)}>{cls.type}</Badge>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {cls.time}
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{cls.location}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm font-medium">
                          {getCountdownText(cls.time, cls.day)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {todaysClasses.length > 4 && (
                    <div className="text-center pt-4 border-t text-sm text-muted-foreground">
                      +{todaysClasses.length - 4} more today
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoadingSchedule && (
            <div className="space-y-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
                  Class Schedule
                </h2>
                <p className="text-sm text-muted-foreground mb-4">Viewing: {selectedDateLabel}</p>
                <div className="flex gap-3 items-center flex-wrap">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => setSelectedDate(formatDateForInput(new Date()))}>
                    Today
                  </Button>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value || formatDateForInput(new Date()))} className="w-full sm:w-44" />
                </div>
              </div>
            </div>
          )}

          {isLoadingSchedule ? (
            <Card className="text-center p-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary/20 border-t-primary mx-auto mb-3" />
              <p>Loading schedule from output6.xlsx...</p>
            </Card>
          ) : selectedDaySchedule.length === 0 ? (
            <Card className="text-center p-12 border-dashed">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-1">No classes for {selectedDateLabel}</h3>
              <p className="text-muted-foreground mb-4">Try another date</p>
              {isSectionBasedMajor(userProfile.major) && !userProfile.section && (
                <p className="text-sm text-muted-foreground mb-2">Select your section to view section-specific classes.</p>
              )}
              {Object.keys(scheduleByMajorSection).length === 0 && Object.keys(scheduleByMajorNoSection).length === 0 && (
                <p className="text-destructive text-sm">
                  No schedule data found in output6.xlsx for {userProfile.major}
                </p>
              )}
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {selectedDaySchedule.map((cls) => {
                  const noteText = getNoteForClass(cls.id)
                  const isEditing = editingNoteId === cls.id
                  return (
                    <Card key={cls.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4 sm:p-6 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                              <h3 className="text-lg sm:text-xl font-bold">{cls.subject}</h3>
                              <Badge className={`${getTypeColor(cls.type)} px-3 py-1`}>{cls.type.toUpperCase()}</Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{cls.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium truncate">{cls.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 text-sm font-medium text-primary shrink-0">
                            <span>{getCountdownText(cls.time, cls.day)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-6 pb-6 pt-0">
                        {isEditing ? (
                          <div className="space-y-3 bg-muted/30 p-4 rounded-xl">
                            <Input
                              ref={noteInputRef}
                              autoFocus
                              defaultValue={noteText}
                              placeholder="Add class notes, homework, important points..."
                              onBlur={e => saveNote(cls.id, e.target.value)}
                              onKeyDown={e => { 
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  saveNote(cls.id, (e.target as HTMLInputElement).value)
                                }
                              }}
                              className="min-h-[80px] resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="sm" onClick={() => setEditingNoteId(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => saveNote(cls.id, noteInputRef.current?.value || noteText)}>
                                Save Note
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button className="group w-full flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-accent transition-all hover:shadow-md" onClick={() => setEditingNoteId(cls.id)}>
                            {noteText ? (
                              <>
                                <Notebook className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
                                <span className="text-sm text-muted-foreground line-clamp-2">{noteText}</span>
                              </>
                            ) : (
                              <>
                                <Notebook className="w-5 h-5 mt-0.5 text-muted-foreground/50 flex-shrink-0 group-hover:text-muted-foreground" />
                                <span className="text-sm text-muted-foreground/60">Click to add notes for {cls.subject}...</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
