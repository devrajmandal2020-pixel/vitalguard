'use client';

import { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Activity,
  Plus,
  Stethoscope,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  PlusCircle,
  TrendingDown,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePatients } from '@/components/providers/patient-provider';
import { toast } from 'sonner';
import type { Patient, Appointment, FollowUpReminder } from '@/types';

interface CarePlanCardProps {
  patient: Patient;
}

const MOCK_DOCTORS = [
  { name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', hospital: 'VitalCare Medical Center' },
  { name: 'Dr. David Chen', specialty: 'Pulmonology', hospital: 'VitalCare Medical Center' },
  { name: 'Dr. Amit Patel', specialty: 'Internal Medicine', hospital: 'City Clinic' },
  { name: 'Dr. Priya Nair', specialty: 'Endocrinology', hospital: 'Metro Health Hospital' },
];

export function CarePlanCard({ patient }: CarePlanCardProps) {
  const { updatePatient } = usePatients();
  
  // Tab and Dialog states
  const [activeTab, setActiveTab] = useState('checklist');
  const [bookOpen, setBookOpen] = useState(false);

  // Book Appointment form states
  const [selectedDocIndex, setSelectedDocIndex] = useState('0');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('09:00 AM');

  // Add Reminder states
  const [newReminderText, setNewReminderText] = useState('');

  const appointments = patient.appointments || [];
  const reminders = patient.followUpReminders || [];
  const improvingMode = patient.improvingMode || false;

  // Toggle reminder status
  const handleToggleReminder = (reminderId: string) => {
    const updatedReminders = reminders.map((r) =>
      r.id === reminderId ? { ...r, completed: !r.completed } : r
    );
    updatePatient(patient.id, { followUpReminders: updatedReminders });
    
    const reminder = reminders.find((r) => r.id === reminderId);
    if (reminder) {
      toast.success(reminder.completed ? 'Task reopened' : 'Task completed', {
        description: `"${reminder.text}" status updated.`,
      });
    }
  };

  // Add new reminder
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;

    const newReminder: FollowUpReminder = {
      id: `REM-${Math.floor(1000 + Math.random() * 8999)}`,
      patientId: patient.id,
      text: newReminderText,
      completed: false,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 2 days out
    };

    updatePatient(patient.id, {
      followUpReminders: [...reminders, newReminder],
    });

    toast.success('Reminder added', {
      description: `Added: "${newReminderText}"`,
    });
    setNewReminderText('');
  };

  // Book appointment
  const handleBookAppointment = () => {
    if (!apptDate) {
      toast.error('Date required', {
        description: 'Please select a date for the appointment.',
      });
      return;
    }

    const doc = MOCK_DOCTORS[parseInt(selectedDocIndex, 10)];
    const newAppointment: Appointment = {
      id: `APT-${Math.floor(10000 + Math.random() * 89999)}`,
      patientId: patient.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      date: apptDate,
      time: apptTime,
      clinic: doc.hospital,
    };

    updatePatient(patient.id, {
      appointments: [...appointments, newAppointment],
    });

    toast.success('Appointment Scheduled', {
      description: `Confirmed with ${doc.name} for ${apptDate} at ${apptTime}.`,
    });

    setBookOpen(false);
    setApptDate('');
  };

  // Toggle Improving / Recovery mode
  const handleToggleRecovery = (checked: boolean) => {
    if (checked) {
      // BACKUP current vitals & history to localStorage
      const backupData = {
        current: patient.current,
        history: patient.history,
      };
      localStorage.setItem(`upchar-backup-${patient.id}`, JSON.stringify(backupData));

      // Normal recovery baseline values
      const recoveredVitals = {
        heartRate: 72,
        spo2: 98,
        temperature: 36.8,
        systolic: 120,
        diastolic: 80,
        respiratoryRate: 16,
        activity: 60,
        sleep: 7.2,
        glucose: patient.current.glucose != null ? 92 : undefined, // Keep glucose only if patient had it
      };

      // Create a smooth recovery timeline by appending stable data points
      const recoveryReading = {
        timestamp: new Date().toISOString(),
        ...recoveredVitals,
      };

      updatePatient(patient.id, {
        improvingMode: true,
        current: recoveredVitals,
        history: [...patient.history, recoveryReading],
      });

      toast.success('Recovery simulation initiated', {
        description: 'Vitals returning to normal baseline levels. Risk score updated.',
        icon: <TrendingDown className="h-4 w-4 text-emerald-500" />,
      });
    } else {
      // Toggle OFF: Restore previous settings from backup
      const backupStr = localStorage.getItem(`upchar-backup-${patient.id}`);
      if (backupStr) {
        try {
          const backup = JSON.parse(backupStr);
          updatePatient(patient.id, {
            improvingMode: false,
            current: backup.current,
            history: backup.history,
          });
          localStorage.removeItem(`upchar-backup-${patient.id}`);
        } catch (e) {
          // Fallback restore to defaults if backup parsed incorrectly
          restoreDeterioratedDefaults();
        }
      } else {
        restoreDeterioratedDefaults();
      }

      toast.success('Recovery simulation terminated', {
        description: 'Restored patient to previous diagnostic vitals.',
        icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
      });
    }
  };

  // Fallback defaults for Aarav Sharma or others
  const restoreDeterioratedDefaults = () => {
    let defaultCurrent = patient.current;
    let defaultHistory = patient.history;

    if (patient.id === 'PT-10482') {
      const hasREP003 = patient.medicalReports?.some((r) => r.id === 'REP-003');
      defaultCurrent = {
        heartRate: 94,
        spo2: 94,
        temperature: 37.7,
        systolic: 142,
        diastolic: 90,
        respiratoryRate: 22,
        activity: 35,
        sleep: 5.0,
        glucose: hasREP003 ? 158 : undefined,
      };
      
      // Trim to original 9 history items + optional 1 item from report ingestion
      const count = hasREP003 ? 10 : 9;
      defaultHistory = patient.history.slice(0, count);
    }

    updatePatient(patient.id, {
      improvingMode: false,
      current: defaultCurrent,
      history: defaultHistory,
    });
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Stethoscope className="h-4 w-4 text-primary" />
            Care Plan & Simulation
          </CardTitle>
          <CardDescription className="text-xs">
            Manage upcoming consultations and checklist tasks
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="checklist" className="text-xs py-1.5">
                Checklist
              </TabsTrigger>
              <TabsTrigger value="appointments" className="text-xs py-1.5">
                Visits
              </TabsTrigger>
              <TabsTrigger value="simulation" className="text-xs py-1.5">
                Simulator
              </TabsTrigger>
            </TabsList>

            {/* Checklist Tab */}
            <TabsContent value="checklist" className="space-y-3">
              <form onSubmit={handleAddReminder} className="flex gap-2">
                <Input
                  placeholder="Add new clinical follow-up task..."
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                  className="text-xs h-8"
                />
                <Button type="submit" size="sm" className="h-8 text-xs shrink-0 gap-1">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </form>

              {reminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border rounded-lg border-dashed">
                  <CheckSquare className="h-6 w-6 text-muted-foreground/45 mb-1.5" />
                  <span className="text-xs font-medium text-muted-foreground">All checklists cleared</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors ${
                        reminder.completed ? 'bg-muted/40 text-muted-foreground line-through border-muted/50' : 'bg-card'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={reminder.completed}
                        onChange={() => handleToggleReminder(reminder.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer shrink-0"
                      />
                      <div className="flex-1 truncate pr-1">
                        <span className="font-semibold text-foreground">{reminder.text}</span>
                        {reminder.dueDate && !reminder.completed && (
                          <span className="ml-2 inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded px-1 py-0 shrink-0">
                            <Clock className="h-2 w-2" />
                            Due: {reminder.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Scheduled Consultations
                </span>
                
                {/* Book Consultation Dialog */}
                <Dialog open={bookOpen} onOpenChange={setBookOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1 text-[10px] h-7 px-2">
                      <PlusCircle className="h-3 w-3" /> Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
                        <Calendar className="h-4.5 w-4.5 text-primary" />
                        Schedule Clinical Consultation
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Book a follow-up or diagnostic check for this patient.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 text-xs">
                      <div className="space-y-1">
                        <Label htmlFor="doctor-select" className="text-xs">Select Practitioner</Label>
                        <Select value={selectedDocIndex} onValueChange={setSelectedDocIndex}>
                          <SelectTrigger id="doctor-select" className="text-xs h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_DOCTORS.map((doc, idx) => (
                              <SelectItem key={idx} value={idx.toString()} className="text-xs">
                                {doc.name} ({doc.specialty})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="appt-date" className="text-xs">Appointment Date</Label>
                          <Input
                            type="date"
                            id="appt-date"
                            value={apptDate}
                            onChange={(e) => setApptDate(e.target.value)}
                            className="text-xs h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="appt-time" className="text-xs">Appointment Time</Label>
                          <Select value={apptTime} onValueChange={setApptTime}>
                            <SelectTrigger id="appt-time" className="text-xs h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                              <SelectItem value="10:30 AM">10:30 AM</SelectItem>
                              <SelectItem value="11:45 AM">11:45 AM</SelectItem>
                              <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                              <SelectItem value="03:30 PM">03:30 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" size="sm" onClick={() => setBookOpen(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleBookAppointment}>
                        Confirm Booking
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border rounded-lg border-dashed">
                  <Calendar className="h-6 w-6 text-muted-foreground/45 mb-1.5" />
                  <span className="text-xs font-medium text-muted-foreground">No visits scheduled</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {appointments.map((appt) => (
                    <div key={appt.id} className="p-2.5 rounded-lg border bg-card space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-foreground">{appt.doctorName}</span>
                        <span className="text-[10px] font-semibold text-primary px-1.5 py-0.25 bg-primary/10 rounded">
                          {appt.specialty}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground space-y-0.5">
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {appt.date} at {appt.time}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {appt.clinic}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Simulation Tab */}
            <TabsContent value="simulation" className="space-y-3.5">
              <div className="rounded-lg bg-slate-50 border p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-emerald-500" />
                      Intervention Simulation
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-normal max-w-[200px]">
                      Toggle recovery mode to simulate treatment intervention response.
                    </p>
                  </div>
                  <Switch checked={improvingMode} onCheckedChange={handleToggleRecovery} />
                </div>

                <div className="border-t pt-2 text-[10px] leading-relaxed text-muted-foreground space-y-1.5">
                  <div className="flex gap-1.5 items-start">
                    <Info className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>Recovery Effect:</strong> Triggers vitals normalization, updates the trend curve in charts, and drops the risk score to <span className="font-bold text-emerald-600">28 (Low Risk)</span>.
                    </p>
                  </div>
                  {improvingMode && (
                    <div className="flex gap-1.5 items-center text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-md p-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>Recovery Mode Active (Stable Vitals Simulated)</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
    </Card>
  );
}
