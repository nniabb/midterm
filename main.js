const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const expensesFilePath = 'expenses.json';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('home', {expenses: expenses}); 
});

 
let expenses = [];

if (fs.existsSync(expensesFilePath)) {
  const fileContent = fs.readFileSync(expensesFilePath, 'utf8');
  if (fileContent.trim() !== '') {
    expenses = JSON.parse(fileContent)
  }
} else {
  fs.writeFileSync(expensesFilePath, '[]')
}

app.use(express.json());

app.get('/expenses', (req, res) => {
    res.json(expenses);
});

app.get('/expenses/:id', (req, res) => {
    const id = req.params.id;
    const expense = expenses.find(expense => expense.id === Number(id));
    if (!expense) {
        res.status(404).json({ success: false })
    } else {
        res.json(expense);
    }
});

app.post('/expenses', (req, res) => {
    const { name, cost } = req.body;
    const newId = expenses.length > 0 ? expenses[expenses.length - 1].id + 1 : 1;
    const newExpense = { id: newId, name, cost, createdAt: new Date() };
    expenses.push(newExpense);
    saveExpensesToFile();
    res.status(201).json({ success: true, newExpense });
});

app.put('/expenses/:id', (req, res) => {
    const id = req.params.id;
    const { name, cost } = req.body;
    const expenseIndex = expenses.findIndex(expense => expense.id === Number(id));
    if (expenseIndex !== -1) {
        expenses[expenseIndex] = { ...expenses[expenseIndex], name, cost };
        saveExpensesToFile();
        res.json({ success: true, updatedExpense: expenses[expenseIndex] });
    } else {
        res.status(404).json({ success: false, message: 'not found' });
    }
});

app.delete('/expenses/:id', (req, res) => {
    const id = req.params.id;
    const index = expenses.findIndex(expense => expense.id === Number(id));
    if (index !== -1) {
        expenses.splice(index, 1);
        saveExpensesToFile();
        res.json({ success: true, message: 'deleted successfully' });
    } else {
        res.status(404).json({ success: false, message: 'not found' });
    }
});

function saveExpensesToFile() {
    fs.writeFileSync(expensesFilePath, JSON.stringify(expenses, null, 2), 'utf8');
}

app.listen(port, () => {
    console.log(`App Started At http://localhost:${port}`);
});