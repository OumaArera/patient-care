import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import dayjs from "dayjs";

const MedAdmin = ({ meds }) => {
    const today = dayjs().format("YYYY-MM-DD");
    const [adminData, setAdminData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(today);
    const [lateReason, setLateReason] = useState("");
    console.log("Admin Data: ", adminData);
    console.log("Late Reason: ", lateReason);
    console.log("Selected Date: ", selectedDate);
        
    const handleStatusChange = (medicationId, medicationTime, status) => {
        setAdminData((prev) => {
        const updatedData = prev.filter(
            (entry) => !(entry.medicationId === medicationId && entry.medicationTime === medicationTime)
        );
        return [...updatedData, { medicationId, medicationTime, status }];
        });
    };

    const isFutureTime = (time) => {
        return dayjs(`${selectedDate} ${time}`).isAfter(dayjs());
    };

    const handleSubmit = (medicationId) => {
        const submission = adminData.filter((entry) => entry.medicationId === medicationId);
        console.log("Submitting data:", submission);
    };

    return (
        <div className="grid gap-4 p-4">
        <div>
            <label className="block font-semibold">Select Date:</label>
            <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1"
            />
        </div>
        {dayjs(selectedDate).isBefore(today) && (
            <div>
            <label className="block font-semibold">Reason for Late Filing:</label>
            <Input
                type="text"
                value={lateReason}
                onChange={(e) => setLateReason(e.target.value)}
                placeholder="Enter reason for late filing"
                className="mt-1"
            />
            </div>
        )}
        {meds.responseObject.map((med) => (
            <Card key={med.medicationId}>
            <CardHeader>
                <h2 className="text-lg font-semibold">{med.medicationName} ({med.medicationCode})</h2>
                <p className="text-sm text-gray-500">Patient: {med.patientFirstName} {med.patientLastName}</p>
            </CardHeader>
            <CardContent>
                <p><strong>Instructions:</strong> {med.instructions}</p>
                <p><strong>Quantity:</strong> {med.quantity}</p>
                <p><strong>Diagnosis:</strong> {med.diagnosis}</p>
                <div className="mt-2 space-y-2">
                {med.medicationTime.map((time) => (
                    <div key={time} className="flex items-center gap-4">
                    <p className="w-20">{time}</p>
                    <Select onValueChange={(value) => handleStatusChange(med.medicationId, time, value)}>
                        <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="administered" disabled={isFutureTime(time)}>Administered</SelectItem>
                        <SelectItem value="not-administered">Not Administered</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                ))}
                </div>
                <Button
                className="mt-4"
                onClick={() => handleSubmit(med.medicationId)}
                disabled={med.medicationTime.some((time) => isFutureTime(time))}
                >
                Submit
                </Button>
            </CardContent>
            </Card>
        ))}
        </div>
    );
};

export default MedAdmin;
