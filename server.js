const mysql = require('mysql');
const inquirer = require('inquirer');
require("console.table");

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3301,
    user: 'root',
    password: 'Soulfonik',
    database: 'employeedb'
});

connection.connect(function (err) {


    if (err) throw err;
    console.log("Employee Tracker App");

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
            "EXIT"
            
        ]
        
    }

];

function employeePrompt() {
   
    inquirer.prompt(mainPrompt)
    
    .then(function(answer) {

        if(answer.action == "View Departments") {
            
            viewDept();
        
        }else if(answer.action == "View Roles") {

            viewRoles();

        }else if(answer.action == "View Employees") {

            viewEmployees();

        }else if(answer.action == "Add Department") {

            addDept();
            
        }else if(answer.action == "Add Role") {

            addRole();
 
        }else if(answer.action == "Add Employee") {

            addEmployee();

        }else if(answer.action == "Edit Employee") {

            editEmployee();

        }else if(answer.action == "EXIT") {

            exit();

        };
        

    });    

};
