import { DataTypes, Model } from 'sequelize';
import util from 'util';
import connectToDB from './src/db.js';

const db = await connectToDB('postgresql:///employees');

class Department extends Model {
  [util.inspect.custom]() {
    return this.toJSON();
  }
}

Department.init(
  {
    deptCode: {
      type: DataTypes.STRING(5),
      primaryKey: true,
    },
    deptName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
    },
  },
  {
    modelName: 'department',
    sequelize: db,
  },
);

class Employee extends Model {
  [util.inspect.custom]() {
    return this.toJSON();
  }
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'CA',
    },
    salary: {
      type: DataTypes.INTEGER,
    },
  },
  {
    modelName: 'employee',
    sequelize: db,
  },
);

// Define relationships
Department.hasMany(Employee, { foreignKey: 'deptCode' });
Employee.belongsTo(Department, { foreignKey: 'deptCode' });

// Create all tables (drop if already exist)
await db.sync({ force: true });

// Create objects and add to tables
const legal = await Department.create({ deptCode: 'legal', deptName: 'Legal', phone: '555-2222' });
const mktg = await Department.create({
  deptCode: 'mktg',
  deptName: 'Marketing',
  phone: '555-9999',
});
const fin = await Department.create({ deptCode: 'fin', deptName: 'Finance', phone: '555-1000' });

const liz = await Employee.create({ name: 'Liz', deptCode: 'legal', salary: 100000 });
const leonard = await Employee.create({ name: 'Leonard', deptCode: 'legal', salary: 90000 });
const maggie = await Employee.create({
  name: 'Maggie',
  deptCode: 'mktg',
  salary: 70000,
  state: 'UT',
});
const nadine = await Employee.create({ name: 'Nadine', state: 'AZ' });

async function showPhoneDirectory() {
  const emps = await Employee.findAll();

  // Can't use await inside a for loop, so use forEach
  emps.forEach(async (emp) => {
    const dept = await emp.getDepartment();
    if (dept) {
      console.log(emp.name, dept.deptName, dept.phone);
    } else {
      console.log(emp.name, '-', '-');
    }
  });
}

// showPhoneDirectory();

async function showPhoneDirectoryEager() {
  const emps = await Employee.findAll({ include: Department });
  // now the department will come with each employee!

  for (const emp of emps) {
    const dept = emp.department;
    if (dept) {
      console.log(emp.name, dept.deptName, dept.phone);
    } else {
      console.log(emp.name, '-', '-');
    }
  }
}

console.log('Phone directory:');
showPhoneDirectoryEager();

export { Department, Employee };
