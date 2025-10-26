"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Utensils, GraduationCap, BookOpen } from "lucide-react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const BATCH_OPTIONS = ["2022", "2023", "2024", "2025"]
const SCHOOL_OPTIONS = ["SEECS", "SMME", "S3H", "NBS", "NSHS", "IGIS", "ASAB"]
const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => String(i + 1))

const getISOWeek = (date: Date) => {
  const tmp = new Date(date.getTime())
  tmp.setHours(0, 0, 0, 0)
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7))
  const week1 = new Date(tmp.getFullYear(), 0, 4)
  return 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
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
}

interface MessMenuItem {
  id: string
  meal: "breakfast" | "lunch" | "dinner"
  items: string[]
  time: string
}

interface ExamItem {
  date: string
  time: string
  subject: string
  major: string
  batch: string
  venue?: string
}

export default function UniApp() {
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    batchNumber: "",
    school: "",
    major: "",
    semester: "",
    hostelResident: false,
    section: "",
  })

  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString("en-US", { weekday: "long" }))
  const [selectedMessDay, setSelectedMessDay] = useState(new Date().toLocaleDateString("en-US", { weekday: "long" }))
  const [messAnchorWeek, setMessAnchorWeek] = useState<number | null>(null)

  const [examMajor, setExamMajor] = useState("")
  const [examData, setExamData] = useState<ExamItem[]>([])
  const [examMajors, setExamMajors] = useState<string[]>([])
  const [loadingExams, setLoadingExams] = useState(false)

  const scheduleData = {
    "Mechanical Engineering": {
      A: [
        // Monday
        {
          id: "ME-A1",
          subject: "Ideology and Constitution of Pakistan (HU-127)",
          time: "09:00 - 09:50",
          location: "CR# 207",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "ME-A2",
          subject: "Ideology and Constitution of Pakistan (HU-127)",
          time: "10:00 - 10:50",
          location: "CR# 207",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "ME-A3",
          subject: "Complex Variables and Transforms (MATH-232)",
          time: "11:00 - 11:50",
          location: "CR# 207",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "ME-A4",
          subject: "Complex Variables and Transforms (MATH-232)",
          time: "12:00 - 12:50",
          location: "CR# 207",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "ME-A5",
          subject: "Civics & Community Engagement (CCE-401)",
          time: "15:00 - 16:50",
          location: "SMME Seminar Hall",
          type: "lecture",
          day: "Monday",
        },
        // Tuesday
        {
          id: "ME-A6",
          subject: "Electrical Engineering (EE-117)",
          time: "09:00 - 09:50",
          location: "CR# 315",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "ME-A7",
          subject: "Electrical Engineering (EE-117)",
          time: "10:00 - 10:50",
          location: "CR# 315",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "ME-A8",
          subject: "Complex Variables and Transforms (MATH-232)",
          time: "11:00 - 11:50",
          location: "CR# 315",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "ME-A9",
          subject: "Fluid Mechanics-I (ME-230)",
          time: "12:00 - 12:50",
          location: "CR# 315",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "ME-A10",
          subject: "SAS Session / Faculty Meeting",
          time: "14:00 - 15:50",
          location: "-",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "ME-A11",
          subject: "Library / Make-up Class",
          time: "16:00 - 16:50",
          location: "Library",
          type: "lecture",
          day: "Tuesday",
        },
        // Wednesday
        {
          id: "ME-A12",
          subject: "Library / Make-up Class",
          time: "09:00 - 09:50",
          location: "Library/Makeup",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "ME-A13",
          subject: "Civics & Community Engagement (CCE-401)",
          time: "10:00 - 10:50",
          location: "CR# 206",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "ME-A14",
          subject: "Thermodynamics-II (ME-217)",
          time: "11:00 - 11:50",
          location: "CR# 207 (West Wing)",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "ME-A15",
          subject: "Thermodynamics-II (ME-217)",
          time: "12:00 - 12:50",
          location: "CR# 207 (West Wing)",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "ME-A16",
          subject: "Mechanics of Materials-I (ME-210)",
          time: "14:00 - 14:50",
          location: "CR# 308",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "ME-A17",
          subject: "Library / Make-up Class",
          time: "15:00 - 15:50",
          location: "Library",
          type: "lecture",
          day: "Wednesday",
        },
        // Thursday
        {
          id: "ME-A18",
          subject: "Thermodynamics Lab (ME-232)",
          time: "09:00 - 11:50",
          location: "Room No 202",
          type: "lab",
          day: "Thursday",
        },
        {
          id: "ME-A19",
          subject: "Fluid Mechanics-I (ME-230)",
          time: "14:00 - 14:50",
          location: "CR# 414",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "ME-A20",
          subject: "Fluid Mechanics-I (ME-230)",
          time: "15:00 - 15:50",
          location: "CR# 414",
          type: "lecture",
          day: "Thursday",
        },
        // Friday
        {
          id: "ME-A21",
          subject: "Mechanics of Materials-I (ME-210)",
          time: "10:00 - 10:50",
          location: "CR# 408",
          type: "lecture",
          day: "Friday",
        },
        {
          id: "ME-A22",
          subject: "Mechanics of Materials-I (ME-210)",
          time: "11:00 - 11:50",
          location: "CR# 408",
          type: "lecture",
          day: "Friday",
        },
        {
          id: "ME-A23",
          subject: "Library / Make-up Class",
          time: "12:00 - 12:50",
          location: "Library",
          type: "lecture",
          day: "Friday",
        },
      ],
      B: [
        // Monday
        {
          id: "ME-B1",
          subject: "Ideology and Constitution of Pakistan (HU-127)",
          time: "11:00 - 11:50",
          location: "CR# 308",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "ME-B2",
          subject: "Ideology and Constitution of Pakistan (HU-127)",
          time: "12:00 - 12:50",
          location: "CR# 308",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "ME-B3",
          subject: "Civics & Community Engagement (CCE-401)",
          time: "14:00 - 16:50",
          location: "CR# 308",
          type: "lecture",
          day: "Monday",
        },

        //Tuesday
        {
          id: "ME-B16",
          subject: "Civics and Community Engagement (CCE-401)",
          time: "10:00 - 10:50",
          location: "CR# 308",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "ME-B4",
          subject: "Fluid Mechanics-I (ME-230)",
          time: "11:00 - 11:50",
          location: "CR# 308",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "ME-B14",
          subject: "SAS Session / Faculty Meeting",
          time: "14:00 - 15:50",
          location: "-",
          type: "lecture",
          day: "Tuesday",
        },
        // Wednesday
        {
          id: "ME-B13",
          subject: "Complex Variable and Transforms (MATH-232)",
          time: "09:00 - 10:50",
          location: "Room No 202",
          type: "lab",
          day: "Wednesday",
        },
        {
          id: "ME-B15",
          subject: "Mechanics of Materials-I (ME-210)",
          time: "11:00 - 12:50",
          location: "Room no 315",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "ME-B20",
          subject: "Electrical Engineering (EE-117)",
          time: "14:00 - 15:50",
          location: "Room no 315",
          type: "lecture",
          day: "Wednesday",
        },

        // Thursday
        {
          id: "ME-B5",
          subject: "Electrical Engineering (EE-117)",
          time: "09:00 - 09:50",
          location: "CR# 308",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "ME-B6",
          subject: "Electrical Engineering (EE-117)",
          time: "10:00 - 10:50",
          location: "CR# 308",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "ME-B7",
          subject: "Thermodynamics-II (ME-217)",
          time: "11:00 - 11:50",
          location: "CR# 308",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "ME-B8",
          subject: "Thermodynamics-II (ME-217)",
          time: "12:00 - 12:50",
          location: "CR# 308",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "ME-B9",
          subject: "Mechanics of Materials-I (ME-210)",
          time: "14:00 - 14:50",
          location: "CR# 308",
          type: "lecture",
          day: "Thursday",
        },

        //Friday
        {
          id: "ME-B10",
          subject: "Tutorial - Electrical Engineering (EE-117)",
          time: "09:00 - 09:50",
          location: "CR# 307",
          type: "tutorial",
          day: "Friday",
        },
        {
          id: "ME-B11",
          subject: "Complex Variables and Transforms (MATH-232)",
          time: "10:00 - 10:50",
          location: "CR# 308",
          type: "lecture",
          day: "Friday",
        },
        {
          id: "ME-B12",
          subject: "Mechanics of Materials-I (ME-210)",
          time: "12:00 - 12:50",
          location: "CR# 308",
          type: "lecture",
          day: "Friday",
        },
      ],
      C: [
        // Monday
        {
          id: "ME-C1",
          subject: "Fluid Mechanics-I (ME-230)",
          time: "11:00 - 11:50",
          location: "CR# 315",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "ME-C2",
          subject: "Fluid Mechanics-I (ME-230)",
          time: "12:00 - 12:50",
          location: "CR# 315",
          type: "lecture",
          day: "Monday",
        },
        // Tuesday
        {
          id: "ME-C3",
          subject: "Complex Variables and Transforms (MATH-232)",
          time: "09:00 - 09:50",
          location: "CR# 315",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "ME-C4",
          subject: "Mechanics of Materials-I (ME-210)",
          time: "10:00 - 10:50",
          location: "CR# 315",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "ME-C13",
          subject: "SAS Session / Faculty Meeting",
          time: "14:00 - 14:50",
          location: "-",
          type: "lecture",
          day: "Tuesday",
        },
        // Wednesday
        {
          id: "ME-C5",
          subject: "Electrical Engineering (EE-117)",
          time: "11:00 - 11:50",
          location: "CR# 315",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "ME-C6",
          subject: "Electrical Engineering (EE-117)",
          time: "12:00 - 12:50",
          location: "CR# 315",
          type: "lecture",
          day: "Wednesday",
        },
        // Thursday
        {
          id: "ME-C7",
          subject: "Tutorial - Electrical Engineering (EE-117)",
          time: "09:00 - 09:50",
          location: "CR# 414",
          type: "tutorial",
          day: "Thursday",
        },
        {
          id: "ME-C8",
          subject: "Ideology and Constitution of Pakistan (HU-127)",
          time: "10:00 - 10:50",
          location: "CR# 315",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "ME-C9",
          subject: "Civics & Community Engagement (CCE-401)",
          time: "11:00 - 11:50",
          location: "CR# 315",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "ME-C10",
          subject: "Thermodynamics-II (ME-217)",
          time: "14:00 - 14:50",
          location: "CR# 315",
          type: "lecture",
          day: "Thursday",
        },
        // Friday
        {
          id: "ME-C11",
          subject: "Thermodynamics Lab (ME-232)",
          time: "09:00 - 11:50",
          location: "Room No 202",
          type: "lab",
          day: "Friday",
        },
        {
          id: "ME-C12",
          subject: "Library / Make-up Class",
          time: "Various",
          location: "Library",
          type: "lecture",
          day: "Throughout Week",
        },
      ],
    },
    "Electrical Engineering": {
      A: [
        // Monday
        {
          id: "1",
          subject: "Electrical Machines",
          time: "11:00 - 11:50",
          location: "CR-12 (UG Block)",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "2",
          subject: "Instrumentation and Measurements",
          time: "14:00 - 16:50",
          location: "Control System Lab (UG Block)",
          type: "lab",
          day: "Monday",
        },
        // Tuesday
        {
          id: "3",
          subject: "Electrical Machines",
          time: "11:00 - 11:50",
          location: "CR-04 (UG Block)",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "4",
          subject: "Probability and Statistics",
          time: "14:00 - 14:50",
          location: "CR-12",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "5",
          subject: "Instrumentation and Measurements",
          time: "15:00 - 15:50",
          location: "CR-12",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "6",
          subject: "Instrumentation and Measurements",
          time: "16:00 - 16:50",
          location: "CR-12",
          type: "lecture",
          day: "Tuesday",
        },
        // Wednesday
        {
          id: "7",
          subject: "Electronic Circuit Design",
          time: "10:00 - 10:50",
          location: "CR-12",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "8",
          subject: "Electronic Circuit Design",
          time: "11:00 - 11:50",
          location: "CR-12",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "9",
          subject: "Signals and Systems",
          time: "12:00 - 12:50",
          location: "CR-12",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "10",
          subject: "Electrical Machines",
          time: "14:00 - 16:50",
          location: "EMS Lab (UG Block)",
          type: "lab",
          day: "Wednesday",
        },
        // Thursday
        {
          id: "11",
          subject: "Electrical Machines",
          time: "09:00 - 09:50",
          location: "CR-13 (UG Block)",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "12",
          subject: "Signals and Systems",
          time: "10:00 - 12:50",
          location: "DSP & Comm Lab (UG Block)",
          type: "lab",
          day: "Thursday",
        },
        {
          id: "13",
          subject: "Electronic Circuit Design",
          time: "14:00 - 14:50",
          location: "CR-12",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "14",
          subject: "Probability and Statistics",
          time: "15:00 - 15:50",
          location: "CR-12",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "15",
          subject: "Instrumentation and Measurements",
          time: "16:00 - 16:50",
          location: "CR-12",
          type: "lecture",
          day: "Thursday",
        },
        // Friday
        {
          id: "16",
          subject: "Signals and Systems",
          time: "09:00 - 09:50",
          location: "CR-12",
          type: "lecture",
          day: "Friday",
        },
        {
          id: "17",
          subject: "Signals and Systems",
          time: "10:00 - 10:50",
          location: "CR-12",
          type: "lecture",
          day: "Friday",
        },
        {
          id: "18",
          subject: "Probability and Statistics",
          time: "11:00 - 11:50",
          location: "CR-12",
          type: "lecture",
          day: "Friday",
        },
        {
          id: "19",
          subject: "Electronic Circuit Design",
          time: "14:30 - 15:15",
          location: "Advanced Electronics Lab (AEC)",
          type: "lab",
          day: "Friday",
        },
        {
          id: "20",
          subject: "Electronic Circuit Design",
          time: "15:20 - 16:05",
          location: "Advanced Electronics Lab (AEC)",
          type: "lab",
          day: "Friday",
        },
        {
          id: "21",
          subject: "Electronic Circuit Design",
          time: "16:10 - 16:55",
          location: "Advanced Electronics Lab (AEC)",
          type: "lab",
          day: "Friday",
        },
      ],
      B: [
        // Monday
        {
          id: "b1",
          subject: "Electrical Machines",
          time: "09:00 - 09:50",
          location: "CR-13 (UG Block)",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "b2",
          subject: "Instrumentation and Measurements",
          time: "10:00 - 12:50",
          location: "Control System Lab (UG Block)",
          type: "lab",
          day: "Monday",
        },
        {
          id: "b3",
          subject: "Signals and Systems",
          time: "14:00 - 15:50",
          location: "CR 12",
          type: "lecture",
          day: "Monday",
        },
        // Tuesday
        {
          id: "b4",
          subject: "Instrumentation and Measurements",
          time: "09:00 - 09:50",
          location: "CR 12",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "b5",
          subject: "Instrumentation and Measurements",
          time: "10:00 - 10:50",
          location: "CR 12",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "b6",
          subject: "Probability and Statistics",
          time: "11:00 - 11:50",
          location: "CR 12",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "b7",
          subject: "Electrical Machines",
          time: "12:00 - 12:50",
          location: "CR 12",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "b8",
          subject: "Signals and Systems",
          time: "14:00 - 14:50",
          location: "CR-10 (UG Block)",
          type: "lecture",
          day: "Tuesday",
        },
        // Wednesday
        {
          id: "b9",
          subject: "Makeup Slot/Library Period",
          time: "09:00 - 09:50",
          location: "TBD",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "b10",
          subject: "Electrical Machines",
          time: "10:00 - 12:50",
          location: "EMS Lab (UG Block)",
          type: "lab",
          day: "Wednesday",
        },
        {
          id: "b11",
          subject: "Makeup Slot/Library Period",
          time: "14:00 - 14:50",
          location: "TBD",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "b12",
          subject: "Electronic Circuit Design",
          time: "15:00 - 16:50",
          location: "CR 12",
          type: "lecture",
          day: "Wednesday",
        },
        // Thursday
        {
          id: "b13",
          subject: "Instrumentation and Measurements",
          time: "09:00 - 09:50",
          location: "CR 12",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "b14",
          subject: "Probability and Statistics",
          time: "10:00 - 10:50",
          location: "CR 12",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "b15",
          subject: "Electrical Machines",
          time: "11:00 - 11:50",
          location: "CR 12",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "b16",
          subject: "Electronic Circuit Design",
          time: "12:00 - 12:50",
          location: "CR 12",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "b17",
          subject: "Signals and Systems",
          time: "14:00 - 16:50",
          location: "DSP & Comm Lab (UG Block)",
          type: "lab",
          day: "Thursday",
        },
        // Friday
        {
          id: "b18",
          subject: "Electronic Circuit Design",
          time: "09:00 - 11:50",
          location: "Advanced Electronics Lab (IAEC)",
          type: "lab",
          day: "Friday",
        },
        {
          id: "b19",
          subject: "Probability and Statistics",
          time: "12:00 - 12:50",
          location: "CR 12",
          type: "lecture",
          day: "Friday",
        },
      ],
      C: [
        // Monday
        {
          id: "c1",
          subject: "Probability and Statistics",
          time: "09:00 - 09:50",
          location: "CR-12 (UG Block)",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "c2",
          subject: "Probability and Statistics",
          time: "10:00 - 11:50",
          location: "CR-12 (UG Block)",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "c3",
          subject: "Makeup Slot",
          time: "11:00 - 11:50",
          location: "CR 12",
          type: "lecture",
          day: "Monday",
        },

        {
          id: "c4",
          subject: "Electrical Machines",
          time: "12:00 - 12:50",
          location: "CR 13",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "c5",
          subject: "Signals and Systems",
          time: "2:00 - 4:50",
          location: "DSP & Comm Lab - UG Block",
          type: "Lab",
          day: "Monday",
        },
        //Tuesday
        {
          id: "c6",
          subject: "ELectrical Machines",
          time: "09:00 - 09:50",
          location: "CR 01",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "c7",
          subject: "Instrumentations and Measurements",
          time: "10:00 - 12:50",
          location: "CR 12",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "c8",
          subject: "Signals and Systems",
          time: "14:00 - 14:50",
          location: "CR-13 (UG Block)",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "c9",
          subject: "Signals and Systems",
          time: "15:00 - 15:50",
          location: "CR-13",
          type: "lecture",
          day: "Tuesday",
        },

        //Wednesday
        {
          id: "c10",
          subject: "Signals and Systems",
          time: "10:00 - 10:50",
          location: "CR-13",
          type: "Lecture",
          day: "Wednesday",
        },
        {
          id: "c11",
          subject: "Instrumentations and Measurements",
          time: "11:00 - 11:50",
          location: "CR-13",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "c12",
          subject: "Probability and Statistics",
          time: "12:00 - 12:50",
          location: "CR-13",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "c13",
          subject: "Electronic Circuit Design",
          time: "14:00 - 16:50",
          location: "Advanced Electronics Lab (IAEC)",
          type: "lab",
          day: "Wednesday",
        },

        //Thursday
        {
          id: "c14",
          subject: "Electrical Machines",
          time: "10:00 - 10:50",
          location: "CR 13",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "c15",
          subject: "Electronic Circuit Design",
          time: "11:00 - 11:50",
          location: "CR 13",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "c16",
          subject: "Makeup Slot",
          time: "12:00 - 12:50",
          location: "CR 13",
          type: "NA",
          day: "Thursday",
        },
        {
          id: "c17",
          subject: "Electrical Machines",
          time: "14:00 - 16:50",
          location: "EMS Lab-UG Block",
          type: "lab",
          day: "Thursday",
        },
        // Friday
        {
          id: "c18",
          subject: "Instrumentaions and Measurements",
          time: "09:00 - 10:50",
          location: "CR-13",
          type: "lecture",
          day: "Friday",
        },
        {
          id: "c19",
          subject: "Electronic Circuits Design",
          time: "11:00 - 12:50",
          location: "CR 13",
          type: "lecture",
          day: "Friday",
        },
      ],
      D: [
        // Monday
        {
          id: "d1",
          subject: "Signals and Systems (Lab)",
          time: "09:00 - 11:50",
          location: "DSP & Comm Lab-UG Block",
          type: "lab",
          day: "Monday",
        },
        {
          id: "d2",
          subject: "Electrical Machines",
          time: "12:00 - 12:50",
          location: "CR-12-UG Block",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "d3",
          subject: "Electronic Circuit Design",
          time: "14:00 - 15:50",
          location: "CR-13",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "d4",
          subject: "Makeup Slot / Library Period",
          time: "16:00 - 16:50",
          location: "CR-13",
          type: "NA",
          day: "Monday",
        },

        // Tuesday
        {
          id: "d5",
          subject: "Probability and Statistics",
          time: "09:00 - 11:50",
          location: "CR-13",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "d6",
          subject: "Electronic Circuit Design",
          time: "12:00 - 12:50",
          location: "CR-13",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "d7",
          subject: "Instrumentation and Measurements (Lab)",
          time: "14:00 - 16:50",
          location: "Control System Lab-UG Block",
          type: "lab",
          day: "Tuesday",
        },

        // Wednesday
        {
          id: "d8",
          subject: "Probability and Statistics",
          time: "09:00 - 09:50",
          location: "CR-13",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "d9",
          subject: "Electronic Circuit Design (Lab)",
          time: "10:00 - 12:50",
          location: "Advanced Electronics Lab-IAEC",
          type: "lab",
          day: "Wednesday",
        },
        {
          id: "d10",
          subject: "Instrumentation and Measurements",
          time: "14:00 - 15:50",
          location: "CR-08-UG Block",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "d11",
          subject: "Makeup Slot / Library Period",
          time: "16:00 - 16:50",
          location: "CR-13",
          type: "NA",
          day: "Wednesday",
        },

        // Thursday
        {
          id: "d12",
          subject: "Electrical Machines (Lab)",
          time: "10:00 - 12:50",
          location: "EMS Lab-UG Block",
          type: "lab",
          day: "Thursday",
        },
        {
          id: "d13",
          subject: "Electrical Machines",
          time: "14:00 - 15:50",
          location: "CR-13",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "d14",
          subject: "Makeup Slot / Library Period",
          time: "16:00 - 16:50",
          location: "CR-13",
          type: "NA",
          day: "Thursday",
        },

        // Friday
        {
          id: "d15",
          subject: "Makeup Slot / Library Period",
          time: "09:00 - 12:50",
          location: "CR-13",
          type: "NA",
          day: "Friday",
        },
        {
          id: "d16",
          subject: "Signals and Systems",
          time: "14:00 - 15:50",
          location: "CR-13",
          type: "lecture",
          day: "Friday",
        },
        {
          id: "d17",
          subject: "Makeup Slot / Library Period",
          time: "16:00 - 16:50",
          location: "CR-13",
          type: "NA",
          day: "Friday",
        },
      ],
    },
    "Computer Science": {
      A: [],
      B: [
        // Monday
        {
          id: "cs-b1",
          subject: "Makeup Slot / Library Period",
          time: "09:00 - 09:50",
          location: "TBD",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "cs-b2",
          subject: "Data Visualization",
          time: "10:00 - 12:50",
          location: "Computing Lab-05 UG Block",
          type: "lab",
          day: "Monday",
        },
        {
          id: "cs-b3",
          subject: "Introduction to Management",
          time: "14:00 - 15:50",
          location: "TBD",
          type: "lecture",
          day: "Monday",
        },
        {
          id: "cs-b4",
          subject: "Makeup Slot / Library Period",
          time: "16:00 - 16:50",
          location: "TBD",
          type: "lecture",
          day: "Monday",
        },
        // Tuesday
        {
          id: "cs-b5",
          subject: "Operating Systems",
          time: "09:00 - 10:50",
          location: "TBD",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "cs-b6",
          subject: "Data Visualization",
          time: "11:00 - 12:50",
          location: "TBD",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "cs-b7",
          subject: "HCI & Computer Graphics",
          time: "14:00 - 16:50",
          location: "Computing Lab-05 UG Block",
          type: "lab",
          day: "Tuesday",
        },
        // Wednesday
        {
          id: "cs-b8",
          subject: "Makeup Slot / Library Period",
          time: "09:00 - 09:50",
          location: "TBD",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "cs-b9",
          subject: "Computer Architecture",
          time: "11:00 - 12:50",
          location: "TBD",
          type: "lecture",
          day: "Wednesday",
        },
        {
          id: "cs-b10",
          subject: "Operating Systems",
          time: "14:00 - 16:50",
          location: "Computing Lab-05 UG Block",
          type: "lab",
          day: "Wednesday",
        },
        // Thursday
        {
          id: "cs-b11",
          subject: "Makeup Slot / Library Period",
          time: "09:00 - 09:50",
          location: "TBD",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "cs-b12",
          subject: "Machine Learning",
          time: "10:00 - 12:50",
          location: "Computing Lab-05 UG Block",
          type: "lab",
          day: "Thursday",
        },
        {
          id: "cs-b13",
          subject: "Machine Learning",
          time: "14:00 - 15:50",
          location: "TBD",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "cs-b14",
          subject: "Makeup Slot / Library Period",
          time: "16:00 - 16:50",
          location: "TBD",
          type: "lecture",
          day: "Thursday",
        },
        // Friday
        {
          id: "cs-b15",
          subject: "Makeup Slot / Library Period",
          time: "09:00 - 09:50",
          location: "TBD",
          type: "lecture",
          day: "Friday",
        },
        {
          id: "cs-b16",
          subject: "Computer Architecture",
          time: "10:00 - 12:50",
          location: "Computing Lab-05 UG Block",
          type: "lab",
          day: "Friday",
        },
        {
          id: "cs-b17",
          subject: "HCI & Computer Graphics",
          time: "14:00 - 15:50",
          location: "TBD",
          type: "lecture",
          day: "Friday",
        },
        {
          id: "cs-b18",
          subject: "Makeup Slot / Library Period",
          time: "16:00 - 16:50",
          location: "TBD",
          type: "lecture",
          day: "Friday",
        },
      ],
      C: [],
      D: [],
      E: [],
    },
  }

  const scheduleDataNoSection: Record<string, ScheduleItem[]> = {
    "Mass Communication": [
      // Monday
      {
        id: "mc-1",
        subject: "Theories of Mass Communication",
        time: "14:00 - 15:15",
        location: "CR-06",
        type: "lecture",
        day: "Monday",
      },
      {
        id: "mc-2",
        subject: "Theories of Mass Communication",
        time: "15:25 - 16:40",
        location: "CR-06",
        type: "lecture",
        day: "Monday",
      },
      // Tuesday
      {
        id: "mc-3",
        subject: "Radio Production",
        time: "10:25 - 11:40",
        location: "CR-01",
        type: "lecture",
        day: "Tuesday",
      },
      {
        id: "mc-4",
        subject: "Radio Production",
        time: "11:50 - 13:05",
        location: "CR-10",
        type: "lecture",
        day: "Tuesday",
      },
      {
        id: "mc-5",
        subject: "Introduction to Public Administration",
        time: "14:00 - 15:15",
        location: "CR-04",
        type: "lecture",
        day: "Tuesday",
      },
      {
        id: "mc-6",
        subject: "Introduction to Public Administration",
        time: "15:25 - 16:40",
        location: "CR-04",
        type: "lecture",
        day: "Tuesday",
      },
      // Wednesday
      {
        id: "mc-7",
        subject: "Introduction to Visual Storytelling",
        time: "10:25 - 11:40",
        location: "TV Studio - Lab",
        type: "lab",
        day: "Wednesday",
      },
      {
        id: "mc-8",
        subject: "Introduction to Visual Storytelling",
        time: "11:50 - 13:05",
        location: "TV Studio - Lab",
        type: "lab",
        day: "Wednesday",
      },
      // Thursday
      {
        id: "mc-9",
        subject: "English Literature",
        time: "14:00 - 15:15",
        location: "CR-09",
        type: "lecture",
        day: "Thursday",
      },
      {
        id: "mc-10",
        subject: "English Literature",
        time: "15:25 - 16:40",
        location: "CR-09",
        type: "lecture",
        day: "Thursday",
      },
      // Friday
      {
        id: "mc-11",
        subject: "Online Journalism",
        time: "10:25 - 11:40",
        location: "CR-10",
        type: "lecture",
        day: "Friday",
      },
      {
        id: "mc-12",
        subject: "Online Journalism",
        time: "11:50 - 13:05",
        location: "CR-10",
        type: "lecture",
        day: "Friday",
      },
    ],
  }

  const messMenuWeekA: Record<string, MessMenuItem[]> = {
    Monday: [
      { id: "wA-mon-b", meal: "breakfast", items: ["Omelette", "Paratha"], time: "07:30 - 09:30" },
      { id: "wA-mon-l", meal: "lunch", items: ["Aloo Baingan"], time: "12:00 - 14:30" },
      { id: "wA-mon-d", meal: "dinner", items: ["Channa Pulao", "Raita"], time: "19:00 - 21:30" },
    ],
    Tuesday: [
      { id: "wA-tue-b", meal: "breakfast", items: ["Kulcha Channa"], time: "07:30 - 09:30" },
      { id: "wA-tue-l", meal: "lunch", items: ["Daal Mash", "Salad"], time: "12:00 - 14:30" },
      { id: "wA-tue-d", meal: "dinner", items: ["Murgh Channay"], time: "19:00 - 21:30" },
    ],
    Wednesday: [
      { id: "wA-wed-b", meal: "breakfast", items: ["Half & Full Fried Egg"], time: "07:30 - 09:30" },
      { id: "wA-wed-l", meal: "lunch", items: ["Kari Pakora", "Naan"], time: "12:00 - 14:30" },
      { id: "wA-wed-d", meal: "dinner", items: ["Chicken Achari", "Zarda"], time: "19:00 - 21:30" },
    ],
    Thursday: [
      { id: "wA-thu-b", meal: "breakfast", items: ["Egg Tomato Onion"], time: "07:30 - 09:30" },
      { id: "wA-thu-l", meal: "lunch", items: ["Daal Kaddu"], time: "12:00 - 14:30" },
      { id: "wA-thu-d", meal: "dinner", items: ["Biryani", "Cold Drinks"], time: "19:00 - 21:30" },
    ],
    Friday: [
      { id: "wA-fri-b", meal: "breakfast", items: ["French Toast"], time: "07:30 - 09:30" },
      { id: "wA-fri-l", meal: "lunch", items: ["Daal Chawal (Black)"], time: "12:00 - 14:30" },
      { id: "wA-fri-d", meal: "dinner", items: ["Aloo Beef Keema", "Chapati"], time: "19:00 - 21:30" },
    ],
    Saturday: [
      { id: "wA-sat-b", meal: "breakfast", items: ["Aloo Paratha"], time: "07:30 - 09:30" },
      { id: "wA-sat-l", meal: "lunch", items: ["Lobia"], time: "12:00 - 14:30" },
      { id: "wA-sat-d", meal: "dinner", items: ["Chicken Pulao", "Raita"], time: "19:00 - 21:30" },
    ],
    Sunday: [
      { id: "wA-sun-b", meal: "breakfast", items: ["Halwa Puri", "Channa"], time: "07:30 - 09:30" },
      { id: "wA-sun-l", meal: "lunch", items: ["Bhindi", "Salad"], time: "12:00 - 14:30" },
      { id: "wA-sun-d", meal: "dinner", items: ["Chicken Chowmein"], time: "19:00 - 21:30" },
    ],
  }

  const messMenuWeekB: Record<string, MessMenuItem[]> = {
    Monday: [
      {
        id: "mon-1",
        meal: "breakfast",
        items: ["Omelette", "Paratha"],
        time: "07:30 - 09:30",
      },
      {
        id: "mon-2",
        meal: "lunch",
        items: ["Aloo Palak"],
        time: "12:00 - 14:30",
      },
      {
        id: "mon-3",
        meal: "dinner",
        items: ["Beef Kabuli Pulao"],
        time: "19:30 - 21:30",
      },
    ],
    Tuesday: [
      {
        id: "tue-1",
        meal: "breakfast",
        items: ["Kulcha Channa"],
        time: "07:30 - 09:30",
      },
      {
        id: "tue-2",
        meal: "lunch",
        items: ["Daal Mash", "Salad"],
        time: "12:00 - 14:30",
      },
      {
        id: "tue-3",
        meal: "dinner",
        items: ["Chicken Daleem"],
        time: "19:30 - 21:30",
      },
    ],
    Wednesday: [
      {
        id: "wed-1",
        meal: "breakfast",
        items: ["Half & Full Fried Egg", "Paratha"],
        time: "07:30 - 09:30",
      },
      {
        id: "wed-2",
        meal: "lunch",
        items: ["Kari Pakora", "Rice"],
        time: "12:00 - 14:30",
      },
      {
        id: "wed-3",
        meal: "dinner",
        items: ["Chicken Achari", "Kheer"],
        time: "19:30 - 21:30",
      },
    ],
    Thursday: [
      {
        id: "thu-1",
        meal: "breakfast",
        items: ["Scrambled Egg"],
        time: "07:30 - 09:30",
      },
      {
        id: "thu-2",
        meal: "lunch",
        items: ["Daal Kaddu"],
        time: "12:00 - 14:30",
      },
      {
        id: "thu-3",
        meal: "dinner",
        items: ["Biryani", "Cold Drinks"],
        time: "19:30 - 21:30",
      },
    ],
    Friday: [
      {
        id: "fri-1",
        meal: "breakfast",
        items: ["Bread", "Butter & Jam"],
        time: "07:30 - 09:30",
      },
      {
        id: "fri-2",
        meal: "lunch",
        items: ["Daal Chawal (Yellow)"],
        time: "12:00 - 14:30",
      },
      {
        id: "fri-3",
        meal: "dinner",
        items: ["Aloo Beef Keema", "Chapati"],
        time: "19:30 - 21:30",
      },
    ],
    Saturday: [
      {
        id: "sat-1",
        meal: "breakfast",
        items: ["Aloo Paratha"],
        time: "07:30 - 09:30",
      },
      {
        id: "sat-2",
        meal: "lunch",
        items: ["Black Channa"],
        time: "12:00 - 14:30",
      },
      {
        id: "sat-3",
        meal: "dinner",
        items: ["Chicken Pulao", "Raita"],
        time: "19:30 - 21:30",
      },
    ],
    Sunday: [
      {
        id: "sun-1",
        meal: "breakfast",
        items: ["Halwa Puri", "Channa"],
        time: "07:30 - 09:30",
      },
      {
        id: "sun-2",
        meal: "lunch",
        items: ["Beef Curry", "Rice", "Salad"],
        time: "13:30 - 15:00",
      },
      {
        id: "sun-3",
        meal: "dinner",
        items: ["Aloo Cutlets", "Mix Daal", "Chatni"],
        time: "19:30 - 21:30",
      },
    ],
  }

  const messMenu: Record<string, MessMenuItem[]> =
    messAnchorWeek !== null
      ? (getISOWeek(new Date()) - messAnchorWeek) % 2 === 0
        ? messMenuWeekA
        : messMenuWeekB
      : messMenuWeekA

  useEffect(() => {
    const savedProfile = localStorage.getItem("uniapp-profile")
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
      setIsOnboarded(true)
    }
  }, [])

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("uniapp-profile", JSON.stringify(userProfile))
    setIsOnboarded(true)
  }

  const handleReset = () => {
    localStorage.removeItem("uniapp-profile")
    setIsOnboarded(false)
    setUserProfile({
      batchNumber: "",
      school: "",
      major: "",
      semester: "",
      hostelResident: false,
      section: "",
    })
  }

  const getTypeColor = (type: ScheduleItem["type"]) => {
    switch (type) {
      case "lecture":
        return "bg-primary text-primary-foreground"
      case "lab":
        return "bg-secondary text-secondary-foreground"
      case "tutorial":
        return "bg-accent text-accent-foreground"
      case "NA":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case "breakfast":
        return "🌅"
      case "lunch":
        return "☀️"
      case "dinner":
        return "🌙"
      default:
        return "🍽️"
    }
  }

  const getScheduleForDay = (day: string) => {
    if (
      (userProfile.major === "Electrical Engineering" ||
        userProfile.major === "Computer Science" ||
        userProfile.major === "Mechanical Engineering") &&
      userProfile.section
    ) {
      const majorSchedule = scheduleData[userProfile.major as keyof typeof scheduleData]
      if (majorSchedule) {
        const sectionSchedule = majorSchedule[userProfile.section as keyof typeof majorSchedule]
        return sectionSchedule?.filter((item) => item.day === day) || []
      }
    }

    const simpleMajorSchedule = scheduleDataNoSection[userProfile.major as keyof typeof scheduleDataNoSection]
    if (simpleMajorSchedule) {
      return simpleMajorSchedule.filter((item) => item.day === day)
    }

    return []
  }

  const filteredExams = useMemo(() => {
    const uniqueExams = new Map<string, ExamItem>()

    examData.forEach((exam) => {
      const matchMajor = examMajor === "all-majors" || !examMajor || exam.major === examMajor
      if (matchMajor) {
        const key = `${exam.date}-${exam.time}-${exam.subject}-${exam.venue}`
        if (!uniqueExams.has(key)) {
          uniqueExams.set(key, exam)
        }
      }
    })

    return Array.from(uniqueExams.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [examData, examMajor])

  useEffect(() => {
    const currentIsoWeek = getISOWeek(new Date())
    const saved = localStorage.getItem("mess-menu-anchor-week")
    if (!saved) {
      localStorage.setItem("mess-menu-anchor-week", String(currentIsoWeek))
      setMessAnchorWeek(currentIsoWeek)
    } else {
      const parsed = Number.parseInt(saved, 10)
      setMessAnchorWeek(Number.isNaN(parsed) ? currentIsoWeek : parsed)
    }
  }, [])

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoadingExams(true)
        const response = await fetch(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Datesheet%20-%20MSE%20Fall%202025-STjKEwKcR4WtJ7dE15cif3qXim9vxk.csv",
        )
        const csvText = await response.text()
        const lines = csvText.split("\n").filter((line) => line.trim())

        const majors = new Set<string>()
        const exams: ExamItem[] = []

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(",").map((p) => p.trim())
          if (parts.length >= 2) {
            const major = parts[0]
            if (major) {
              majors.add(major)
              exams.push({
                major,
                batch: parts[1] || "",
                date: parts[2] || "",
                time: parts[3] || "",
                subject: parts[4] || "",
                venue: parts[5] || "",
              })
            }
          }
        }

        setExamMajors(Array.from(majors).sort())
        setExamData(exams)
      } catch (error) {
        console.error("Error fetching exam data:", error)
      } finally {
        setLoadingExams(false)
      }
    }

    fetchExamData()
  }, [])

  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-heading">Welcome to UniApp</CardTitle>
            <p className="text-muted-foreground">Let's set up your profile to get started</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batch">Batch Number</Label>
                <Select onValueChange={(value) => setUserProfile((prev) => ({ ...prev, batchNumber: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BATCH_OPTIONS.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School/Department</Label>
                <Select onValueChange={(value) => setUserProfile((prev) => ({ ...prev, school: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your school" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_OPTIONS.map((school) => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                {userProfile.school === "SEECS" ? (
                  <Select onValueChange={(value) => setUserProfile((prev) => ({ ...prev, major: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                ) : userProfile.school === "SMME" ? (
                  <Select onValueChange={(value) => setUserProfile((prev) => ({ ...prev, major: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                ) : userProfile.school === "S3H" ? (
                  <Select onValueChange={(value) => setUserProfile((prev) => ({ ...prev, major: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mass Communication">Mass Communication</SelectItem>
                      <SelectItem value="Economics">Economics</SelectItem>
                      <SelectItem value="Public Ad">Public Ad</SelectItem>
                      <SelectItem value="Psychology">Psychology</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="major"
                    placeholder="e.g., Computer Science"
                    value={userProfile.major}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, major: e.target.value }))}
                    required
                  />
                )}
              </div>

              {(userProfile.major === "Electrical Engineering" ||
                userProfile.major === "Computer Science" ||
                userProfile.major === "Mechanical Engineering") && (
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select onValueChange={(value) => setUserProfile((prev) => ({ ...prev, section: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      {userProfile.major === "Electrical Engineering" && <SelectItem value="D">D</SelectItem>}
                      {userProfile.major === "Computer Science" && <SelectItem value="E">E</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="semester">Current Semester</Label>
                <Select onValueChange={(value) => setUserProfile((prev) => ({ ...prev, semester: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTER_OPTIONS.map((sem) => (
                      <SelectItem key={sem} value={sem}>
                        {sem}
                        {sem === "1" ? "st" : sem === "2" ? "nd" : sem === "3" ? "rd" : "th"} Semester
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Accommodation</Label>
                <Select
                  onValueChange={(value) => setUserProfile((prev) => ({ ...prev, hostelResident: value === "hostel" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accommodation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hostel">Hostel Resident</SelectItem>
                    <SelectItem value="day-scholar">Day Scholar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Get Started
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg">UniApp</h1>
              <p className="text-sm text-muted-foreground">
                {userProfile.major} • Semester {userProfile.semester}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userProfile.hostelResident && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="w-3 h-3" />
                Hostel
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pb-8">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="mess" className="gap-2">
              <Utensils className="w-4 h-4" />
              Mess Menu
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-2">
              <BookOpen className="w-4 h-4" />
              MSE 2025
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold">Class Schedule</h2>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {getScheduleForDay(selectedDay).length > 0 ? (
                getScheduleForDay(selectedDay).map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-balance">{item.subject}</h3>
                          <Badge className={getTypeColor(item.type)} variant="secondary">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {item.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {item.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No classes scheduled for {selectedDay}</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mess" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold">Mess Menu</h2>
              <Select value={selectedMessDay} onValueChange={setSelectedMessDay}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {messMenu[selectedMessDay]?.map((meal) => (
                <Card key={meal.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg capitalize">
                      <span className="text-xl">{getMealIcon(meal.meal)}</span>
                      {meal.meal}
                      <Badge variant="outline" className="ml-auto">
                        {meal.time}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {meal.items.map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No menu available for {selectedMessDay}</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            <h2 className="text-xl font-heading font-semibold">Mid Semester Exams 2025 (SEECS)</h2>

            <div className="space-y-2">
              <Label htmlFor="exam-major">Major</Label>
              <Select value={examMajor} onValueChange={setExamMajor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select major" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-majors">All Majors</SelectItem>
                  {examMajors.map((major) => (
                    <SelectItem key={major} value={major}>
                      {major}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {loadingExams ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading exam schedule...</p>
                </Card>
              ) : filteredExams.length > 0 ? (
                filteredExams.map((exam, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-balance mb-2">{exam.subject}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {exam.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {exam.time}
                          </div>
                          {exam.venue && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {exam.venue}
                            </div>
                          )}
                          <div className="text-xs">
                            <Badge variant="outline">{exam.major}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No exams found for selected filters</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
