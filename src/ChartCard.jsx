import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Check, X } from "lucide-react";
import moment from "moment";

const ChartCard = ({ chart }) => {
  if (!chart) return null;

  const formattedDate = moment(chart.dateTaken).format("MMMM D, YYYY");

  const behaviorsByCategory = chart.behaviors.reduce((acc, behavior) => {
    if (!acc[behavior.category]) {
      acc[behavior.category] = [];
    }
    acc[behavior.category].push(behavior);
    return acc;
  }, {});

  const behaviorDescriptions = chart.behaviorsDescription.reduce((acc, desc) => {
    acc[desc.descriptionType.replace(/_/g, " ")] = desc.response;
    return acc;
  }, {});

  return (
    <Card className="p-4 w-full shadow-lg">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Behavior Chart for {chart.patientName}</h2>
        
        {/* Behaviors Table */}
        <h3 className="text-lg font-semibold mb-2">Behaviors</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="font-bold">Category</TableCell>
              <TableCell className="font-bold">Log</TableCell>
              <TableCell className="font-bold">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(behaviorsByCategory).map(([category, behaviors]) => (
              behaviors.map((behavior, index) => (
                <TableRow key={behavior.behavior}>
                  {index === 0 && (
                    <TableCell rowSpan={behaviors.length} className="font-semibold align-middle">{category}</TableCell>
                  )}
                  <TableCell>{behavior.behavior}</TableCell>
                  <TableCell>{behavior.status === "Yes" ? <Check className="text-green-500" /> : <X className="text-red-500" />}</TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
        
        {/* Behavior Description Table */}
        <h3 className="text-lg font-semibold mt-6 mb-2">Behavior Description</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="font-bold">Date</TableCell>
              <TableCell className="font-bold">Outcome</TableCell>
              <TableCell className="font-bold">Trigger</TableCell>
              <TableCell className="font-bold">Behavior Description</TableCell>
              <TableCell className="font-bold">Care Giver Intervention</TableCell>
              <TableCell className="font-bold">Reported Provider And Careteam</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{formattedDate}</TableCell>
              <TableCell>{behaviorDescriptions["Outcome"]}</TableCell>
              <TableCell>{behaviorDescriptions["Trigger"]}</TableCell>
              <TableCell>{behaviorDescriptions["Behavior Description"]}</TableCell>
              <TableCell>{behaviorDescriptions["Care Giver Intervention"]}</TableCell>
              <TableCell>{behaviorDescriptions["Reported Provider And Careteam"]}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
