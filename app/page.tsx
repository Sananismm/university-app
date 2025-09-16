"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Utensils, GraduationCap, Home } from "lucide-react"

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
  type: "lecture" | "lab"
  day: string
}

interface MessMenuItem {
  id: string
  meal: "breakfast" | "lunch" | "dinner"
  items: string[]
  time: string
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

  const [selectedDay, setSelectedDay] = useState("Monday")
  const [selectedMessDay, setSelectedMessDay] = useState(new Date().toLocaleDateString("en-US", { weekday: "long" }))

  const scheduleData = {
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
          time: "13:00 - 13:50",
          location: "CR-12",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "5",
          subject: "Instrumentation and Measurements",
          time: "14:00 - 14:50",
          location: "CR-12",
          type: "lecture",
          day: "Tuesday",
        },
        {
          id: "6",
          subject: "Instrumentation and Measurements",
          time: "15:00 - 16:50",
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
          time: "13:00 - 13:50",
          location: "CR-12",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "14",
          subject: "Probability and Statistics",
          time: "14:00 - 14:50",
          location: "CR-12",
          type: "lecture",
          day: "Thursday",
        },
        {
          id: "15",
          subject: "Instrumentation and Measurements",
          time: "15:00 - 16:50",
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
    },
  }

  const [schedule] = useState<ScheduleItem[]>([])

  const [messMenu] = useState<Record<string, MessMenuItem[]>>({
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
        time: "19:00 - 21:30",
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
        time: "19:00 - 21:30",
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
        time: "19:00 - 21:30",
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
        time: "19:00 - 21:30",
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
        time: "19:00 - 21:30",
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
        time: "19:00 - 21:30",
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
        time: "12:00 - 14:30",
      },
      {
        id: "sun-3",
        meal: "dinner",
        items: ["Aloo Cutlets", "Mix Daal", "Chatni"],
        time: "19:00 - 21:30",
      },
    ],
  })

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lecture":
        return "bg-primary text-primary-foreground"
      case "lab":
        return "bg-secondary text-secondary-foreground"
      case "tutorial":
        return "bg-accent text-accent-foreground"
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
    if (userProfile.major === "Electrical Engineering" && userProfile.section) {
      const sectionSchedule =
        scheduleData["Electrical Engineering"][
          userProfile.section as keyof (typeof scheduleData)["Electrical Engineering"]
        ]
      return sectionSchedule?.filter((item) => item.day === day) || []
    }
    return schedule.filter((item) => item.day === day)
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

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
                <Input
                  id="batch"
                  placeholder="e.g., 2024"
                  value={userProfile.batchNumber}
                  onChange={(e) => setUserProfile((prev) => ({ ...prev, batchNumber: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School/Department</Label>
                <Select onValueChange={(value) => setUserProfile((prev) => ({ ...prev, school: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your school" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEECS">SEECS</SelectItem>
                    <SelectItem value="SMME">SMME</SelectItem>
                    <SelectItem value="S3H">S3H</SelectItem>
                    <SelectItem value="NBS">NBS</SelectItem>
                    <SelectItem value="NSHS">NSHS</SelectItem>
                    <SelectItem value="IGIS">IGIS</SelectItem>
                    <SelectItem value="ASAB">ASAB</SelectItem>
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

              {userProfile.major === "Electrical Engineering" && (
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
                      <SelectItem value="D">D</SelectItem>
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
                    <SelectItem value="1">1st Semester</SelectItem>
                    <SelectItem value="2">2nd Semester</SelectItem>
                    <SelectItem value="3">3rd Semester</SelectItem>
                    <SelectItem value="4">4th Semester</SelectItem>
                    <SelectItem value="5">5th Semester</SelectItem>
                    <SelectItem value="6">6th Semester</SelectItem>
                    <SelectItem value="7">7th Semester</SelectItem>
                    <SelectItem value="8">8th Semester</SelectItem>
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
                <Home className="w-3 h-3" />
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
      <main className="p-4">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="mess" className="gap-2">
              <Utensils className="w-4 h-4" />
              Mess Menu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold">Class Schedule</h2>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
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
        </Tabs>
      </main>
    </div>
  )
}
