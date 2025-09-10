/ Setup an in-memory SQLite database for the demo
// This makes it easy to run without a separate database file.
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQLite database.');
  
  // Create a users table and insert some data
  db.serialize(() => {
    db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)');
    db.run("INSERT INTO users (username, password, role) VALUES ('admin', 'password123', 'administrator')");
    db.run("INSERT INTO users (username, password, role) VALUES ('alice', 'alice_secret', 'user')");
  });
});

// A simple login form
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
      <h1>Login</h1>
      <form action="/login" method="POST">
        <div style="margin-bottom: 10px;">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" style="width: 200px; padding: 5px;">
        </div>
        <div style="margin-bottom: 10px;">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" style="width: 200px; padding: 5px;">
        </div>
        <button type="submit">Log In</button>
      </form>
      <p style="margin-top: 20px;">Try to log in as 'admin'. The injection string is in the comments!</p>
      <!-- 
        Injection Example for the Username field: 
        admin' -- 
      -->
    </div>
  `);
});

// The vulnerable login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // ######################################################################
  // ### VULNERABILITY HIGHLIGHTED HERE ###
  // ######################################################################
  //
  // The line below is the source of the SQL injection vulnerability.
  // It constructs a SQL query by directly embedding user-provided strings (`username` and `password`)
  // into the query. An attacker can provide a specially crafted string to change the query's logic.
  //
  // For example, if a user enters `admin' -- ` as the username, the query becomes:
  // SELECT * FROM users WHERE username = 'admin' -- ' AND password = 'some_password'
  //
  // In SQL, `--` starts a comment. The database executes `SELECT * FROM users WHERE username = 'admin'`,
  // completely ignoring the password check. This allows the attacker to log in as 'admin'
  // without knowing the password.
  //
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  //
  // ######################################################################
  
  console.log(`Executing vulnerable query: ${sql}`);

  db.get(sql, [], (err, row) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (row) {
      res.send(`<h1>Welcome, ${row.username}!</h1><p>Your role is: <strong>${row.role}</strong></p><a href="/">Go back</a>`);
    } else {
      res.send('<h1>Login Failed</h1><p>Invalid username or password.</p><a href="/">Try again</a>');
