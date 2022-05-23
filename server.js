const mysql = require("mysql");
const inquirer = require("inquirer");
const PORT = process.env.PORT || 3001;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Soulfonik",
  database: "employee_db",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected to the employee Tracker App");
  employeePrompt();
});

const mainPrompt = [
  {
    name: "action",
    type: "list",
    message: "Select an action",
    choices: [
      "View Departments",
      "View Roles",
      "View Employees",
      "Add Department",
      "Add Role",
      "Add Employee",
      "Edit Employee",
      "EXIT",
    ],
  },
];

function employeePrompt() {
  inquirer.prompt(mainPrompt).then(function (answer) {
    if (answer.action == "View Departments") {
      viewDept();
    } else if (answer.action == "View Roles") {
      viewRoles();
    } else if (answer.action == "View Employees") {
      viewEmployees();
    } else if (answer.action == "Add Department") {
      addDept();
    } else if (answer.action == "Add Role") {
      addRole();
    } else if (answer.action == "Add Employee") {
      addEmployee();
    } else if (answer.action == "Edit Employee") {
      editEmployee();
    } else if (answer.action == "EXIT") {
      exit();
    }
  });
}

function viewDept() {
  let query = "SELECT department.dept_name AS departments FROM department;";

  db.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    employeePrompt();
  });
}

function viewRoles() {
  let query =
    "SELECT roles.title, roles.salary, department.dept_name AS department FROM roles INNER JOIN department ON department.id = roles.department_id;";

  db.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    employeePrompt();
  });
}

function viewEmployees() {
  let query =
    "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name AS department, employees.manager_id " +
    "FROM employees " +
    "JOIN roles ON roles.id = employees.role_id " +
    "JOIN department ON roles.department_id = department.id " +
    "ORDER BY employees.id;"
    ;
  db.query(query, function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      if (res[i].manager_id == 0) {
        res[i].manager = "None"
      // } else {
      //   res[i].manager =
      //     res[res[i].manager_id - 1].first_name +
      //     " " +
      //     res[res[i].manager_id - 1].last_name;
      // };
      // delete res[i].manager_id;
      }
    };
    console.table(res);
    employeePrompt();
  });
};

function addDept() {
  let query = "SELECT department.dept_name FROM department;";
  db.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);

    let addDeptPrompt = [
      {
        name: "new_department",
        type: "input",
        message: "Enter a new department.",
      },
    ];

    inquirer.prompt(addDeptPrompt).then(function (answer) {
      console.log(answer);

      let query = "INSERT INTO department SET ?";
      db.query(
        query,
        {
          dept_name: answer.new_department,
        },
        function (err, res) {
          if (err) throw err;
        }
      );

      let addagainPrompt = [
        {
          name: "again",
          type: "list",
          message: "Would you like to add another department?",
          choices: ["Yes", "No"],
        },
      ];

      inquirer.prompt(addagainPrompt).then(function (answer) {
        let query = "SELECT department.dept_name FROM department";
        db.query(query, function (err, res) {
          if (err) throw err;
          if (answer.again == "Yes") {
            addDept();
          } else if (answer.again == "No") {
            console.table(res);
            employeePrompt();
          }
        });
      });
    });
  });
}

function addRole() {
  let query1 =
    "SELECT roles.title AS roles, roles.salary, department.dept_name FROM roles INNER JOIN department ON department.id = roles.department_id;";
  let query2 = "SELECT department.dept_name FROM department";
  db.query(query1, function (err, res) {
    if (err) throw err;
    console.table(res);
    db.query(query2, function (err, res) {
      if (err) throw err;
      let departmentList = res;
      let addRolePrompt = [
        {
          name: "add_role",
          type: "input",
          message: "Enter new company role.",
        },
        {
          name: "add_salary",
          type: "input",
          message: "Enter salary for this role.",
        },
        {
          name: "select_department",
          type: "list",
          message: "Select department.",

          choices: function () {
            departments = [];

            for (i = 0; i < departmentList.length; i++) {
              const roleId = i + 1;
              departments.push(roleId + ": " + departmentList[i].dept_name);
            }
            departments.unshift("0: No");
            return departments;
          },
        },
      ];

      inquirer.prompt(addRolePrompt).then(function (answer) {
        if (answer.select_department == "0: No") {
          employeePrompt();
        } else {
          console.log(answer);
          let query = "INSERT INTO roles SET ?";
          db.query(
            query,
            {
              title: answer.add_role,
              salary: answer.add_salary,
              department_id: parseInt(answer.select_department.split(":")[0]),
            },
            function (err, res) {
              if (err) throw err;
            }
          );

          let addagainPrompt = [
            {
              name: "again",
              type: "list",
              message: "Would you like to add another role?",
              choices: ["Yes", "No"],
            },
          ];
          inquirer.prompt(addagainPrompt).then(function (answer) {
            let query =
              "SELECT roles.id, roles.title AS roles, roles.salary, department.dept_name FROM roles INNER JOIN department ON department.id = roles.department_id;";
            db.query(query, function (err, res) {
              if (err) throw err;
              if (answer.again == "Yes") {
                addRole();
              } else if (answer.again == "No") {
                console.table(res);
                employeePrompt();
              }
            });
          });
        }
      });
    });
  });
}

function addEmployee() {
  let query = "SELECT title FROM roles";
  let query2 =
    "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
    "FROM employees " +
    "JOIN roles ON roles.id = employees.role_id " +
    "JOIN department ON roles.department_id = department.id " +
    "ORDER BY employees.id;";
  db.query(query, function (err, res) {
    if (err) throw err;

    let rolesList = res;
    db.query(query2, function (err, res) {
      if (err) throw err;
      for (i = 0; i < res.length; i++) {
        if (res[i].manager_id == 0) {
          res[i].manager = "None";
        // } else {
        //   res[i].manager =
        //     res[res[i].manager_id - 1].first_name +
        //     " " +
        //     res[res[i].manager_id - 1].last_name;
        }
         delete res[i].manager_id;
      }
      console.table(res);

      let managerList = res;
      let addEmpPrompt = [
        {
          name: "first_name",
          type: "input",
          message: "Enter employee's first name.",
        },
        {
          name: "last_name",
          type: "input",
          message: "Enter employee's last name.",
        },
        {
          name: "select_role",
          type: "list",
          message: "Select employee's role.",

          choices: function () {
            roles = [];
            for (i = 0; i < rolesList.length; i++) {
              const roleId = i + 1;
              roles.push(roleId + ": " + rolesList[i].title);
            }

            roles.unshift("0: No");
            return roles;
          },
        },
        {
          name: "select_manager",
          type: "list",
          message: "Select employee's manager",

          choices: function () {
            managers = [];

            for (i = 0; i < managerList.length; i++) {
              const mId = i + 1;

              managers.push(
                mId +
                  ": " +
                  managerList[i].first_name +
                  " " +
                  managerList[i].last_name
              );
            }
            managers.unshift("0: None");
            managers.unshift("E: No");
            return managers;
          },

          when: function (answers) {
            return answers.select_role !== "0: No";
          },
        },
      ];

      inquirer.prompt(addEmpPrompt).then(function (answer) {
        if (
          answer.select_role == "0: No" ||
          answer.select_manager == "E: No"
        ) {
          employeePrompt();
        } else {
          console.log(answer);
          let query = "INSERT INTO employees SET ?";
          db.query(
            query,
            {
              first_name: answer.first_name,
              last_name: answer.last_name,
              role_id: parseInt(answer.select_role.split(":")[0]),
              manager_id: parseInt(answer.select_manager.split(":")[0]),
            },
            function (err, res) {
              if (err) throw err;
            }
          );

          let addagainPrompt = [
            {
              name: "again",
              type: "list",
              message: "Would you like to add another employee?",
              choices: ["Yes", "No"],
            },
          ];

          inquirer.prompt(addagainPrompt).then(function (answer) {
            let query =
              "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
              "FROM employees " +
              "JOIN roles ON roles.id = employees.role_id " +
              "JOIN department ON roles.department_id = department.id " +
              "ORDER BY employees.id;";
            db.query(query, function (err, res) {
              if (err) throw err;
              if (answer.again == "Yes") {
                addEmployee();
              } else if (answer.again == "No") {
                for (i = 0; i < res.length; i++) {
                  if (res[i].manager_id == 0) {
                    res[i].manager = "None";
                  // } else {
                  //   res[i].manager =
                  //     res[res[i].manager_id - 1].first_name +
                  //     " " +
                  //     res[res[i].manager_id - 1].last_name;
                  }
                  delete res[i].manager_id;
                }
                console.table(res);
                employeePrompt();
              }
            });
          });
        }
      });
    });
  });
}

function editEmployee() {
  let query = "SELECT title FROM roles";
  let query2 =
    "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
    "FROM employees " +
    "JOIN roles ON roles.id = employees.role_id " +
    "JOIN department ON roles.department_id = department.id " +
    "ORDER BY employees.id;";
  db.query(query, function (err, res) {
    if (err) throw err;
    let rolesList = res;
    db.query(query2, function (err, res) {
      if (err) throw err;
      for (i = 0; i < res.length; i++) {
        if (res[i].manager_id == 0) {
          res[i].manager = "None";
        // } else {
        //   res[i].manager =
        //     res[res[i].manager_id - 1].first_name +
        //     " " +
        //     res[res[i].manager_id - 1].last_name;
        }
        delete res[i].manager_id;
      }

      console.table(res);
      let employeeList = res;
      let addEmpPrompt = [
        {
          name: "select_employee",
          type: "list",
          message: "Select employee to edit",

          choices: function () {
            employees = [];

            for (i = 0; i < employeeList.length; i++) {
              const mId = i + 1;

              employees.push(
                mId +
                  ": " +
                  employeeList[i].first_name +
                  " " +
                  employeeList[i].last_name
              );
            }
            employees.unshift("0: No");
            return employees;
          },
        },
      ];

      inquirer.prompt(addEmpPrompt).then(function (answer) {
        if (answer.select_employee == "0: No") {
          employeePrompt();
        } else {
          let empSelect = answer.select_employee.split(":")[0];
          let empPropPrompt = [
            {
              name: "select_role",
              type: "list",
              message: "Edit employee role",

              choices: function () {
                roles = [];

                for (i = 0; i < rolesList.length; i++) {
                  const roleId = i + 1;
                  roles.push(roleId + ": " + rolesList[i].title);
                }
                roles.unshift("0: No");
                return roles;
              },
            },
            {
              name: "select_manager",
              type: "list",
              message: "Edit employee manager",

              choices: function () {
                managers = [];
                for (i = 0; i < employeeList.length; i++) {
                  const mId = i + 1;
                  if (
                    answer.select_employee.split(": ")[1] !==
                    employeeList[i].first_name + " " + employeeList[i].last_name
                  ) {
                    managers.push(
                      mId +
                        ": " +
                        employeeList[i].first_name +
                        " " +
                        employeeList[i].last_name
                    );
                  }
                }
                managers.unshift("0: None");
                managers.unshift("E: No");
                return managers;
              },

              when: function (answers) {
                return answers.select_role !== "0: No";
              },
            },
          ];
          inquirer.prompt(empPropPrompt).then(function (answer) {
            if (
              answer.select_role == "0: No" ||
              answer.select_manager == "E: No"
            ) {
              employeePrompt();
            } else {
              console.log(answer);
              let query =
                "UPDATE employees SET ? WHERE employees.id = " + empSelect;
              db.query(
                query,
                {
                  role_id: parseInt(answer.select_role.split(":")[0]),
                  manager_id: parseInt(answer.select_manager.split(":")[0]),
                },
                function (err, res) {
                  if (err) throw err;
                }
              );

              let addagainPrompt = [
                {
                  name: "again",
                  type: "list",
                  message: "Would you like to add another employee?",
                  choices: ["Yes", "No"],
                },
              ];

              inquirer.prompt(addagainPrompt).then(function (answer) {
                let query =
                  "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
                  "FROM employees " +
                  "JOIN roles ON roles.id = employees.role_id " +
                  "JOIN department ON roles.department_id = department.id " +
                  "ORDER BY employees.id;";
                db.query(query, function (err, res) {
                  if (err) throw err;
                  if (answer.again == "Yes") {
                    editEmployee();
                  } else if (answer.again == "No") {
                    for (i = 0; i < res.length; i++) {
                      if (res[i].manager_id == 0) {
                        res[i].manager = "None";
                      // } else {
                      //   res[i].manager =
                      //     res[res[i].manager_id - 1].first_name +
                      //     " " +
                      //     res[res[i].manager_id - 1].last_name;
                      }
                      delete res[i].manager_id;
                    }
                    console.table(res);
                    employeePrompt();
                  }
                });
              });
            }
          });
        }
      });
    });
  });
}

function exit() {
  db.end();
  console.log("Disconnected");
}
