
 var mysql = require('mysql');

 var env = process.env.NODE_ENV || 'development';
 var config = require("../../config/config.js")[env];
 var db = config.database;

 module.exports = {
	// ATMOSPHERE apis

	// Data from old database schema: indoor_location
	getAtmosphereOldDb: function(req, res){
		var parameters = req.allParams();

		var con = mysql.createConnection(db);

		con.connect(function(err){
			if(err){
				console.log('Error connecting to db');
				console.log(err);
				return;
			}
			console.log('Connection to db established');
			console.log('Number of parameters: ',Object.keys(parameters).length);
			// If no parameters in the request.
			if(Object.keys(parameters).length === 0){
				console.log('No parameters in the request');

				//execute view from mysql db to show relevant atmosphere data
				con.query('SELECT * FROM indoor_location.view_atm_data;',function(err,rows,fields){
					if(err) throw err;

					console.log('Data received from db\n');
				  	//console.log(rows);
				  	for (var i = 0; i < rows.length; i++) {
				  		console.log(rows[i].id);
				  	};
				  	res.send(rows);

				  	con.end(function(err) {
					  	// The connection is terminated gracefully
					  	// Ensures all previously enqueued queries are still
					  	// before sending a COM_QUIT packet to the MySQL server.
					  	console.log('Connection to db terminated')
					  });
				  });
			}
	  		//If parameters in the request
	  		else{
	  			console.log('Params in the request: ',parameters);
	  			// If the parameters are correct in the request (building and floor)
	  			if(Object.keys(parameters).indexOf('building') !== -1 && Object.keys(parameters).indexOf('floor') !== -1){
	  				var building = req.param('building')
	  				building = building.replace('_',' ');
	  				console.log('\nBUILDING: ',building);
	  				var floor = req.param('floor');
	  				console.log('\nFLOOR',floor);
	  				//execute view from mysql db to show relevant atmosphere data
	  				con.query("SELECT * FROM indoor_location.view_atm_data WHERE (bu_name='"+building+"' AND loc_floor="+floor+");",function(err,rows,fields){
	  					if(err) throw err;

	  					console.log('Data received from db\n');
					  	//console.log(rows);
					  	for (var i = 0; i < rows.length; i++) {
					  		console.log(rows[i].id);
					  	};
					  	res.send(rows);

					  });
	  			}
	  			else if(Object.keys(parameters).indexOf('time') !== -1){
	  				var date = req.param('time')
	  				var time = new Date(date);	
	  				console.log('\nHUM',time)
	  				con.query("SELECT * FROM indoor_location.view_atm_data WHERE (atm_check_moment= " + time + ");", function(err, rows, fields){
	  					if(err) throw err;

	  					console.log('Data received from db\n');

	  					for (var i=0; i <rows.length; i++){
	  						console.log(rows[i].id);
	  					};
	  					res.send(rows);
	  				});

	  			}
	  			else{
	  				console.log('Incorrect parameters in the request.');
	  				res.send('Incorrect parameters in the request. Remember to include building and floor.');
	  			}
	  			con.end(function(err) {
				  	// The connection is terminated gracefully
				  	// Ensures all previously enqueued queries are still
				  	// before sending a COM_QUIT packet to the MySQL server.
				  	console.log('Connection to db terminated')
				  });
	  		}
	  	});
},

 	 getAtmosphere: function(req,res){
 	 	var parameters = req.allParams();

 	 	var con = mysql.createConnection(db);

 	 	con.connect(function(err){
 	 		if(err){
 	 			console.log('Error connecting to db');
 	 			console.log(err);
 	 			return;
 	 		}
 	 		console.log('Connection to db established');
 	 		console.log('Number of parameters: ',Object.keys(parameters).length);
			// If no parameters in the request.
			if(Object.keys(parameters).length === 0 || (Object.keys(parameters).length === 1 && Object.keys(parameters).indexOf('values') !== -1)){
				console.log('No parameters in the request or only values parameter');

				//execute view from mysql db to show relevant atmosphere data
				con.query('SELECT * FROM indoor_location_db.view_atm_data ORDER BY atm_check_moment DESC;',function(err,rows,fields){
					if(err) throw err;

					console.log('Data received from db\n');
				  	//console.log(rows);
				  	
				  	con.end(function(err) {
					  	// The connection is terminated gracefully
					  	// Ensures all previously enqueued queries are still
					  	// before sending a COM_QUIT packet to the MySQL server.
					  	console.log('Connection to db terminated')
					  });
				  	if(Object.keys(parameters).indexOf('values') === -1 || req.param('values') !== "last"){
				  		res.send(rows);
				  	}
				  	else if(req.param('values') == "last"){
							// Show only last value for each iBeacon
							var rows_last_values = [];
							var beacon_ids_array = [];
							for(var i = 0 ; i<rows.length ; i++){
								if(beacon_ids_array.indexOf(rows[i].b_id) == -1){
									rows_last_values.push(rows[i]);
									beacon_ids_array.push(rows[i].b_id);
								}
							}
							// console.log("beacons:",beacon_ids_array);
							res.send(rows_last_values);
						}
					});
			}
	  		//If parameters in the request
	  		else{
	  			console.log('Params in the request: ',parameters);
	  			// If the parameters are correct in the request (building and floor)
	  			if(Object.keys(parameters).indexOf('building') !== -1 && Object.keys(parameters).indexOf('floor') !== -1){
	  				var building = req.param('building')
	  				building = building.replace('_',' ');
	  				console.log('\nBUILDING: ',building);
	  				var floor = req.param('floor');
	  				console.log('\nFLOOR: ',floor);
	  				//execute view from mysql db to show relevant atmosphere data
	  				con.query("SELECT * FROM indoor_location_db.view_atm_data WHERE (bu_name='"+building+"' AND loc_floor="+floor+") ORDER BY atm_check_moment DESC;",function(err,rows,fields){
	  					if(err) throw err;

	  					console.log('Data received from db and ordered by time (DESC)\n');
					  	// console.log(rows[0].atm_id);
					  	con.end(function(err) {
					  	// The connection is terminated gracefully
					  	// Ensures all previously enqueued queries are still
					  	// before sending a COM_QUIT packet to the MySQL server.
					  	console.log('Connection to db terminated')
					  });
					  	if(Object.keys(parameters).indexOf('values') === -1 || req.param('values') !== "last"){
					  		res.send(rows);
					  	}
					  	else if(req.param('values') == "last"){
							// Show only last value for each iBeacon
							var rows_last_values = [];
							var beacon_ids_array = [];
							for(var i = 0 ; i<rows.length ; i++){
								if(beacon_ids_array.indexOf(rows[i].b_id) == -1){
									rows_last_values.push(rows[i]);
									beacon_ids_array.push(rows[i].b_id);
								}
							}
							// console.log("beacons:",beacon_ids_array);
							res.send(rows_last_values);
						}
					});
}
else{
	console.log('Incorrect parameters in the request.');
	con.end(function(err) {
				  	// The connection is terminated gracefully
				  	// Ensures all previously enqueued queries are still
				  	// before sending a COM_QUIT packet to the MySQL server.
				  	console.log('Connection to db terminated')
				  });
	res.send('Incorrect parameters in the request. Remember to include building and floor.');
}
}
});
},
};
