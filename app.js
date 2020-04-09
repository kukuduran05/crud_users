var express = require('express');
const bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();
var path = require('path');
//var indexRoutes = require('./routes/index');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

///
///	Create connection to MySQL database server.
/// 
function getMySQLConnection() {
	return mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : '',
	  database : 'eval_tec'
	});
}

///
/// Use pug as templating engine. Pug is renamed jade.
///
//set up routes directory
//app.use('/', indexRoutes);
// Views and Template Engine
//app.set('views', __dirname + './views');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', function(req, res) {
    respuesta = {
     error: true,
     codigo: 200,
     mensaje: 'Punto de inicio accede a /person'
    };
    res.render('home', { })
    res.send(respuesta);
   });

///
/// HTTP Method	: GET
/// Endpoint 	: /person
/// 
/// To get collection of person saved in MySQL database.
///
app.get('/person', function(req, res) {
	var personList = [];

	// Connect to MySQL database.
	var connection = getMySQLConnection();
	connection.connect();

	// Do the query to get data.
	connection.query('SELECT usuarios.*, (SELECT nombre FROM roles where roles.id = usuarios.rol) as tipoRol FROM usuarios', function(err, rows, fields) {
	  	if (err) {
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"});
	  	} else {
              console.log(rows);
	  		// Loop check on each row
	  		for (var i = 0; i < rows.length; i++) {
	  			// Create an object to save current row's data
		  		var person = {
                    'id':rows[i].id,
                    'nick':rows[i].nick,
                    'nombre':rows[i].nombre,
                    'apellidos':rows[i].apellidos,
		  			'password':rows[i].password,
		  			'rol':rows[i].rol,
                    'correo':rows[i].correo,
                    'rol':rows[i].tipoRol,
		  		}
		  		// Add object into array
		  		personList.push(person);
	  	}
	  	// Render index.pug page using array 
	  	res.render('index', {"personList": personList});
	  	}
	});

	// Close the MySQL connection
	connection.end();
	
});


///
/// HTTP Method	: GET
/// Endpoint 	: /roles
/// 
/// To get collection of roles saved in MySQL database.
///
app.get('/roles', function(req, res) {
	var rolesList = [];

	// Connect to MySQL database.
	var connection = getMySQLConnection();
	connection.connect();

	// Do the query to get data.
	connection.query('SELECT * FROM roles', function(err, rows, fields) {
	  	if (err) {
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"});
	  	} else {
	  		// Loop check on each row
	  		for (var i = 0; i < rows.length; i++) {
	  			// Create an object to save current row's data
		  		var rol = {
                    'id':rows[i].id,
                    'nombre':rows[i].nombre,
		  		}
		  		// Add object into array
		  		rolesList.push(rol);
	  	}
        
        res.render('roles', {"rolesList": rolesList});
	  	}
	});

	// Close the MySQL connection
	connection.end();
});


///
/// HTTP Method	: POST
/// Endpoint 	: /person
/// 
/// To get collection of person saved in MySQL database.
///
// View from new
app.get('/new', function(req, res){
    var rolesList = [];
    // Connect to MySQL database.
	var connection = getMySQLConnection();
    connection.connect();
    connection.query('SELECT * FROM roles', (err, rows) => {
        if (err) {
            res.status(500).json({"status_code":500, "status_message": "internal server error"});
        } else {
            // Loop check on each row
            for (var i = 0; i < rows.length; i++) {
                // Create an object to save current row's data
                var rol = {
                  'id':rows[i].id,
                  'nombre':rows[i].nombre,
                }
                // Add object into array
                rolesList.push(rol);
            }
        }
        res.render('new', {"rolesList": rolesList});
    });
    
});

app.post('/person', function(req, res){ 
    // Connect to MySQL database
    var connection = getMySQLConnection();
    connection.connect();

    const data = req.body;

    //Do the query to post data.
    connection.query('INSERT INTO usuarios SET ? ', data, (err, user) => {
        res.redirect('/person')
    });

});

///
/// HTTP Method	: DELETE
/// Endpoint	: /person/:id
/// 
/// To delete specific data of person based on their identifier.
///
// View from edit
app.get('/delete/:id', function(req, res){
    const { id } = req.params;
    // Connect to MySQL database.
	var connection = getMySQLConnection();
    connection.connect();
    connection.query('SELECT * FROM usuarios where id = ?', [id], (err, rows) => {
        if (err) {
            res.status(500).json({"status_code":500, "status_message": "internal server error"});
        }
        res.render('delete', {"usuario": rows[0]});
    });
});

app.post('/delete/:id', function(req, res){
    const { id } = req.params;
    // Connect to MySQL database.
	var connection = getMySQLConnection();
    connection.connect();
    connection.query('DELETE FROM usuarios WHERE id = ?', [id], (err, rows) => {
        res.redirect('/person')
    });
});



// View from edit
app.get('/edit/:id', function(req, res){
    const { id } = req.params;
    var usuariosList = [];
    // Connect to MySQL database.
	var connection = getMySQLConnection();
    connection.connect();
    connection.query('SELECT usuarios.*, (SELECT roles.nombre FROM roles WHERE usuarios.rol=roles.id) as rolName FROM usuarios where id = ?', [id], (err, rows) => {
        if (err) {
            res.status(500).json({"status_code":500, "status_message": "internal server error"});
        }
        console.log(rows[0]);
        res.render('edit', {"usuario": rows[0]});
    });
});

///
/// HTTP Method	: UPDATE
/// Endpoint	: /person/:id
/// 
/// To update specific data of person based on their identifier.
///
app.post('/person/:id', function(req, res){
    const { id } = req.params;
    const newCustomer = req.body;
    // Connect to MySQL database.
	var connection = getMySQLConnection();
    connection.connect();
    connection.query('UPDATE usuarios set ? where id = ?', [newCustomer, id], (err, rows) => {
        res.redirect('/person');
    });
});

///
/// HTTP Method	: GET
/// Endpoint	: /person/:id
/// 
/// To get specific data of person based on their identifier.
///
app.get('/person/:id', function(req, res) {
	// Connect to MySQL database.
	var connection = getMySQLConnection();
    connection.connect();
    
	// Do the query to get data.
	connection.query('SELECT * FROM usuarios WHERE id = ' + req.params.id, function(err, rows, fields) {
		var person;
	  	if (err) {
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"});
	  	} else {
	  		// Check if the result is found or not
	  		if(rows.length==1) {
	  			// Create the object to save the data.
	  			var person = {
		  			'id':rows[0].id,
		  			'nick':rows[0].nick,
                    'nombre':rows[0].nombre,
                    'apellidos':rows[0].apellidos,
                    'password':rows[0].password,
                    'rol':rows[0].rol,
                    'correo':rows[0].correo,
		  		}
                // render the details.plug page.
		  		res.render('details', {"person": person});
	  		} else {
	  			// render not found page
	  			res.status(404).json({"status_code":404, "status_message": "Not found"});
	  		}
	  	}
	});

	// Close MySQL connection
	connection.end();
});

///
/// Start the app on port 3000
/// The endpoint should be: 
/// List/Index 	: http://localhost:3000/person
/// Details 	: http://localhost:3000/person/2
///
app.listen(3000, function () {
    console.log('listening on port', 3000);
});