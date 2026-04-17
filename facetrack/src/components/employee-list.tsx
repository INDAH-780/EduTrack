export function EmployeeList() {
  return (
    <div className="overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Position</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {[
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
          ].map((employee) => (
            <tr
              key={employee.id}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <td className="p-4 align-middle font-medium">{employee.name}</td>
              <td className="p-4 align-middle">{employee.id}</td>
              <td className="p-4 align-middle">{employee.department}</td>
              <td className="p-4 align-middle">{employee.position}</td>
              <td className="p-4 align-middle">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                  {employee.status}
                </span>
              </td>
              <td className="p-4 align-middle">
                <div className="flex items-center gap-2">
                  <button className="text-xs text-primary underline">Edit</button>
                  <button className="text-xs text-destructive underline">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
