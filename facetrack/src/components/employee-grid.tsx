import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

export function EmployeeGrid() {
  const employees = [
    {
      name: "Alex Johnson",
      id: "EMP001",
      department: "Engineering",
      position: "Senior Developer",
      status: "Active",
    },
    {
      name: "Sarah Williams",
      id: "EMP042",
      department: "Marketing",
      position: "Marketing Manager",
      status: "Active",
    },
    {
      name: "Michael Brown",
      id: "EMP023",
      department: "Finance",
      position: "Financial Analyst",
      status: "Active",
    },
    {
      name: "Emily Davis",
      id: "EMP067",
      department: "HR",
      position: "HR Specialist",
      status: "Active",
    },
    {
      name: "David Wilson",
      id: "EMP089",
      department: "Engineering",
      position: "Frontend Developer",
      status: "Active",
    },
    {
      name: "Jessica Taylor",
      id: "EMP102",
      department: "Product",
      position: "Product Manager",
      status: "Active",
    },
    {
      name: "Robert Martinez",
      id: "EMP054",
      department: "Sales",
      position: "Sales Representative",
      status: "Active",
    },
    {
      name: "Jennifer Garcia",
      id: "EMP076",
      department: "Customer Support",
      position: "Support Specialist",
      status: "Active",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {employees.map((employee) => (
        <Card key={employee.id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative h-40 bg-gradient-to-r from-primary/20 to-primary/30">
              <div className="absolute bottom-0 left-0 right-0 flex items-end p-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-background bg-background">
                  <Image
                    src={`/placeholder.svg?height=64&width=64&text=${employee.name.charAt(0)}`}
                    alt={employee.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="icon" className="rounded-full bg-background/50">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-1">
              <h3 className="font-semibold">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.position}</p>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="flex w-full justify-between">
              <span className="text-xs text-muted-foreground">{employee.department}</span>
              <span className="text-xs text-muted-foreground">{employee.id}</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
