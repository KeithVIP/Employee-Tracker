USE employee_db;
INSERT INTO department(dept_name)
VALUES 
('Sales'),
('Legal'),
('Engineering'),
('Finance'),
('Logistics'),
('Customer Support'),
('Human Resources');

INSERT INTO roles(title, salary, department_id)
VALUES
('Sales Lead', 100000, 2),
('Legal Team Lead', 200000, 2),
('Head Engineer', 200000, 2),
('Head of Financial', 250000, 2),
('Logistics Team Coordinator', 150000, 2),
('Customer Interfacing Lead', 100000, 2),
('HR Head', 150000, 2);

INSERT INTO employees(first_name, last_name, role_id, manager_id)
VALUES 
  ('Ronald', 'Firbank', 5, 1),
  ('Virginia', 'Woolf', 2, 6),
  ('Piers', 'Gaveston', 7, 0),
  ('Charles', 'LeRoi', 2, 3),
  ('Katherine', 'Mansfield', 8, 12),
  ('Dora', 'Carrington', 9, 10),
  ('Edward', 'Bellamy', 4, 11);